import { LightningElement, api } from 'lwc';

export default class RecordEditFormSlds extends LightningElement {

    @api objectApiName;
    @api fieldNames;
    @api recordId;
    updateValues = {};

    closeForm(event) {
        this.returnValuestoParent();
    }




    handleSuccess(event) {
        let fields = this.fieldNames.map(value => value);
        let valuesAfterSuccess = event.detail.fields;
        fields.splice(0,1);
        let successFields = {
            'Id': event.detail.id,
            'Name': valuesAfterSuccess.FirstName.value+' '+valuesAfterSuccess.LastName.value
        };
        fields.forEach(element => {
            let details = valuesAfterSuccess[element];
            successFields[element] = details.value;
        });

        this.updateValues = successFields;
        this.returnValuestoParent();
    }


    handleError(event)
    {
        console.log('Enter the dragon')
        console.log(JSON.stringify(event.detail));
    }
    returnValuestoParent() {

        const passEvent = new CustomEvent('returnvalues', {
            detail: this.updateValues
        });
        this.dispatchEvent(passEvent);
    }
}