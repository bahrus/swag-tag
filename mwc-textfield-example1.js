import { TextField } from "@material/mwc-textfield/mwc-textfield.js";
/**
 * @element mwc-textfield-example1
 */
export class MWCTextFieldExample1 extends TextField {
    constructor() {
        super(...arguments);
        this.value = 'My value';
        /**
         * @type {"text"|"search"|"tel"|"url"|"email"|"password"|"date"|"month"|"week"|"time"|"datetime-local"|"number"|"color"}
         */
        this.type = 'text';
        this.label = 'My label';
        this.placeholder = 'My placeholder';
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
