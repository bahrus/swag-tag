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
  </style>
  <mwc-textfield></mwc-textfield>
`);

const [tf] = [Symbol('tf')];

const initTransform = {
    'mwc-textfield': tf
}

const updateInput = ({readOnly, inputType, disabled, value, name}: SwagTagMWCTextField) =>({
    [tf]: [,,{'readonly': readOnly, type: inputType, disabled: disabled, value: value, label: name}]
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

export class SwagTagMWCTextField extends SwagTagPrimitiveBase{
    static is = 'swag-tag-mwc-textfield';
    
    mainTemplate = mainTemplate;

    initTransform = initTransform;

    updateTransforms = [
        updateInput
    ]  as SelectiveUpdate<any>[];

    propActions = [
        linkInputType,
    ];
}
define(SwagTagMWCTextField);