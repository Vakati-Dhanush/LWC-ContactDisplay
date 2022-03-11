public with sharing class ProfilePermissionController {
    public ProfilePermissionController() {
        
    }
    
    @AuraEnabled(cacheable=true)
    public static profilePermisionDetailWrap getProfilePermissionDetails()
    {
        profilePermisionDetailWrap wrapClass = new profilePermisionDetailWrap();
        wrapClass.profileList = [SELECT Id,Name FROM Profile];
        wrapClass.permissionList = [SELECT Id,Label  FROM PermissionSet Where NOT(Label  like '00e%')];
        wrapClass.permissionGroupList = [Select Id ,MasterLabel FROM PermissionSetGroup];
        wrapClass.profilePermissionList = [SELECT PV_ProfileId__c,PV_RoleId__c, PV_PermissionSetIds__c, PV_PermissionSetGroupIds__c FROM PV_ProfilePermission__c];
        wrapClass.rolesList = [SELECT Id, Name FROM UserRole ];
        
        return wrapClass;
    }
    
    public class profilePermisionDetailWrap{
        @AuraEnabled public List<Profile> profileList;
        @AuraEnabled public List<PermissionSet> permissionList;
        @AuraEnabled public List<PermissionSetGroup> permissionGroupList;
        @AuraEnabled public List<PV_ProfilePermission__c> profilePermissionList ;
        @AuraEnabled public List<UserRole> rolesList ;
    }
    
    @AuraEnabled
    public static String updateProfilePermissions(String dataReceived)
    {
        System.debug('Data received '+ dataReceived);
        
        ProfilePermissionDataParser configurationData = (ProfilePermissionDataParser) JSON.deserialize(dataReceived, ProfilePermissionDataParser.class);    
        System.debug(configurationData);
        
        List<PV_ProfilePermission__c> currProfilePermission = [SELECT PV_Profile__c,PV_PermissionSets__c,PV_PermissionSetGroups__c, PV_ProfileId__c, PV_PermissionSetIds__c, PV_PermissionSetGroupIds__c FROM PV_ProfilePermission__c 
                                                               WHERE PV_ProfileId__c = :configurationData.profileId AND PV_RoleId__c = :configurationData.roleId  LIMIT 1] ;
        
        List<PV_ProfilePermission__c> upsertPermissionConfigs = new List<PV_ProfilePermission__c>();
        
        if (currProfilePermission.isEmpty())
        {
            PV_ProfilePermission__c newConfig = new PV_ProfilePermission__c();
            newConfig.PV_Profile__c = configurationData.profileName;
            newConfig.PV_ProfileId__c = configurationData.profileId;
            newConfig.PV_Role__c = configurationData.roleName;
            newConfig.PV_RoleId__c = configurationData.roleId;
            newConfig.PV_PermissionSets__c = String.join(configurationData.permissionSetNames, ',');
            newConfig.PV_PermissionSetIds__c = String.join(configurationData.permissionSetIds, ',');
            newConfig.PV_PermissionSetGroups__c = String.join(configurationData.permissionSetGRPNames, ',');
            newConfig.PV_PermissionSetGroupIds__c=   String.join(configurationData.permissionSetGRPIds, ',');
            upsertPermissionConfigs.add(newConfig);
        }
        else
        {
            List<String> currPermissionSetIds = currProfilePermission[0].PV_PermissionSetIds__c != null ? currProfilePermission[0].PV_PermissionSetIds__c.split(','): new List<String>() ;
            List<String> currPermissionSetNames = currProfilePermission[0].PV_PermissionSets__c != null ? currProfilePermission[0].PV_PermissionSets__c.split(','): new List<String>() ;
            List<String> currPermissionSetGRPIds = currProfilePermission[0].PV_PermissionSetGroupIds__c != null ? currProfilePermission[0].PV_PermissionSetGroupIds__c.split(','): new List<String>();
            List<String> currPermissionSetGRPNames =  currProfilePermission[0].PV_PermissionSetGroups__c != null ?  currProfilePermission[0].PV_PermissionSetGroups__c.split(','): new List<String>();
            
            if(!configurationData.permissionSetNames.isEmpty() || !configurationData.permissionSetIds.isEmpty())
            {
                List<String> updatedNames = new List<String>();
                List<String> updatedIds = new List<String>();
                
                if(!currPermissionSetIds.isEmpty() || !currPermissionSetNames.isEmpty())
                {
                    updatedNames = updatesItemsToList(currPermissionSetNames,configurationData.permissionSetNames);
                    updatedIds = updatesItemsToList(currPermissionSetIds ,configurationData.permissionSetIds);
                }
                else{
                    updatedNames = configurationData.permissionSetNames;
                    updatedIds = configurationData.permissionSetIds;
                }

                currProfilePermission[0].PV_PermissionSets__c = String.join(updatedNames, ',');
                currProfilePermission[0].PV_PermissionSetIds__c=String.join(updatedIds, ',');
            }
            
            if(!configurationData.permissionSetGRPNames.isEmpty() || !configurationData.permissionSetGRPIds.isEmpty())
            {
                List<String> updatedNames = new List<String>();
                List<String> updatedIds = new List<String>();
                
                if(!currPermissionSetGRPIds.isEmpty() || !currPermissionSetGRPNames.isEmpty())
                {
                     updatedNames = updatesItemsToList(currPermissionSetGRPNames ,configurationData.permissionSetGRPNames);
                     updatedIds = updatesItemsToList(currPermissionSetGRPIds ,configurationData.permissionSetGRPIds);
                }
                else{
                    updatedNames = configurationData.permissionSetGRPNames;
                    updatedIds = configurationData.permissionSetGRPIds;
                }

                currProfilePermission[0].PV_PermissionSetGroups__c = String.join(updatedNames, ',');
                currProfilePermission[0].PV_PermissionSetGroupIds__c=String.join(updatedIds, ',');
            }
            
            upsertPermissionConfigs.add(currProfilePermission[0]);
            
        }
        if(upsertPermissionConfigs.size() > 0)
        {
            upsert upsertPermissionConfigs;            
        }
        
        return 'Success';
    }
    
    
    private static List<String> updatesItemsToList(List<String> currItemsList, List<String> newItems)
    {    
        for(String currItem : newItems)
        {
            if(!currItemsList.contains(currItem))
            {
                currItemsList.add(currItem);
            }
            else
            {
                Integer idx = currItemsList.indexOf(currItem);
                currItemsList.remove(idx);
            }
        }
        
        return currItemsList;
    }

    
}