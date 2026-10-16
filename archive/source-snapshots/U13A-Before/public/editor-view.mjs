// Saving or refreshing must not replace a focused draft with its normalized stored value.
export function refreshEditor(field,value,{fresh=false,dirty=false,activeElement=null}={}) {
 if(!fresh&&(dirty||activeElement===field))return;
 if(field.value!==value)field.value=value;
}
