import { SwagTagObjectBase } from './swag-tag-object-base.js';
import { createTemplate } from 'trans-render/createTemplate.js';
import("@material/mwc-textarea/mwc-textarea.js");
const mainTemplate = createTemplate(/* html */ `
  <style>
      :host{
          display:block;
      }
      textarea{
          height: 200px;
          width: 100%;
      }
      label{
          display:block
      }
  </style>
  <mwc-textarea id=myInput part=inputElement part=textarea></mwc-textarea>
`);
const [ta] = [Symbol('ta')];
const updateTextArea = ({ readOnly, inputType, disabled, value, name }) => ({
    [ta]: [{ value: value || '' }, , { 'readonly': readOnly, type: inputType, disabled: disabled, label: name }]
});
export class SwagTagMWCTextarea extends SwagTagObjectBase {
    constructor() {
        super(...arguments);
        this.mainTemplate = mainTemplate;
        this.initTransform = {
            'mwc-textarea': [, { 'input': this.handleInput }, , , ta]
        };
        this.updateTransforms = [
            updateTextArea
        ];
    }
}
SwagTagMWCTextarea.is = 'swag-tag-mwc-textarea';
