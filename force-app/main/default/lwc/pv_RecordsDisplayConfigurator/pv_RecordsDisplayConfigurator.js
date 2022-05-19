import { LightningElement, api } from 'lwc';
import getSobjectRecords from '@salesforce/apex/PV_RecordsDisplayConfiguratorController.getSobjectRecords';
import getSobjectFieldResult from '@salesforce/apex/PV_RecordsDisplayConfiguratorController.getSobjectFields';
import returnSelectedFields from '@salesforce/apex/PV_RecordsDisplayConfiguratorController.returnSelectedFields';


const columns = [{ label: 'Name', fieldName: 'Name' }];
export default class Pv_RecordsDisplayConfigurator extends LightningElement {
    @api selectSobject;

    sobjectRecords = {};
    columns = columns;
    cardTitle = '';
    existingFields = ['Name'];
    sobjectFieldsMap = {};
    

    connectedCallback() {
        this.cardTitle = this.selectSobject + " Records";
        getSobjectFieldResult({ sObjectName: this.selectSobject }).
            then(dataReturned => {
                this.sobjectFieldsMap = dataReturned;
            }).
            catch(error => console.log(error));
            
        returnSelectedFields({sObjectName : this.selectSobject}).
        then( data => {
             this.existingFields = data;
            return data;
         }).
        then( existingFields => {
            this.columns = this.formColumnsOfSelectedFields(existingFields);
            this.fetchSobjectRecords(this.selectSobject, existingFields);
        }).
        catch(error => console.log('Error occured while fetching existing fields '+ error));  
    }


    formColumnsOfSelectedFields(selectedFields)
    {
        const fieldsApiNames = this.sobjectFieldsMap;
        let constructedColumns = selectedFields.map(item => {
            let currColumn = { label: fieldsApiNames[item], fieldName: item, sortable: true };
            return currColumn;
        });
        console.log('Constructed Columns in Parent '+ JSON.stringify(constructedColumns));
        return constructedColumns;
    }

    handleSelectFields() {
        try {
            this.template.querySelector('c-pv-_-display-fields-configurator').displayModal();
        }
        catch (error) {
            console.log('Error occured while calling display fields configuratior ' + error);
        }
    }

    handleFieldsChange(event) {
        try {
            let selectedFields = event.detail;
            this.columns = this.formColumnsOfSelectedFields(selectedFields);
            this.fetchSobjectRecords(this.selectSobject, selectedFields);
        }
        catch (error) {
            console.log('Error Occured while constructing fields ' + error);
        }
    }

    fetchSobjectRecords(sObjectName, selectedFields)
    {
        getSobjectRecords({sObjectName : sObjectName, selectedFields :selectedFields}).
        then(data => {
            if(data)
            {
                this.sobjectRecords = data;
            }
        }).
        catch(error => console.log('Error Occured while fetching Sobject Records '+ JSON.stringify(error)));
    }
}