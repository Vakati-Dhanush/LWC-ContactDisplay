import { LightningElement,api } from 'lwc';

//gets listbox options as list of objects({label:Name , value :key})
//eventFromParent method can be fired from parent which receives list of selected Values (i.e values of selected list options)
//Upon processing optionsupdate is dispatched to the parent supplying removed option and added options.
//getUpdatedOptionsAsObjects --> if set to true returns removed options and added options as objects({label: Name, Value: Id}) 

export default class GlobalDualListBoxComponent extends LightningElement {
    @api listboxOptions = []; //List of objects ({label: Name , value: key}) format.
    @api getUpdatedOptionsAsObjects = false; //get added and removed options as objects 
    @api fieldHelpMessage = ''; // use it for field-level-help in Dual List box 
    @api label = ''; //Label of Dual list box 
    @api name =''; //Name of Dual list box 
    existingOptionValues = [] ;//To prepopulate values in the selected box, we need to have a list of values({label: Name , value: key}) (list of key in this context ) of the selected options
    modifiedListValues = []; //Stores values when there is a change in selected items (Even here key values are stored as above)

    @api
    getExistingSelectedValues(existingSelectedValues) {
        this.existingOptionValues = existingSelectedValues;
    }

    handleChange(event) {
        this.modifiedListValues = event.detail.value;
    }

    @api
    handleSave() {
        let updatedValues = this.modifiedListValues !== null ? this.modifiedListValues : [];
        let previousValues = this.existingOptionValues !== null ? this.existingOptionValues : [];
        let selectedValues = [];
        let removedValues = []; 

        removedValues = previousValues.filter(item => !updatedValues.includes(item));
        selectedValues = updatedValues.filter(item => !previousValues.includes(item));
        if(this.getUpdatedOptionsAsObjects)
        {
            this.convertSelectedValuesToObj(removedValues, selectedValues);
        }
        else{
            this.returnUpdatedOptionsToParent(selectedValues,removedValues);
        }
    }

    convertSelectedValuesToObj(removedValues, selectedValues)
    {
        let allOptions = this.listboxOptions;
        const removedItems = [];
        const addedItems = [];
        allOptions.forEach(item => {
            if(removedValues.includes(item.value))
            {
                removedItems.push(item);
            }
            if(selectedValues.includes(item.value))
            {
                addedItems.push(item);
            }
        });

        this.returnUpdatedOptionsToParent(addedItems,removedItems);
    }

    returnUpdatedOptionsToParent(selectedValues,removedValues)
    {
        const passEvent = new CustomEvent('optionsupdate', {
            detail: {
                valuesAdded : selectedValues,
                valuesRemoved :removedValues
            }
        });

        this.dispatchEvent(passEvent);
    }

}