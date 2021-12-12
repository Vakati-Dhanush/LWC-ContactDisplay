public with sharing class ContactDisplaycmpController {
    public ContactDisplaycmpController() {
        system.debug('Constructor called ');
    }

    @AuraEnabled(Cacheable = true)
    public static List<Contact> returnContacts()
    {
        List<Contact> conList = [SELECT Id, Name ,Email, Phone FROM Contact ];

        return conList;
    }
}
