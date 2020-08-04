import { SwagTagPrimitiveBase } from './swag-tag-primitive-base.js';
import { define } from 'xtal-element/XtalElement.js';
import { createTemplate } from 'trans-render/createTemplate.js';
import("@material/mwc-checkbox/mwc-checkbox.js");
import("@material/mwc-formfield/mwc-formfield.js");
const mainTemplate = createTemplate(/* html */ `
  <style>
      :host{
          display:block;
      }
      label{
          display:block;
      }
      mwc-formfield{
          width:100%;
      }
  </style>
  <mwc-formfield>
    <mwc-checkbox></mwc-checkbox>
  </mwc-formfield>
`);
const [ff, cb] = [Symbol('ff'), Symbol('cb')];
const initTransform = ({ self }) => ({
    'mwc-formfield': ff,
    '"': {
        'mwc-checkbox': [{}, { input: self.handleInput }, , , cb]
    }
});
const updateInput = ({ readOnly, inputType, disabled, value, name }) => ({
    [cb]: [{}, , { 'readonly': readOnly, type: inputType, disabled: disabled, value: value, label: name }]
});
const updateLabel = ({ name }) => ({
    [ff]: [{ label: name }]
});
export class SwagTagMWCCheckbox extends SwagTagPrimitiveBase {
    constructor() {
        super(...arguments);
        this.mainTemplate = mainTemplate;
        this.initTransform = initTransform;
        this.updateTransforms = [
            updateInput, updateLabel
        ];
        this.propActions = [];
    }
    handleInput(e) {
        this.editedValue = !e.target.checked;
    }
}
SwagTagMWCCheckbox.is = 'swag-tag-mwc-checkbox';
define(SwagTagMWCCheckbox);
