import { SwagTagPrimitiveBase } from './swag-tag-primitive-base.js';
import { define } from 'xtal-element/XtalElement.js';
import { createTemplate } from 'trans-render/createTemplate.js';
import("@material/mwc-textfield/mwc-textfield.js");
const mainTemplate = createTemplate(/* html */ `
  <style>
      :host{
          display:block;
      }
      label{
          display:block;
      }
      mwc-textfield{
          width: 100%;
      }
  </style>
  <mwc-textfield></mwc-textfield>
`);
const [tf] = [Symbol('tf')];
const initTransform = ({ self }) => ({
    'mwc-textfield': [, { input: self.handleInput }, , , tf]
});
const updateInput = ({ readOnly, inputType, disabled, value, name }) => ({
    [tf]: [, , { 'readonly': readOnly, type: inputType, disabled: disabled, value: value, label: name }]
});
export const linkInputType = ({ type, self }) => {
    switch (type) {
        case 'number':
            self.inputType = 'number';
            break;
        case 'string':
            self.inputType = 'text';
            break;
    }
};
export const linkEditedValue = ({ value, self }) => {
    self.editedValue = value;
};
export class SwagTagMWCTextField extends SwagTagPrimitiveBase {
    constructor() {
        super(...arguments);
        this.mainTemplate = mainTemplate;
        this.initTransform = initTransform;
        this.updateTransforms = [
            updateInput
        ];
        this.propActions = [
            linkInputType, linkEditedValue
        ];
    }
}
SwagTagMWCTextField.is = 'swag-tag-mwc-textfield';
define(SwagTagMWCTextField);
