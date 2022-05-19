public class TriggerLogAsyncHandler implements Pv_AsyncUtilMessageHandler{
    
    public void handleMessages(List<String> messages)
    {
		System.debug('Message ' + messages[0]);
        List<Contact> contactList = new List<Contact>();
        for(Integer idx =0; idx< messages.size(); idx++)
        {
            Contact con = new Contact(LastName = messages[0], FirstName = 'Testing Log');
            contactList.add(con);
        }
        
        insert contactList;
    }
}