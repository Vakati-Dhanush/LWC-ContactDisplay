import { LightningElement } from 'lwc';
import getQueueMembers from '@salesforce/apex/ConfigureQueueMembersController.getQueueMembers';
import updateQueueMembers from '@salesforce/apex/ConfigureQueueMembersController.updateQueueMembers';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QueueConfiguration extends LightningElement {

    queueToUsersMap = new Map();
    usersMap = new Map();

    queueOptions = [];
    userOptions = [];
    selectedQueueId = '';
    dataReceivedFlag = false;
    queueSelected = false;

    connectedCallback() {
        getQueueMembers().
            then(result => {
                this.usersMap = this.convertObjectToMap(result.usersMap);
                this.queueToUsersMap = this.convertObjectToMap(result.queueToUsersMap);

                return result;
            }).
            then(result => {
                this.queueOptions = this.updateSelectOptions(result.queueToUsersMap);
                this.userOptions = this.updateSelectOptions(result.usersMap);
                this.dataReceivedFlag = true;
            }).
            catch(error => console.log(error));
    }

    updateSelectOptions(result) {
        let returnItems = [];

        for (let key in result) {
            returnItems.push({ value: result[key].Id, label: result[key].Name });
        }
        if (returnItems.length > 0) {
            return returnItems;
        }
    }


    convertObjectToMap(obj) {
        const keys = Object.keys(obj);
        const map = new Map();
        for (let i = 0; i < keys.length; i++) {
            map.set(keys[i], obj[keys[i]]);
        };
        return map;
    }


    segregateQueueUsers(queueId) {

        let selectedQueue = this.queueToUsersMap.get(queueId).GroupMembers;
        let userIdList = [];
        selectedQueue.forEach(record => {
            userIdList.push(record.UserOrGroupId);
        });

        try {
            this.template.querySelector('c-queue-members-config').eventFromParent(userIdList);
        }
        catch (error) {
            console.log(error);
        }
    }



    returnValueSearch(event) {
        let returnedvalue = event.detail;
        this.selectedQueueId = returnedvalue.value;
        this.queueSelected = true;
        this.segregateQueueUsers(returnedvalue.value);
    }

    handleOptionsUpdate(event) {
        let usersAdded = event.detail.valuesAdded;
        let usersRemoved = event.detail.valuesRemoved;

        this.updateQueueMembersDatabase(usersAdded, usersRemoved, this.selectedQueueId);
    }

    updateQueueMembersDatabase(addedUsers, removedUsers, selectedQueueId) {
        updateQueueMembers({ usersAdded: addedUsers, usersRemoved: removedUsers, queueId: selectedQueueId }).
            then(result => {
                console.log(result.returnMessage);
                this.showNotification(result.returnMessage);
                return result;
            }).
            then(data  => {
                if(data.returnMessage === 'Success')
                {
                    let selectedQueue = this.queueToUsersMap.get(selectedQueueId).GroupMembers;
                    
                }
            }).
            catch(error => console.log(error));
    }

    showNotification(message) {
        let variant = '';
        if (message === 'Success') {
            variant = 'success';
        }
        else {
            variant = 'error';
        }

        const evt = new ShowToastEvent({
            title: 'Queue Update',
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}