import { LightningElement } from 'lwc';
import getProfilePermissionDetails from '@salesforce/apex/ProfilePermissionController.getProfilePermissionDetails';
import updateProfilePermissions from '@salesforce/apex/ProfilePermissionController.updateProfilePermissions';
export default class ProfilePermissionConfigurator extends LightningElement {


    profileOptions = [];
    permissionSetOptions = [];
    permissionSetGRPOptions = [];
    existingProfilePermissionsMap = [];
    displaySearch = false;

    selectedProfileId = '';
    selectedProfileName = '';
    data = {};


    connectedCallback() {
        getProfilePermissionDetails().
            then(result => {
                this.profileOptions = this.updateSelectOptions(result.profileList, 'Name');
                this.displaySearch = true;
                this.permissionSetOptions = this.updateSelectOptions(result.permissionList, 'Label');
                this.permissionSetGRPOptions = this.updateSelectOptions(result.permissionGroupList, 'MasterLabel');
                this.existingProfilePermissionsMap = result.profilePermissionList;
                this.roleOptions = this.updateSelectOptions(result.rolesList, 'Name');

            }).
            catch(error => console.log(error));
    }

    updateSelectOptions(result, labelName) {
        let returnItems = [];

        returnItems = result.map(item => {
            return { value: item.Id, label: item[labelName] };
        });

        if (returnItems.length > 0) {
            return returnItems;
        }
    }


    onProfileSelection(event) {

        const profileId = event.detail.value;
        const profileName = event.detail.label;
        this.data['profileId'] = profileId;
        this.data['profileName'] = profileName;

        this.displaySelectedPermissions(event.detail.value);
    }

    displaySelectedPermissions(profileId) {

        let selectedPermissionSets = [];
        let selectedPermissionSetGrps = [];
        try {
            let existingPermissions ;
            this.existingProfilePermissionsMap.forEach(item => {
                if (item.PV_ProfileId__c === profileId) {
                    existingPermissions =  item;
                }
            });

            if (existingPermissions !== undefined )  {

                let permissions = existingPermissions.PV_PermissionSetIds__c;
                let permissionSetGrps = existingPermissions.PV_PermissionSetGroupIds__c;

                selectedPermissionSets = permissions !== undefined ? permissions.split(',') : null;
                selectedPermissionSetGrps = permissionSetGrps !== undefined ? permissionSetGrps.split(',') : null;

            } 

            let listboxDiv = this.template.querySelectorAll('c-global-dual-list-box-component');

            listboxDiv[0].getExistingSelectedValues(selectedPermissionSets);
            listboxDiv[1].getExistingSelectedValues(selectedPermissionSetGrps);

        }
        catch (error) {
            console.log(error);
        }


    }

    handleSave() {
        this.getUpdatedvalues();
        const parameter = JSON.stringify(this.data);
        console.log('parameter passed ' + parameter);
        updateProfilePermissions({ dataReceived: parameter })

    }


    getUpdatedvalues() {
        let listboxDiv = this.template.querySelectorAll('c-global-dual-list-box-component');
        try {
            listboxDiv[0].handleSave();
            listboxDiv[1].handleSave();
        }
        catch (error) {
            console.log(error);
        }
    }

    hanldePermissionSetSave(event) {
        let permissionSetNames = [];
        let permissionSetIds = [];
        let permissionSetsAdded = event.detail.valuesAdded;
        let permissionSetsRemoved = event.detail.valuesRemoved;
        console.log(JSON.stringify(permissionSetsAdded));
        console.log(JSON.stringify(permissionSetsRemoved));


        if (permissionSetsAdded.length > 0) {
            let permissionsets = this.splitLabelValues(permissionSetsAdded);
            permissionSetNames.push(...permissionsets.labelsList);
            permissionSetIds.push(...permissionsets.valuesList);
        }

        if (permissionSetsRemoved.length > 0) {

            let permissionsets = this.splitLabelValues(permissionSetsRemoved)
            permissionSetNames.push(...permissionsets.labelsList);
            permissionSetIds.push(...permissionsets.valuesList);
        }

        this.data['permissionSetNames'] = permissionSetNames;
        this.data['permissionSetIds'] = permissionSetIds;
    }

    handlePermissionSetGRPSave(event) {
        let permissionSetGRPNames = [];
        let permissionSetGRPIds = [];
        let permissionSetsGRPAdded = event.detail.valuesAdded;
        let permissionSetsGRPRemoved = event.detail.valuesRemoved;

        if (permissionSetsGRPAdded.length > 0) {
            let permissionsetGrp = this.splitLabelValues(permissionSetsGRPAdded);
            permissionSetGRPNames.push(...permissionsetGrp.labelsList);
            permissionSetGRPIds.push(...permissionsetGrp.valuesList);
        }

        if (permissionSetsGRPRemoved.length > 0) {
            let permissionsetGrp = this.splitLabelValues(permissionSetsGRPRemoved);
            permissionSetGRPNames = permissionsetGrp.labelsList;
            permissionSetGRPIds = permissionsetGrp.valuesList;
        }

        this.data['permissionSetGRPNames'] = permissionSetGRPNames;
        this.data['permissionSetGRPIds'] = permissionSetGRPIds;
    }

    splitLabelValues(objectList) {
        let labelsList = [];
        let valuesList = [];
        objectList.forEach(item => {
            labelsList.push(item.label);
            valuesList.push(item.value);
        });

        return { labelsList, valuesList };
    }


}