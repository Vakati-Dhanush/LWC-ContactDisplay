global class PV_RecordDisplaySobjectList extends VisualEditor.DynamicPickList{
    
    global override VisualEditor.DataRow getDefaultValue(){
        VisualEditor.DataRow defaultValue = new VisualEditor.DataRow('Account', 'Account');
        return defaultValue;
    }
    
    global override VisualEditor.DynamicPickListRows getValues() {
        VisualEditor.DynamicPickListRows  pickListValues = new VisualEditor.DynamicPickListRows();
        for(PV_RecordDisplayerSetting__mdt currSetting : PV_RecordDisplayerSetting__mdt.getAll().values())
        {
            VisualEditor.DataRow currPicklistValue = new VisualEditor.DataRow(currSetting.SobjectName__c, currSetting.SobjectName__c);
            pickListValues.addRow(currPicklistValue);
        }
        return pickListValues;
    }
}