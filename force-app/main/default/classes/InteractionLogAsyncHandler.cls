public class InteractionLogAsyncHandler implements Pv_AsyncUtilMessageHandler{
	
    public void handleMessage(String message)
    {
        Account acc = new Account(Name = 'Interaction Log '+ message);
        insert acc;
    }
}