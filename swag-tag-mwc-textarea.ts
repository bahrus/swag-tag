import {SwagTagObjectBase} from './swag-tag-object-base.js';
import {SelectiveUpdate} from 'xtal-element/types.d.js';
import {define} from 'xtal-element/xtal-latx.js';
import {createTemplate} from 'trans-render/createTemplate.js';
import("@material/mwc-textarea/mwc-textarea.js");

const mainTemplate = createTemplate(/* html */`
  <style>
      :host{
          display:block;
      }
      mwc-textarea{
          height: 200px;
          width: 100%;
          display:block;
      }
      label{
          display:block
      }
  </style>
  <mwc-textarea id=myInput part=inputElement part=textarea></mwc-textarea>
`);
const [ta] = [Symbol('ta')];

const updateTextArea = ({readOnly, inputType, disabled, value, name}: SwagTagMWCTextarea) => ({
    [ta]: [{value: value || ''},,{'readonly': readOnly, type: inputType, disabled: disabled, label: name}]
});

export class SwagTagMWCTextarea extends SwagTagObjectBase{
    static is = 'swag-tag-mwc-textarea';

    mainTemplate = mainTemplate;

    initTransform = {
        'mwc-textarea': [,{'input': this.handleInput},,, ta]
    }

    updateTransforms = [
        updateTextArea
    ]  as SelectiveUpdate<any>[];
}
define(SwagTagMWCTextarea);