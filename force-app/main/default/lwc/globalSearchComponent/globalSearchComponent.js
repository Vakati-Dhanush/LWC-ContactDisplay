import { LightningElement, api } from 'lwc';

export default class GlobalSearchComponent extends LightningElement {

    @api options = [];  //options stores the list of objects eg [{label: 'PV search', value :'Id value'}]
    @api placeHolderValue = ''; //String to store placeholder value
    @api label = ''; //Label of the search 
    @api noItemFoundMessage = ''; // Message to display when no Items found 

    optionsToDisplay = [];
    itemSelected = false;
    selectedValue ='';

    connectedCallback() {
        this.optionsToDisplay = this.options;
    }
    
    handleKeyPress(event) {
        this.itemSelected =false;
        let searchKey = event.target.value;
        let emptyObject = [{ label: this.noItemFoundMessage, value: 'empty' }];
        this.optionsToDisplay = this.sortSearch(searchKey).length === 0 ? emptyObject : this.sortSearch(searchKey);

    }

    sortSearch(searchKey) {
        let sortedArray = this.options.filter(item => item.label.toLowerCase().includes(searchKey.toLowerCase()));
        return sortedArray;
    }

    optionsClickHandler(event) {
        const valueData = event.target.closest('li').dataset.value;
        const labelData = event.target.closest('li').dataset.label;
        
        if (valueData === 'empty') {
            return;
        }
        const returnRecord = { label: labelData, value: valueData };
        this.itemSelected = true;
        this.selectedValue = labelData;
        this.optionsToDisplay = this.options;
        this.returnValuestoParent(returnRecord);
    }

    returnValuestoParent(returnRecord) {

        const passEvent = new CustomEvent('valuesreturned', {
            detail: returnRecord
        });
        this.dispatchEvent(passEvent);
    }



}