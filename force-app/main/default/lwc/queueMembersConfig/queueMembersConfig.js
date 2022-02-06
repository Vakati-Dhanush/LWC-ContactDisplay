import { LightningElement, api } from 'lwc';

export default class QueueMembersConfig extends LightningElement {

    @api listboxOptions = []; //List of objects ({label: Name , value: key}) format.
    
    existingOptionValues = [] ;//To prepopulate values in the selected box, we need to have a list of values({label: Name , value: key}) (list of key in this context ) of the selected options
    modifiedListValues = []; //Stores values when there is a change in selected items (Even here key values are stored as above)

    @api
    eventFromParent(userIds) {
        this.existingOptionValues = userIds;

    }

    handleChange(event) {
        this.modifiedListValues = event.detail.value;
    }


    handleSave() {
        let updatedValues = this.modifiedListValues;
        let previousValues = this.existingOptionValues;
        let selectedValues = [];
        let removedValues = []; 

        removedValues = previousValues.filter(item => !updatedValues.includes(item));
        selectedValues = updatedValues.filter(item => !previousValues.includes(item));

        this.returnUpdatedOptionsToParent(selectedValues,removedValues);
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