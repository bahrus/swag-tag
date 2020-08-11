import {SwagTagPrimitiveBase} from './swag-tag-primitive-base.js';
import {SelectiveUpdate} from 'xtal-element/types.d.js';
import {define} from 'xtal-element/XtalElement.js';
import {createTemplate} from 'trans-render/createTemplate.js';

import ("@ui5/webcomponents/dist/CheckBox.js");

const mainTemplate = createTemplate(/* html */`
  <style>
      :host{
          display:block;
      }
      /* ui5-checkbox{
          width: 100%;
      } */
  </style>
  <ui5-checkbox part=checkbox></ui5-checkbox>
`);

const [ui5Checkbox] = [Symbol('ui5Checkbox')];

const initTransform = ({self}: SwagTagUI5Checkbox) => ({
    'ui5-checkbox': [{},{change:self.handleInput},,,ui5Checkbox],
    
});

const updateInput = ({readOnly, inputType, disabled, value, name, description}: SwagTagUI5Checkbox) => ({
    [ui5Checkbox]: [{value: value, text: name}]
});

export const linkEditedValue = ({value, self}: SwagTagUI5Checkbox) => {
    self.editedValue = value;
}

export class SwagTagUI5Checkbox extends SwagTagPrimitiveBase{
    static is = 'swag-tag-ui5-checkbox';
    
    mainTemplate = mainTemplate;

    initTransform = initTransform;

    updateTransforms = [
        updateInput
    ]  as SelectiveUpdate<any>[];

    propActions = [
        linkEditedValue
    ];
}
define(SwagTagUI5Checkbox);