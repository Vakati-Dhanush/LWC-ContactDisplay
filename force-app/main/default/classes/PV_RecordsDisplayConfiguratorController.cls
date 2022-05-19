public with sharing class PV_RecordsDisplayConfiguratorController {
    
    @AuraEnabled(cacheable=true)
    public static Map<String, String>  getSobjectFields(String sObjectName)
    {
        String selectedSobject = sObjectName.removeEnd(' ');
        Schema.DescribeSObjectResult selectedSobjectResult ;
        Map<String, String> fieldApiNameTolabelMap = new Map<String, String>();
        for(Schema.SObjectType currSobject : Schema.getGlobalDescribe().values())
        {
            Schema.DescribeSObjectResult sobjectResult = currSobject.getDescribe();
            String sObjectLabel = sobjectResult.getLabel();
            if(sObjectLabel == selectedSobject)
            {
                selectedSobjectResult = sobjectResult;
                break;
            }
        }
        
        for(Schema.sObjectField currfield :selectedSobjectResult.fields.getMap().values())
        {
            Schema.DescribeFieldResult currFieldResult  = currfield.getDescribe();
            if(!currFieldResult.isAccessible()) continue;
            fieldApiNameTolabelMap.put(currFieldResult.getName(), currFieldResult.getlabel());
        }
        
        if(fieldApiNameTolabelMap.size() > 0 )   return fieldApiNameTolabelMap;
        
        return null;
            
    }
    
    @AuraEnabled(cacheable=true)
    public static List<String> returnSelectedFields(String sObjectName)
    {
        String sObjectSelectedFields = PV_RecordDisplayerSetting__mdt.getInstance(sObjectName).FieldNames__c;
        List<String> selectedFields = sObjectSelectedFields.split(',');
        return selectedFields;
    }
    @AuraEnabled
    public static String storeSelectedFields(String sObjectName, List<String> selectedFields)
    {
        String result;
        try{
            PV_RecordDisplayerMetadataUpdator.updateCustomMetadata(sObjectName, selectedFields);
            result = 'Success';
            return result;
        }
        catch(Exception exp)
        {
            result = 'Exception Occured '+ exp;
            return result;
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<SObject> getSobjectRecords(String sObjectName, List<String> selectedFields)
    {
        System.debug('Fields for records fetch '+ selectedFields);
        String fields = String.join(selectedFields, ', ');
        fields.removeEnd(', ');
        String  query = 'SELECT Id, '+fields+' FROM '+ sObjectName  + ' ORDER BY Name LIMIT 10';
        List<SObject> sobjectsList = Database.query(query);
        
        if(sobjectsList.size()> 0)return sobjectsList;
        
        return null;
    }
}