public class PV_RecordDisplayerMetadataUpdator implements Metadata.DeployCallback{
    
    public static void updateCustomMetadata(String sobjectName, List<String> fieldsList)
    {
        String fields = String.join(fieldsList, ',');
        fields.removeEnd(',');
        Metadata.CustomMetadata customMetadata = new Metadata.CustomMetadata();
        customMetadata.fullName = 'PV_RecordDisplayerSetting__mdt.'+ sobjectName; //custom metadata name
        customMetadata.Label = sobjectName;
        Metadata.CustomMetadataValue customField1 = new Metadata.CustomMetadataValue(); //the values you're changing/updating
        customField1.field = 'FieldNames__c'; //the custom field API Name that you're wanting to insert/update a value of
        
        customField1.value = fields;
        
        customMetadata.values.add(customField1);
        
        Metadata.DeployContainer mdContainer = new Metadata.DeployContainer();
        mdContainer.addMetadata(customMetadata);
        PV_RecordDisplayerMetadataUpdator callback = new PV_RecordDisplayerMetadataUpdator();
        Id jobId = Metadata.Operations.enqueueDeployment(mdContainer, callback);
        
    }
    
    public void handleResult(Metadata.DeployResult result, Metadata.DeployCallbackContext context) {
        if (result.status == Metadata.DeployStatus.Succeeded) {
            System.debug('Success Result-' + result);
        } else {
            System.debug('Failed Result-' + result);
        }
    }
}