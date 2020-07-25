import { XtalElement, define } from 'xtal-element/XtalElement.js';
import { createTemplate } from 'trans-render/createTemplate.js';
const mainTemplate = createTemplate(/* html */ `
  <style>
      :host{
          display:block;
      }
  </style>
  <label for=myInput part=fieldLabel></label>
  <input id=myInput part=inputElement>
`);
const [label$, input$] = [Symbol('label'), Symbol('input')];
const initTransform = {
    label: label$,
    input: input$
};
const updateLabel = ({ name }) => ({
    [label$]: name,
});
const updateInput = ({ readOnly, inputType, disabled, value }) => ({
    [input$]: [, , { 'readonly': readOnly, type: inputType, disabled: disabled, value: value }]
});
const linkInputType = ({ type, self }) => {
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
export class SwagTagPrimitiveBase extends XtalElement {
    constructor() {
        super(...arguments);
        this.readyToInit = true;
        this.mainTemplate = mainTemplate;
        this.readyToRender = true;
        this.initTransform = initTransform;
        this.propActions = [
            linkInputType,
        ];
        this.updateTransforms = [
            updateLabel, updateInput
        ];
    }
}
SwagTagPrimitiveBase.is = 'swag-tag-primitive-base';
SwagTagPrimitiveBase.attributeProps = ({ readOnly, type, testValues, value, disabled, eventScopes, name, description, inputType }) => ({
    bool: [readOnly, disabled],
    async: [readOnly, inputType, disabled, value],
    str: [type, value, name, description, inputType],
    obj: ['default', testValues, eventScopes],
    jsonProp: [eventScopes]
});
define(SwagTagPrimitiveBase);
