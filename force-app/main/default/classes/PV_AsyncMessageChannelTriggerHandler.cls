public class PV_AsyncMessageChannelTriggerHandler {
    /*
     * Description : Class that handles platform events fired and calls appropriate processor class based on the custom metada created
    */
    
    public static void messageLogger(List<PV_AsyncMessageChannel__e> newEvents)
    {  
        
        Map<String, List<String>> messageTypeToMessagesMap = new Map<String, List<String>>();

        for(PV_AsyncMessageChannel__e currEvent : newEvents)
        {
            List<String> messageList = messageTypeToMessagesMap.get(currEvent.PV_MessageType__c);
            
            if(messageList == null)
            {
                messageList = new List<String>();
                messageTypeToMessagesMap.put(currEvent.PV_MessageType__c, messageList);
            }
            
            if(currEvent.PV_Category__c == 'SINGLE_MESSAGE')
            {
                messageList.add(currEvent.PV_Message__c);
            }
            else
            {
                List<String> inMessage = (List<String>) JSON.deserialize(currEvent.PV_Message__c, List<String>.class);
                messageList.addAll(inMessage);
            }     
        }
        
        if(messageTypeToMessagesMap.keySet().size() <= 0 ) return;
        
        for(String currMessageType : messageTypeToMessagesMap.keySet())
        {
            if(PV_AsyncMessageHandlerSetting__mdt.getInstance(currMessageType) != null)
            {
                
                String className = PV_AsyncMessageHandlerSetting__mdt.getInstance(currMessageType).PV_MessageProcessorClass__c;
                Type classType = Type.forName(className);
                Pv_AsyncUtilMessageHandler processorClass = (Pv_AsyncUtilMessageHandler) classType.newInstance();
                processorClass.handleMessages(messageTypeToMessagesMap.get(currMessageType));
            }
        }
    }
}