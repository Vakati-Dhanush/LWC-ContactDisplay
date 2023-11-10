import { LightningElement, api, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getRecord } from 'lightning/uiRecordApi';
import USER_Id from '@salesforce/user/Id';
import USER_NAME from '@salesforce/schema/User.Name';

const USER_FIELDS = [USER_NAME];
export default class EvergreenContractSettingConfigurator extends LightningElement {
  @api isEdit = false;
  @api contractTypeOptions = [];
  @api planYearOptions = [];
  @api isModalOpen = false;
  @api isLoading = false;

  currentUserId = USER_Id;
  patternMismatchMessage = "Please enter valid commission rate";
  label = "Create New Commission Rate";
  selectedPlanYear = "";
  selectedContractType = "";
  selectedContractKey = "";
  intialCommissionRateInput = 0;
  renewalCommissionRateInput = 0;
  createdBy = '';
  createdDateTime = new Date();

  @wire(getRecord, { recordId: '$currentUserId', fields: USER_FIELDS })
  userRecordInfo;

  handleContractTypeChange(event) {
    this.selectedContractType = event.target.options.find(opt => opt.value === event.target.value).label;
    this.selectedContractKey = event.target.value;
  }
  handlePlanYearChange(event) {
    this.selectedPlanYear = event.target.value;
  }
  handleIntialCommissionChange(event) {
    this.intialCommissionRateInput = event.target.value;
  }
  handleRenewalCommissionChange(event) {
    this.renewalCommissionRateInput = event.target.value;
  }

  handleSaveCommissionRate() {
    if (this.validateInputs()) {
      this.commissionSetting = this.upsertCommissionSettingData();
      this.returnDataToParent(
        "newcommissionsetting",
        JSON.stringify(this.commissionSetting)
      );
    }
  }

  async handleSaveNewCommissionRate() {
    this.handleSaveCommissionRate();

  }

  validateInputs() {
    let isValid = false;
    if (this.selectedContractKey && this.selectedPlanYear) {
      isValid = true;
    }
    else {
      this.displayToastNotification('Required fields missing', 'All fields are required to save commission rate', 'error');
    }

    return isValid;
  }

  upsertCommissionSettingData() {
    let updatedCommissionSetting = {};
    let finalLabel = this.selectedContractKey + "_" + this.selectedPlanYear.trim();
    updatedCommissionSetting.PlanYear__c = this.selectedPlanYear;
    updatedCommissionSetting.InitialYearCommission__c = this.intialCommissionRateInput;
    updatedCommissionSetting.RenewalYearCommission__c = this.renewalCommissionRateInput;
    updatedCommissionSetting.DeveloperName = finalLabel;
    updatedCommissionSetting.ContractType__c = this.selectedContractType;
    updatedCommissionSetting.MasterLabel = finalLabel;
    updatedCommissionSetting.CreatedDate__c = this.createdDateTime;

    if(this.isEdit)
    {
      updatedCommissionSetting.LastModifiedBy__c = this.userRecordInfo.data.fields.Name.value;
      updatedCommissionSetting.CreatedBy__c = this.createdBy;
    }
    else{
      updatedCommissionSetting.CreatedBy__c = this.userRecordInfo.data.fields.Name.value;
      updatedCommissionSetting.LastModifiedBy__c = this.userRecordInfo.data.fields.Name.value;
    }

    return updatedCommissionSetting;
  }

  @api
  closeModal() {
    this.isModalOpen = false;
    this.returnDataToParent("closemodal", false);
  }

  @api
  prePopulateFields(commissionSetting) {
    if (commissionSetting) {
      this.selectedPlanYear = commissionSetting.PlanYear__c;
      let contractKey = this.contractTypeOptions.filter(item => item.label ===  commissionSetting.ContractType__c)[0];
      this.selectedContractType = commissionSetting.ContractType__c;
      this.selectedContractKey = contractKey.value;
      this.intialCommissionRateInput = commissionSetting.InitialYearCommission__c;
      this.renewalCommissionRateInput = commissionSetting.RenewalYearCommission__c;
      this.createdDateTime = commissionSetting.CreatedDate__c;
      this.createdBy = commissionSetting.CreatedBy__c;
    } else {
      this.selectedPlanYear = "";
      this.selectedContractKey = "";
      this.intialCommissionRateInput = 0;
      this.renewalCommissionRateInput = 0;
      this.createdDateTime = new Date();
    }
  }

  displayToastNotification(title, message, variant) {
    const evt = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(evt);
  }

  returnDataToParent(eventName, data) {
    const event = new CustomEvent(eventName, {
      detail: data
    });
    this.dispatchEvent(event);
  }
}