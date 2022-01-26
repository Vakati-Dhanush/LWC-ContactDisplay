import { LightningElement, api } from 'lwc';
import Name_Field from '@salesforce/schema/Contact.Name';
import Email_Field from '@salesforce/schema/Contact.Email';
import Phone_Field from '@salesforce/schema/Contact.Phone';


const Fields = [Name_Field, Email_Field, Phone_Field];

export default class CreateContactsComponent extends LightningElement {

    // @api recordId;
    @api accountId ;
    fields = [];
    objectApiName ;

    connectedCallback(){
        this.fields = Fields.map(item => item.fieldApiName);
        console.log(this.fields);
        this.objectApiName = 'Contact';
    }

    // renderedCallback(){
    //     const inputFields = this.template.querySelectorAll('lightning-input-field');
    //     console.log('object keys '+ inputFields)
    //     inputFields.forEach(field => {
    //         console.log('Inpiut fields '+ field);
    //         if(field.fieldName === 'AccountId')
    //         {
    //             console.log('enterd loop')
    //             field.value = this.recordId;
    //             console.log(field.value)
    //         }
    //     });
    // }
}