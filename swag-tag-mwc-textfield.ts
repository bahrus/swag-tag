import {SwagTagPrimitiveBase} from './swag-tag-primitive-base.js';
import {SelectiveUpdate} from 'xtal-element/types.d.js';
import {define} from 'xtal-element/XtalElement.js';
import {createTemplate} from 'trans-render/createTemplate.js';

import ("@material/mwc-textfield/mwc-textfield.js");

const mainTemplate = createTemplate(/* html */`
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
  <mwc-textfield part=textfield></mwc-textfield>
`);

const [mwcTxtFld] = [Symbol('txtFld')];

const initTransform = ({self}: SwagTagMWCTextField) => ({
    'mwc-textfield': [{},{input:self.handleInput},,,mwcTxtFld]
});

const updateInput = ({readOnly, inputType, disabled, value, name, description}: SwagTagMWCTextField) =>({
    [mwcTxtFld]: [{'readonly': readOnly, type: inputType, disabled: disabled, value: value, label: name, helper: description},,]
});

export const linkInputType = ({type, self}: SwagTagMWCTextField) => {
    switch(type){
        case 'number':
            self.inputType = 'number';
            break;
        case 'string':
            self.inputType = 'text';
            break;
    }
}

export const linkEditedValue = ({value, self}: SwagTagMWCTextField) => {
    self.editedValue = value;
}

export class SwagTagMWCTextField extends SwagTagPrimitiveBase{
    static is = 'swag-tag-mwc-textfield';
    
    mainTemplate = mainTemplate;

    initTransform = initTransform;

    updateTransforms = [
        updateInput
    ]  as SelectiveUpdate<any>[];

    propActions = [
        linkInputType, linkEditedValue
    ];
}
define(SwagTagMWCTextField);