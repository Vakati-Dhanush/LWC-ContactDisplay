public with sharing class ConfigureQueueMembersController {
    public ConfigureQueueMembersController() {
        
    }
    
    @AuraEnabled(cacheable=true)
    public static returnItemsWrapper getQueueMembers(){
        
        returnItemsWrapper wrapClass = new returnItemsWrapper ();
        wrapClass.queueToUsersMap = new Map<Id, Group>([SELECT Id, Name, (SELECT UserOrGroupId  FROM GroupMembers )
                                                        FROM Group WHERE Type = 'Queue'])	;
        wrapClass.usersMap = new Map<Id, User>([SELECT Id, Name FROM User WHERE isActive = true]);
        
        return wrapClass;
    }
    
    public class returnItemsWrapper
    {
        @AuraEnabled public Map<Id, User> usersMap ;
        @AuraEnabled public Map<Id,Group >  queueToUsersMap;
    }
    
    @AuraEnabled
    public static returnMessageWrapper updateQueueMembers(List<Id> usersAdded, List<Id> usersRemoved, Id queueId)
    {
        returnMessageWrapper messageWrapper = new returnMessageWrapper();
        messageWrapper.returnMessage = 'Success';
        List<GroupMember> groupMembersToDelete = [SELECT Id,UserOrGroupId, GroupId FROM GroupMember WHERE GroupId = :queueId AND UserOrGroupId IN :usersRemoved];
        List<GroupMember> groupMembersToInsert = new List<GroupMember>();
        
        if(!usersAdded.isEmpty() && usersAdded != null)
        {
            for(Id userId : usersAdded)
            {
                GroupMember currGRPMember = new GroupMember(UserOrGroupId = userId, GroupId =  queueId);
                groupMembersToInsert.add(currGRPMember);
            }
        }

        
        try
        {
            if(!groupMembersToInsert.isEmpty())
            {
                messageWrapper.usersAddedRecords = groupMembersToInsert;
                insert groupMembersToInsert;
            }
        }
        catch(Exception exp)
        {
            messageWrapper.returnMessage = exp.getMessage() ; 
        }
        
        try
        {
            if(!groupMembersToDelete.isEmpty())
            {
                messageWrapper.usersRemovedRecords = groupMembersToDelete;
                delete groupMembersToDelete;
            }
        }
        catch(Exception exp)
        {
            messageWrapper.returnMessage = exp.getMessage() ; 
        }

        return messageWrapper;
        
    }
    
    
    public class returnMessageWrapper{
        @AuraEnabled public String returnMessage  ;
        @AuraEnabled public List<GroupMember> usersAddedRecords ;
        @AuraEnabled public List<GroupMember> usersRemovedRecords ;

    }
}