import {SwagTagPrimitiveBase} from './swag-tag-primitive-base.js';
import {SelectiveUpdate} from 'xtal-element/types.d.js';
import {define} from 'xtal-element/XtalElement.js';
import {createTemplate} from 'trans-render/createTemplate.js';

import ("@ui5/webcomponents/dist/Input.js");

const mainTemplate = createTemplate(/* html */`
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
  <ui5-label class="samples-big-margin-right" for="myInput" required>Name</ui5-label>
  <ui5-input id="myInput" placeholder="Enter your Name" required></ui5-input>
`);

const [ui5Input, ui5Label] = [Symbol('ui5Input'), Symbol('ui5Label')];

const initTransform = ({self}: SwagTagUI5Input) => ({
    'ui5-input': [{},{input:self.handleInput},,,ui5Input],
    'ui5-label': ui5Label,
});

const updateInput = ({readOnly, inputType, disabled, value, name, description}: SwagTagUI5Input) =>({
    [ui5Input]: [{value: value}]
});

export const linkInputType = ({type, self}: SwagTagUI5Input) => {
    switch(type){
        case 'number':
            self.inputType = 'number';
            break;
        case 'string':
            self.inputType = 'text';
            break;
    }
}

export const linkEditedValue = ({value, self}: SwagTagUI5Input) => {
    self.editedValue = value;
}

export class SwagTagUI5Input extends SwagTagPrimitiveBase{
    static is = 'swag-tag-ui5-input';
    
    mainTemplate = mainTemplate;

    initTransform = initTransform;

    updateTransforms = [
        updateInput
    ]  as SelectiveUpdate<any>[];

    propActions = [
        linkInputType, linkEditedValue
    ];
}
define(SwagTagUI5Input);