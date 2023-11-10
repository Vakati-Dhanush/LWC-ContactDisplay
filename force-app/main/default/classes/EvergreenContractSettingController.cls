public  with sharing class EvergreenContractSettingController {
    public EvergreenContractSettingController() {
        
    }
    
    @AuraEnabled(cacheable=true)
    public static List<ContractTypeOption> getContractTypes()
    {
        List<ContractTypeOption> typeOptionsList = new List<ContractTypeOption>();
        for(Generic_UI_Element_Setting__mdt typeSetting : [SELECT UIValue__c, UIKey__c FROM Generic_UI_Element_Setting__mdt WHERE UIComponentName__c = 'Commission Setting Manager' WITH SECURITY_ENFORCED ORDER BY  UIKey__c])
        {
            ContractTypeOption typeOption = new ContractTypeOption();
            typeOption.label = typeSetting.UIValue__c;
            typeOption.value = typeSetting.UIKey__c;
            typeOptionsList.add(typeOption);
        }
        return typeOptionsList;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<EvergreenContractSetting__mdt>  getCommissionsData(){
        try {
            String currentYear = String.valueof(Date.today().year());
            String precedingYear = String.valueof(Date.today().year() - 1);
            String succeedingYear = String.valueof(Date.today().year() + 1);
            List<String> planYearsList = new List<String>{currentYear, precedingYear, succeedingYear};
                return [SELECT Id, label, MasterLabel,ContractType__c, DeveloperName, InitialYearCommission__c, PlanYear__c, RenewalYearCommission__c,SystemModstamp, CreatedBy__c, CreatedDate__c, LastModifiedBy__c FROM EvergreenContractSetting__mdt WHERE PlanYear__c IN :planYearsList WITH SECURITY_ENFORCED];
        } catch (Exception exp) {
            throw new AuraHandledException(exp.getMessage());
        }
    }
    
    @AuraEnabled
    public static String upsertCommissionData(String commissionSettingPayload){
        String response = '';
        try {
            
            SObject commissionSettingObj =  (Sobject) JSON.deserialize(commissionSettingPayload, EvergreenContractSetting__mdt.class);
            CustomMetadataUpdator updator = new customMetadataUpdator('EvergreenContractSetting__mdt', commissionSettingObj);
            response = 'Success';
            return response;
            
        } catch (Exception exp) {
            response = 'Error';
            throw new AuraHandledException(exp.getMessage());
        }
    }
    
    public class ContractTypeOption{
        @AuraEnabled public String value;
        @AuraEnabled public String label;
    }
}