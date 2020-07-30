import {SwagTagPrimitiveBase} from './swag-tag-primitive-base.js';
import {SelectiveUpdate} from 'xtal-element/types.d.js';
import {define} from 'xtal-element/XtalElement.js';
import {createTemplate} from 'trans-render/createTemplate.js';
import { SwagTagMWCTextField } from './swag-tag-mwc-textfield.js';

import("@material/mwc-checkbox/mwc-checkbox.js");
import("@material/mwc-formfield/mwc-formfield.js");

const mainTemplate = createTemplate(/* html */`
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

const initTransform = ({self}: SwagTagMWCCheckbox) => ({
    'mwc-formfield': ff,
    '"':{
        'mwc-checkbox': [,{input:self.handleInput},,,cb]
    }
});

const updateInput = ({readOnly, inputType, disabled, value, name}: SwagTagMWCCheckbox) =>({
    [cb]: [,,{'readonly': readOnly, type: inputType, disabled: disabled, value: value, label: name}]
});

const updateLabel = ({name}: SwagTagMWCCheckbox) =>({
    [ff]:[{label:name}]
});



export class SwagTagMWCCheckbox extends SwagTagPrimitiveBase{
    static is = 'swag-tag-mwc-checkbox';
    
    mainTemplate = mainTemplate;

    initTransform = initTransform;

    updateTransforms = [
        updateInput, updateLabel
    ]  as SelectiveUpdate<any>[];

    handleInput(e: Event){
        this.editedValue = !(<any>e.target!).checked;
    }

    propActions = [];
}
define(SwagTagMWCCheckbox);