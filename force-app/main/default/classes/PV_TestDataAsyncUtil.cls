public class PV_TestDataAsyncUtil {

    public static PV_AsyncMessageChannel__e getAsyncMessageEvent(String message, String messageType , String messageCategory)
    {
        PV_AsyncMessageChannel__e messageEvent = new PV_AsyncMessageChannel__e ();
        messageEvent.PV_Message__c = message;
        messageEvent.PV_MessageType__c = messageType;
        messageEvent.PV_Category__c = messageCategory;
        
        return messageEvent;
    }
}