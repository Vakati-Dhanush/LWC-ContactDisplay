public class CustomMetadataUpdator implements Metadata.DeployCallback{
    
    public customMetadataUpdator()
    {
        
    }
    
    public customMetadataUpdator(String metadataName, SObject customMetadataInfo)
    {
        Set<String> restrictedFields = new Set<String>{'NamespacePrefix', 'Language', 'QualifiedApiName','SystemModstamp', 'Id', 'Label'};
        
        Map<String, String> fieldToValueMap = new Map<String, String>();
        String developerName ;
        String masterLabel ;
        for(Schema.SObjectField currFieldMetadata : Schema.getGlobalDescribe().get(metadataName).getDescribe().fields.getMap().values())
        {
            String fieldAPIName = currFieldMetadata.getDescribe().getName();
            if(fieldAPIName == 'DeveloperName')
            {
                developerName = String.valueOf(customMetadataInfo.get(fieldAPIName));
            }
            else if (fieldAPIName == 'MasterLabel')
            {
                masterLabel = String.valueOf(customMetadataInfo.get(fieldAPIName));
            }
            else
            {
                if(restrictedFields.contains(fieldAPIName)) continue;
                String fieldValue = String.valueOf(customMetadataInfo.get(fieldAPIName));
                fieldToValueMap.put(fieldAPIName, fieldValue);
            }
        }        
        upsertCustomMetadata(metadataName,developerName, masterLabel, fieldToValueMap);
    }
    
    public static void upsertCustomMetadata(String metadataName,String developerName, String masterLabel, Map<String, String> metadataFieldValueMap)
    {
        Set<String> dateTimeFields = new Set<String>{'CreatedDate__c'};
        
        Metadata.CustomMetadata customMetadata = new Metadata.CustomMetadata();
        customMetadata.fullName = metadataName + '.' + developerName;
        customMetadata.label = masterLabel;
        
        for(String key : metadataFieldValueMap.keySet()){
            Metadata.CustomMetadataValue metadataInfo = new Metadata.CustomMetadataValue();
            if(dateTimeFields.contains(key))
            {
                metadataInfo.Field = key;
                metadataInfo.Value = DateTime.valueOf(metadataFieldValueMap.get(key)); 
            }
            else
            {
                metadataInfo.Field = key;
                metadataInfo.Value = metadataFieldValueMap.get(key); 
            }
            
            customMetadata.values.add(metadataInfo);
        }
        
        Metadata.DeployContainer mdContainer = new Metadata.DeployContainer();
        mdContainer.addMetadata(customMetadata);
        CustomMetadataUpdator callback = new CustomMetadataUpdator();
        Id jobId = Metadata.Operations.enqueueDeployment(mdContainer, callback);
        
    }
    
    public void handleResult(Metadata.DeployResult result, Metadata.DeployCallbackContext context) {
        Custom_Communication_Event__e	 messageEvent = new Custom_Communication_Event__e();
        
        if (result.status == Metadata.DeployStatus.Succeeded) {
            messageEvent.Message__c = 'Success';
        } else {
            messageEvent.Message__c = result.details.componentFailures[0].problem;
        }
        Database.SaveResult publishResult = EventBus.publish(messageEvent);
    }
}