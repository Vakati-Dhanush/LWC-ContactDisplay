public with sharing class DisplayTransactionController {
    public DisplayTransactionController() {

    }

    @AuraEnabled
    public static List<Transaction__c> returnTransactions(Id contactId){
        
        try {
            return [SELECT Id,Name, TransactionType__c, Amount__c,TransactionDate__c FROM Transaction__c WHERE Contact__c = :contactId ORDER BY TransactionDate__c DESC ];
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
