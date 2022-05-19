@isTest
public class PV_TestAsyncMessageChannelTrigger {
    
    @isTest
    static void messageLoggerTest()
    {
        List<PV_AsyncMessageChannel__e> messageEvents = new List<PV_AsyncMessageChannel__e>();
        
        PV_AsyncMessageChannel__e messageEventSingle = PV_TestDataAsyncUtil.getAsyncMessageEvent('EventMesssages', 'APILog', 'SINGLE_MESSAGE');
        messageEvents.add(messageEventSingle);
        
        List<String> messageList = new List<String>{'Trigger Log', 'Callout Log', 'Test Log'};
        String message = JSON.serialize(messageList);
        PV_AsyncMessageChannel__e messageEventArray = PV_TestDataAsyncUtil.getAsyncMessageEvent(message, 'APILog', 'MESSAGE_ARRAY');
        messageEvents.add(messageEventArray);
        
        
        Test.startTest();        
        List<Database.SaveResult> result = EventBus.publish(messageEvents);
        Test.getEventBus().deliver();
        
        Test.stopTest();
    }
    
}