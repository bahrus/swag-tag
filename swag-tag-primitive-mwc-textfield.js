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
  </style>
  <mwc-textfield></mwc-textfield>
`);
const [tf] = [Symbol('tf')];
const initTransform = {
    'mwc-textfield': tf
};
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
export class SwagTagPrimitiveMWCTextField extends SwagTagPrimitiveBase {
    constructor() {
        super(...arguments);
        this.mainTemplate = mainTemplate;
        this.initTransform = initTransform;
        this.updateTransforms = [
            updateInput
        ];
        this.propActions = [
            linkInputType,
        ];
    }
}
SwagTagPrimitiveMWCTextField.is = 'swag-tag-primitive-mwc-textfield';
define(SwagTagPrimitiveMWCTextField);
