import {TextField} from "@material/mwc-textfield/mwc-textfield.js";
/**
 * @element mwc-textfield-example1
 */
export class MWCTextFieldExample1 extends TextField{
    value='My value';
    type='string';
    label='My label';
    placeholder = 'My placeholder';
    prefix = 'My prefix';
    suffix = 'My suffix';
    icon = '';
    iconTrailing = '';
    helper = 'My helper text';
    maxLength = 300;
    validationMessage = 'My error';
    inputMode = '';
    charCounter = false;
    min = 0;
    max = 10000;
    size = 10000;
    step = 10;
    name = 'My name';
    validity = '';
    selectionStart = 0;
    selectionEnd = 1000;
}
customElements.define('mwc-textfield-example1', MWCTextFieldExample1);