import { TextField } from "@material/mwc-textfield/mwc-textfield.js";
import { css } from 'lit-element/lit-element.js';
class TextField2 extends TextField {
    static get styles() {
        return css `
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
export class MWCTextFieldExample1 extends TextField2 {
    constructor() {
        super(...arguments);
        this.value = 'My value';
        this.type = 'string';
        this.label = 'My label';
        this.placeholder = 'My placeholder';
        this.prefix = 'My prefix';
        this.suffix = 'My suffix';
        this.icon = '';
        this.iconTrailing = '';
        this.helper = 'My helper text';
        this.maxLength = 300;
        this.validationMessage = 'My error';
        this.inputMode = '';
        this.charCounter = false;
        this.min = 0;
        this.max = 10000;
        this.size = 10000;
        this.step = 10;
        this.name = 'My name';
        this.validity = '';
        this.selectionStart = 0;
        this.selectionEnd = 1000;
    }
}
customElements.define('mwc-textfield-example1', MWCTextFieldExample1);
