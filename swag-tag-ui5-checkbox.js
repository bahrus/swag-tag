import { SwagTagPrimitiveBase } from './swag-tag-primitive-base.js';
import { define } from 'xtal-element/XtalElement.js';
import { createTemplate } from 'trans-render/createTemplate.js';
import("@ui5/webcomponents/dist/CheckBox.js");
const mainTemplate = createTemplate(/* html */ `
  <style>
      :host{
          display:block;
      }
      /* ui5-checkbox{
          width: 100%;
      } */
  </style>
  <ui5-checkbox part=checkbox></ui5-checkbox>
`);
const [ui5Checkbox] = [Symbol('ui5Checkbox')];
const initTransform = ({ self }) => ({
    'ui5-checkbox': [{}, { change: self.handleInput }, , , ui5Checkbox],
});
const updateInput = ({ readOnly, inputType, disabled, value, name, description }) => ({
    [ui5Checkbox]: [{ value: value, text: name }]
});
export const linkEditedValue = ({ value, self }) => {
    self.editedValue = value;
};
export class SwagTagUI5Checkbox extends SwagTagPrimitiveBase {
    constructor() {
        super(...arguments);
        this.mainTemplate = mainTemplate;
        this.initTransform = initTransform;
        this.updateTransforms = [
            updateInput
        ];
        this.propActions = [
            linkEditedValue
        ];
    }
}
SwagTagUI5Checkbox.is = 'swag-tag-ui5-checkbox';
define(SwagTagUI5Checkbox);
