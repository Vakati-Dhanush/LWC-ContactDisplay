import { LightningElement, api } from 'lwc';
import storeSelectedFields from '@salesforce/apex/PV_RecordsDisplayConfiguratorController.storeSelectedFields';

export default class Pv_DisplayFieldsConfigurator extends LightningElement {
    
    @api selectedSobject = '';
    @api sobjectFieldsMap = {};
    @api selectedFields = [];

    sobjectfieldOptions = {};    
    isModalOpen = false;
    label = '';    
    

    
    formFieldOptions(data) {
        let fieldOptions = [];
        for (const property in data) {
            fieldOptions.push({ label: data[property], value: property });
        }
        return fieldOptions;
    }

    @api displayModal()
    {
        console.log('display modal open '+ JSON.stringify(this.sobjectFieldsMap));
        this.isModalOpen = true;
        this.sobjectfieldOptions = this.formFieldOptions(this.sobjectFieldsMap);
    }

    handleFieldsChange(event)
    {
        this.selectedFields  = event.detail.value;
    }

    saveSelectedFields(event)
    {
        //save the selected fields to custom metadata and forward the selected fields list to parent 
        try{
            storeSelectedFields({sObjectName: this.selectedSobject, selectedFields : this.selectedFields}).
            then(response => {
                if(response !== 'Success')
                {
                    console.log('Error Occured during metadata save '+ response);
                }
            })
            this.returnFieldsToParent(this.selectedFields, this.sobjectFieldsMap);
        }
        catch(error)
        {
            console.log('Error on save '+ error);
        }
        
        this.isModalOpen = false;

    }
    returnFieldsToParent(selectedFields, objectFieldsMap)
    {
        const passEvent = new CustomEvent('selectedfieldsreturned', {
            detail: selectedFields
        });

        this.dispatchEvent(passEvent);
    }
    closeModal()
    {
        this.isModalOpen = false;
    }
}