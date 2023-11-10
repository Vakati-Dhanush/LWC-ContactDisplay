import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import { refreshApex } from '@salesforce/apex';
import { subscribe, unsubscribe, onError } from 'lightning/empApi';
import getCommissionsData from '@salesforce/apex/EvergreenContractSettingController.getCommissionsData';
import upsertCommissionData from '@salesforce/apex/EvergreenContractSettingController.upsertCommissionData';
import getContractTypes from '@salesforce/apex/EvergreenContractSettingController.getContractTypes';

const columns = [
    { label: 'Plan Year', fieldName: 'PlanYear__c', type: 'text', sortable: true, cellAttributes: { alignment: 'center' } },
    { label: 'Contract Type', fieldName: 'ContractType__c', type: 'text', sortable: true, cellAttributes: { alignment: 'center' } },
    {
        label: 'Initial Year Commission', fieldName: 'InitialYearCommission__c', type: 'currency',
        cellAttributes: { alignment: 'center' }, typeAttributes: { currencyCode: 'USD' }, currencyDisplayAs: 'code'
    },
    {
        label: 'Renewal Year Commission', fieldName: 'RenewalYearCommission__c', type: 'currency',
        cellAttributes: { alignment: 'center' }, typeAttributes: { currencyCode: 'USD' }
    },
    {
        label : 'Created Date', fieldName:'CreatedDate__c', type: 'date', cellAttributes: { alignment: 'center' }
    },
    {
        label : 'Created By', fieldName:'CreatedBy__c', type: 'text', cellAttributes: { alignment: 'center' }
    },
    {
        label : 'Last Modified By', fieldName:'LastModifiedBy__c', type: 'text', cellAttributes: { alignment: 'center' }
    },
    {
        label : 'Last Modified Date', fieldName:'SystemModstamp', type: 'date', cellAttributes: { alignment: 'center' }
    },
    {
        type: "button",
        fixedWidth: 150,
        typeAttributes: {
            label: 'Edit',
            name: 'edit',
            variant: 'brand'
        }
    }
];


export default class EvergreenContractSettingManager extends LightningElement {

    columns = columns;// data table columns information
    channelName = '/event/Custom_Communication_Event__e';//Platform event configured to communicate upsert information 

    @track displayData = [];//Data to be displyed to user based on list View or Search
    @track displaySpinner = false;
    label = "MA Broker Commission Rates";
    commissionSettingDataReturned;// property to store wire retunred info, utilized to perform apex refresh
    contractTypeOptions = [];//Contract type options in combobox 
    planYearOptions = []; //Plan years type options in combobox
    developerNameToCommissionSettingMap = new Map(); //Commission setting Developer name to data map
    commissionInfo = []; //Variable to hold the data if any update/insert happens
    listViewOptions = [{ label: 'All', value: 'All' }];//List view options to display commission settings based on Plan Year
    selectedListView = 'All';//Stores change in list view 
    searchInput = '';//Store change in Search
    isModalOpen = false;//Boolean to specify when to open New/Edit modal 
    isEdit = false;//boolean to store if edit
    sortDirection = 'asc';
    sortBy;
    
    //Wire to retirve information of Commission setting
    @wire(getCommissionsData)
    commissionData(value) {
        this.commissionSettingDataReturned = value;
        const { data, error } = value;
        if (data) {
            this.commissionInfo = [...data];
            this.displayData = this.filterDisplayRecords(null, this.selectedListView, this.commissionInfo);
            this.developerNameToCommissionSettingMap = this.formKeyToCustomSettingMap(this.commissionInfo);
        }
        else if (error) {
            console.log('Error in fetching data from apex' + error);
        }
    }

    //Function to create drop down data for Plan year, Contract types
    connectedCallback() {
        let todayDate = new Date();
        getContractTypes().
            then(data => {
                this.contractTypeOptions = data;
            }).catch(error => {
                console.log('Error while forming contract type options ' + error);
            })
        let currentYear = (todayDate.getFullYear()).toString();
        let succeedingYear = (todayDate.getFullYear() + 1).toString();
        let precedingYear = (todayDate.getFullYear() - 1).toString();
        let yearsList = [precedingYear, currentYear, succeedingYear];
        this.listViewOptions = this.formListViewOptions(this.listViewOptions, yearsList);
        this.planYearOptions = this.formListViewOptions(this.planYearOptions, yearsList);
    }

    //function to form drop down label and value
    formListViewOptions(optionsList, optionsData) {
        optionsData.forEach(item => {
            optionsList.push({ value: item, label: item });
        });
        return optionsList;
    }

    //forms map of commission setting developer name to commission setting info
    formKeyToCustomSettingMap(commissionInfo) {
        let keyToSettingMap = new Map();
        commissionInfo.forEach(item => {
            keyToSettingMap.set(item.DeveloperName, item);
        })
        return keyToSettingMap;
    }

    //Change in search is tracked and stored
    handleSearch(event) {
        this.searchInput = event.target.value;
        let searchKey = this.searchInput.toUpperCase();
        if (this.searchInput) {
            this.displayData = this.filterDisplayRecords(searchKey, this.selectedListView, this.commissionInfo);
        }
        else {
            this.displayData = this.filterDisplayRecords(null, this.selectedListView, this.commissionInfo);
        }
    }

    handleListViewChange(event) {
        let currListView = event.target.value;
        this.selectedListView = currListView;
        if (currListView === 'All') {
            this.displayData = this.commissionInfo;
        }
        else {
            this.displayData = this.filterDisplayRecords(null, currListView, this.commissionInfo);
        }

    }

    filterDisplayRecords(searchKey, listviewSelection, existingData) {
        let updatedData = [];
        if (searchKey && listviewSelection) {
            updatedData = existingData.filter(item => {
                if (listviewSelection === 'All') {
                    if (item.PlanYear__c.includes(searchKey) || item.ContractType__c.toUpperCase().includes(searchKey)) {
                        return item;
                    }
                }
                else if (item.PlanYear__c === listviewSelection) {
                    if (item.PlanYear__c.includes(searchKey) || item.ContractType__c.toUpperCase().includes(searchKey)) {
                        return item;
                    }
                }
            });
        }
        else if (listviewSelection) {
            if (listviewSelection === 'All') {
                updatedData = existingData;
            }
            else {
                updatedData = existingData.filter(item => item.PlanYear__c === listviewSelection);
            }

        }

        return updatedData;
    }

    handleNew() {
        this.isModalOpen = true;
        this.isEdit = false;
        let childCmp = this.template.querySelector('c-evergreen-contract-setting-configurator');
        childCmp.prePopulateFields(null);
    }

    handleEdit(event) {
        let selectedSetting = event.detail.row;
        this.isModalOpen = true;
        this.isEdit = true;
        let childCmp = this.template.querySelector('c-evergreen-contract-setting-configurator');
        childCmp.prePopulateFields(selectedSetting);
    }

    handleCloseModal(event) {
        this.isModalOpen = event.detail;
    }

    async handleNewCustomSetting(event) {
        this.displaySpinner = true;
        let newCommissionSettingPayload = event.detail;
        let newCommissionSetting = JSON.parse(newCommissionSettingPayload);
        let isExistingSetting = this.checkIfExisting(newCommissionSetting);

        if (isExistingSetting && !this.isEdit) {
            this.displayToastNotification('Record exists', 'Existing record found. Please update it', 'error');
            this.displaySpinner = false;
            return;
        }
        else {
            await upsertCommissionData({ commissionSettingPayload: newCommissionSettingPayload }).
                then(data => {
                    if (data === 'Success') {
                        this.registerErrorListener();
                        this.handleSubscribe();
                    }
                }).
                catch(error => {
                    console.log('Error on saving Custom Metadata Record ' + error);
                    this.displayToastNotification('Error Occured', 'Error on saving Commission Rate custom metadata record', 'error');
                    this.displaySpinner = false;
                })
        }
    }

    handleSubscribe() {
        // Callback invoked whenever a new event message is received
        const callback = response => {
            var obj = JSON.parse(JSON.stringify(response));
            let objData = obj.data.payload;
            let platformEventInfo = objData.Message__c;
            if (platformEventInfo === 'Success') {
                this.displayToastNotification('Record save successfull', 'Commission setting saved sucessfully', 'success');
                this.closeModal();
                this.getlatestData();
                this.displayData = this.filterDisplayRecords(null, this.selectedListView, this.commissionInfo);
            }
            else {
                this.displayToastNotification('Error Occured', platformEventInfo, 'error');
                this.displaySpinner = false;
            }
        }

        // Invoke subscribe method of empApi. Pass reference to messageCallback
        subscribe(this.channelName, -1, callback).then(response => {
            // Response contains the subscription information on subscribe call
            console.log('Subscription request sent to: ', JSON.stringify(response.channel));
        });
    }

    //handle Error
    registerErrorListener() {
        onError(error => {
            console.log('Received error from server: ', JSON.stringify(error));
        });
    }

    checkIfExisting(newCommissionSetting) {
        let isExistingSetting = false;
        if (this.developerNameToCommissionSettingMap.has(newCommissionSetting.DeveloperName)) {
            isExistingSetting = true;
            return isExistingSetting;
        }
        else {
            return isExistingSetting;
        }
    }

    getlatestData() {
        return refreshApex(this.commissionSettingDataReturned);
    } 

    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.displayData));
        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };
        // cheking reverse direction
        let isReverse = direction === 'asc' ? 1: -1;
        // sorting data
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';
            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });
        this.displayData = parseData;
    }
    
    closeModal() {
        let childCmp = this.template.querySelector('c-evergreen-contract-setting-configurator');
        childCmp.closeModal();
        this.displaySpinner = false;
    }

    displayToastNotification(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}