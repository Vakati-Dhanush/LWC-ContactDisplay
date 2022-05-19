@isTest
public class PV_TestAsyncUtil {

    @isTest
    static void asyncUtilTest()
    {
        List<String> messageList = new List<String>{'Trigger Log', 'Callout Log', 'Test Log'};
        PV_AsyncUtil.handleMessageAsynchronously('Test','Test Items');
        PV_AsyncUtil.handleMessagesAsynchronously('Test', messageList);
    }
    
    @isTest
    static void asyncUtilFailureTest()
    {
        String messageType = 'The Message Type is passed gerated than 50 charecters to cause Event Failure ';
        PV_AsyncUtil.handleMessageAsynchronously(messageType,'Test Items');
    }
    
}