public with sharing class PV_AsyncUtil {

    public static void handleMessagesAsynchronously(String messageType, List<String> messages)
    {
        String message = JSON.serialize(messages);
 		publishEvent(messageType, message,'MESSAGE_ARRAY');

    }

    public static void handleMessageAsynchronously(String messageType, String message)
    {
        publishEvent(messageType, message,'SINGLE_MESSAGE');
    }
    

    private static void publishEvent(String messageType, String message, String messageCategory)
    {
        PV_AsyncMessageChannel__e messageEvent = new PV_AsyncMessageChannel__e ();
        messageEvent.PV_Message__c = message;
        messageEvent.PV_MessageType__c = messageType;
        messageEvent.PV_Category__c = messageCategory;
        
        Database.SaveResult result = EventBus.publish(messageEvent);
        
        if (!result.isSuccess()) 
        {
            Database.Error error = result.getErrors()[0];
            System.debug('Error occured ' + error.getStatusCode() +' ' + error.getMessage());
            throw new PV_Exception('Error happened while publishing event');
        } 
    }
    
}