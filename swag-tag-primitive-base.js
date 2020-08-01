import { XtalElement, define } from 'xtal-element/XtalElement.js';
import { createTemplate } from 'trans-render/createTemplate.js';
const mainTemplate = createTemplate(/* html */ `
  <style>
      :host{
          display:block;
      }
      label{
          display:block;
      }
  </style>
  <div>
    <label for=myInput part=fieldLabel></label>
    <input id=myInput part=inputElement>
  </div>
`);
const [label$, input$] = [Symbol('label'), Symbol('input')];
const initTransform = ({ self }) => ({
    label: label$,
    input: [, { input: self.handleInput }, , , input$]
});
const updateLabel = ({ name }) => ({
    [label$]: name + ':',
});
const updateInput = ({ readOnly, inputType, disabled, value }) => ({
    [input$]: [, , { 'readonly': readOnly, type: inputType, disabled: disabled, value: value }]
});
export const linkInputType = ({ type, self }) => {
    switch (type) {
        case 'boolean':
            self.inputType = 'checkbox';
            break;
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
export class SwagTagPrimitiveBase extends XtalElement {
    constructor() {
        super();
        this.readyToInit = true;
        this.mainTemplate = mainTemplate;
        this.readyToRender = true;
        this.initTransform = initTransform;
        this.propActions = [
            linkInputType, linkEditedValue
        ];
        this.updateTransforms = [
            updateLabel, updateInput
        ];
        this.eventScopes = [[, 'bubbles']];
    }
    handleInput(e) {
        this.editedValue = e.target.value;
    }
}
SwagTagPrimitiveBase.is = 'swag-tag-primitive-base';
SwagTagPrimitiveBase.attributeProps = ({ readOnly, type, testValues, value, disabled, eventScopes, name, description, inputType, editedValue }) => ({
    bool: [readOnly, disabled],
    async: [readOnly, inputType, disabled, value],
    str: [type, value, name, description, inputType, editedValue],
    notify: [editedValue],
    obj: ['default', testValues, eventScopes],
    jsonProp: [eventScopes],
    reflect: [readOnly, type, disabled, name, inputType]
});
define(SwagTagPrimitiveBase);
