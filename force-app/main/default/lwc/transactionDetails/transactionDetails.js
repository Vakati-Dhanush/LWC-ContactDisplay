import { LightningElement, api } from 'lwc';

export default class TransactionDetails extends LightningElement {

    @api recordId;
    showInputDate;
    showSearchBTWDate;


    displayRecentTransactions() {
        this.showInputDate = false;
        this.showSearchBTWDate = false;
        this.callEventDisplaytransaction('recent', null, null, null);
    }

    displayALLTransactions() {
        this.showInputDate = false;
        this.showSearchBTWDate = false;
        this.callEventDisplaytransaction('ALL', null, null, null);
    }

    displayTransactionByDate() {
        this.showInputDate = true;
        this.showSearchBTWDate = false;

    }

    getInputDate() {

        let inputDate = this.template.querySelectorAll('lightning-input')[0].value;
        let date = Date.parse(inputDate);
        this.callEventDisplaytransaction('SearchOnDate', date, null, null);


    }

    getInputDateRange() {
        let dateList = this.template.querySelectorAll('lightning-input');

        let startDate = Date.parse(dateList[0].value);
        let endDate = Date.parse(dateList[1].value);
        console.log('END Date ' + endDate);
        console.log('startDate Date ' + startDate);

        if (endDate > startDate) {
            this.callEventDisplaytransaction('SearchBTWDates', null, startDate, endDate);
        }
        else {
            alert('End date must be greater than start date')
        }

    }



    displayTransactionBTWDates() {
        this.showSearchBTWDate = true;
        this.showInputDate = false;
    }


    callEventDisplaytransaction(typeSelected, date, startDate, endDate) {
        this.template.querySelector('c-display-transactions').eventFromParent(typeSelected, date, startDate, endDate);
    }
}