public class contactHandlerClass 
{
    public static void updateLinkedContacts(List<Contact> newList, List<Contact> oldList)
    {
        set<id> accountIds = new set<id>();
        if(newList!=null)
        {
            for(Contact c:newList)
            {
                if(c.AccountId!=null)
                {
                    accountIds.add(c.AccountId);
                }
            }
        }
        
        
        try{
            for(Contact c:newList)
            {
                if(c.AccountId!=null)
                {
                    accountIds.add(c.AccountId);
                }
            } 
        }
        catch(Exception  err)
        {
            System.debug('Err '+ err);
            String message = JSON.serialize(err.getMessage());
            PV_AsyncUtil.handleMessageAsynchronously('TriggerLog', message);
            //throw new PV_Exception('Error');
        }
        
        if(oldList!=null)
        {
            for(Contact c:oldList)
            {
                if(c.AccountId!=null)
                {
                    accountIds.add(c.AccountId);
                }
            }  
        }
        
        
        List<Account> accounts= [SELECT Id, LinkedContacts__c,(SELECT Id from Contacts) from Account where Id in :accountIds];
        if (!accounts.isEmpty())
        {
            for(Account acc:accounts)
            {
                acc.LinkedContacts__c=acc.Contacts.size();
            }
        }
        update accounts;
        
    }			
    
}