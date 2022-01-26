import { LightningElement, api } from 'lwc';
import returnTransactions from '@salesforce/apex/DisplayTransactionController.returnTransactions';

const columnsList = [
    { label: 'Transaction Type ', fieldName: 'TransactionType__c', type: 'text', initialWidth: 120, hideDefaultActions: true },
    {
        label: 'Date', fieldName: 'TransactionDate__c', initialWidth: 190,
        typeAttributes: {
            year: "numeric",
            month: "long",
            day: "2-digit"
        }, hideDefaultActions: true
    },
    { label: 'Amount', fieldName: 'Amount__c', type: 'currency', initialWidth: 150, cellAttributes: { alignment: 'left' }, hideDefaultActions: true }
];

export default class DisplayTransactions extends LightningElement {

    @api contactId;

    columns = columnsList;
    transactions = [];
    displayTransactions = [];
    isDataAvailable;

    message;

    connectedCallback() {

        console.log('Record id ' + this.contactId);
        returnTransactions({ 'contactId': this.contactId }).
            then(result => this.transactions = result).
            catch(error => this.message = error);

        this.message = 'Select the Set of Transactions to be seen';

    }



    @api
    eventFromParent(typeSelected, date, startDate, endDate) {
        
        this.displayTransactions = this.displayRecordsOnSelect(typeSelected, date, startDate, endDate);
        console.log('this.displayTransactions' + this.displayTransactions)
        console.log('length of transactions' + this.displayTransactions.length)
        if (this.displayTransactions.length > 0) {
            this.isDataAvailable = true;
        }
        else{
            this.isDataAvailable = false;
            this.message = 'No transactions are available ';
        }
    }

    displayRecordsOnSelect(typeSelected, date, startDate, endDate) {

        let recordsReturned = [];

        if (typeSelected === 'recent') {
            recordsReturned = this.transactions.slice(0, 10);
            return recordsReturned;
        }
        else if (typeSelected === 'ALL') {
            recordsReturned = this.transactions;
            return recordsReturned;
        }

        else if (typeSelected === 'SearchOnDate') {
            this.transactions.forEach(record => {
                let dateValue = Date.parse(record.TransactionDate__c);

                if (dateValue == date) {
                    recordsReturned.push(record);
                }
            });

            if (recordsReturned.length > 0) {
                return recordsReturned;
            }
            else {
                return recordsReturned.length = 0 ;
            }
        }

        else if (typeSelected === 'SearchBTWDates') {
            this.transactions.forEach(record => {
                let dateValue = Date.parse(record.TransactionDate__c);
                if (dateValue >= startDate && dateValue <= endDate) {
                    recordsReturned.push(record);
                }
            });

            if (recordsReturned.length > 0) {
                return recordsReturned;
            }
        }
        else{
            return recordsReturned.length = 0 ;
        }

    }


}