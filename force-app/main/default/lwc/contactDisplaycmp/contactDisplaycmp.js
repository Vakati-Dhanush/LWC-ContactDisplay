import { LightningElement, wire, api } from 'lwc';
import Name from '@salesforce/schema/Contact.Name';
import Email from '@salesforce/schema/Contact.Email';
import Phone from '@salesforce/schema/Contact.Phone';
import returnContacts from '@salesforce/apex/ContactDisplaycmpController.returnContacts';

const fields = [Name, Email, Phone];
export default class ContactDisplaycmp extends LightningElement {

    contacts = [];
    displayRecords = [];
    objectApiName = '';
    recordId = '';
    fieldNames = [];
    error;
    showModal = false;
    showRecords = false;

    connectedCallback() {
        this.showRecords = true;
        returnContacts()
            .then((results) => this.contacts = results)
            .then(result => this.displayRecords = result)
            .catch((error) => this.error = error);

        //this.wrapCards();
    }

    searchChange(event) {
        let searchString = event.target.value;
        let records = this.contacts;
        const displayRecords = records.filter(item => {
            if (item.Name.toLowerCase().includes(searchString)) {
                return item;
            }
        });

        this.displayRecords = displayRecords;
        //this.wrapCards();
    }

    recordEdit(event) {
        this.showModal = true;
        this.showRecords = false;
        this.objectApiName = 'Contact';
        let id = event.currentTarget.id;
        this.recordId = id.slice(0, -4);
        this.fieldNames = fields.map(field => field.fieldApiName);
    }

    handleValueChange(event) {
        this.showModal = false;
        this.showRecords = true;
        const returnedRecord = event.detail;
        let updateRecords = [];
        let totalRecords = [];
        totalRecords.push(returnedRecord);
        updateRecords.push(returnedRecord);

        try {
            this.displayRecords.forEach(item => {
                if (item.Id !== returnedRecord.Id) {
                    updateRecords.push(item);
                }
            });
            this.contacts.forEach(item => {
                if (item.Id !== returnedRecord.Id) {
                    totalRecords.push(item);
                }
            });

        }
        catch (error) {
            console.log(error);
        }

        this.displayRecords = updateRecords;
        this.contacts = totalRecords;
        console.log(JSON.stringify(this.displayRecords));

    }



    /*wrapCards() {
        if (this.displayRecords.length < 4) {
            document.getElementsByClassName('recordCard').className = "slds-size_1-of-2";
        }
        else {
            document.getElementsByClassName('recordCard').className = "slds-size_1-of-4";
        }
    }*/
}