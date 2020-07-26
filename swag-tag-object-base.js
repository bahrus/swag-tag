import { SwagTagPrimitiveBase } from './swag-tag-primitive-base.js';
import { define } from 'xtal-element/XtalElement.js';
import { createTemplate } from 'trans-render/createTemplate.js';
const mainTemplate = createTemplate(/* html */ `
  <style>
      :host{
          display:block;
      }
      textarea{
          height: 400px;
          width: 100%;
      }
      label{
          display:block
      }
  </style>
  <label for=myInput part=fieldLabel></label>
  <textarea id=myInput part=inputElement part=textarea></textarea>
`);
const [label$, textarea$] = [Symbol('label'), Symbol('textarea')];
const initTransform = {
    label: label$,
    textarea: textarea$
};
const updateLabel = ({ name }) => ({
    [label$]: name + ':',
});
const updateTextArea = ({ readOnly, inputType, disabled, value }) => ({
    [textarea$]: [{ value: value || '' }, , { 'readonly': readOnly, type: inputType, disabled: disabled }]
});
export class SwagTagObjectBase extends SwagTagPrimitiveBase {
    constructor() {
        super(...arguments);
        this.mainTemplate = mainTemplate;
        this.initTransform = initTransform;
        this.updateTransforms = [
            updateLabel, updateTextArea
        ];
    }
}
SwagTagObjectBase.is = 'swag-tag-object-base';
define(SwagTagObjectBase);
