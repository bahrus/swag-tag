import { SwagTagPrimitiveBase } from './swag-tag-primitive-base.js';
import { define } from 'xtal-element/XtalElement.js';
import { createTemplate } from 'trans-render/createTemplate.js';
import("@ui5/webcomponents/dist/Input.js");
const mainTemplate = createTemplate(/* html */ `
  <style>
      :host{
          display:block;
      }
      ui5-label{
          display:block;
      }
      ui5-input{
          width: 100%;
      }
  </style>
  <ui5-label class="samples-big-margin-right" for="myInput" required part=label></ui5-label>
  <ui5-input id="myInput"  part=input></ui5-input>
`);
const [ui5Input, ui5Label] = [Symbol('ui5Input'), Symbol('ui5Label')];
const initTransform = ({ self }) => ({
    'ui5-label': ui5Label,
    'ui5-input': [{}, { input: self.handleInput }, , , ui5Input],
});
const updateInput = ({ readOnly, inputType, disabled, value, name, description }) => ({
    [ui5Input]: [{ value: value, placeholder: 'Enter ' + name }]
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
export class SwagTagUI5Input extends SwagTagPrimitiveBase {
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
SwagTagUI5Input.is = 'swag-tag-ui5-input';
define(SwagTagUI5Input);
