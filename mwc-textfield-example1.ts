import {TextField} from "@material/mwc-textfield/mwc-textfield.js";
import {css} from 'lit-element/lit-element.js'
class TextField2 extends TextField{
    static get styles() {
        return css`
        :host{
                --mdc-theme-primary: black;
                --mdc-theme-on-primary: white;
            }
            ${TextField.styles}
        `;
    }
}


/**
 * @element mwc-textfield-example1
 */
export class MWCTextFieldExample1 extends TextField2{
    value='My value';
    /**
     * @type {"text"|"search"|"tel"|"url"|"email"|"password"|"date"|"month"|"week"|"time"|"datetime-local"|"number"|"color"}
     */
    type='text';
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