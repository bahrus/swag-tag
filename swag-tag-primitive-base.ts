import {XtalElement, AttributeProps, define} from 'xtal-element/XtalElement.js';
import {SelectiveUpdate} from 'xtal-element/types.d.js';
import {mergeProps} from 'xtal-element/xtal-latx';
import {createTemplate} from 'trans-render/createTemplate.js';
import { WCSuiteInfo, WCInfo, PropertyInfo } from "wc-info/types.js";
import { SwagTagBase } from './swag-tag-base';

const mainTemplate = createTemplate(/* html */`
  <style>
      :host{
          display:block;
      }
      label{
          display:block;
      }
  </style>
  <label for=myInput part=fieldLabel></label>
  <input id=myInput part=inputElement>
`);

const [label$, input$] = [Symbol('label'), Symbol('input')];
const initTransform  = {
    label: label$,
    input: input$
};

const updateLabel = ({name}: SwagTagPrimitiveBase) => ({
    [label$]: name + ':',
});

const updateInput = ({readOnly, inputType, disabled, value}: SwagTagPrimitiveBase) =>({
    [input$]: [,,{'readonly': readOnly, type: inputType, disabled: disabled, value: value}]
});

export const linkInputType = ({type, self}: SwagTagPrimitiveBase) => {
    switch(type){
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
}

export class SwagTagPrimitiveBase extends XtalElement {
    static is = 'swag-tag-primitive-base';

    static attributeProps = ({readOnly, type, testValues, value, disabled, eventScopes, name, description, inputType}: SwagTagPrimitiveBase) => ({
        bool: [readOnly, disabled],
        async: [readOnly, inputType, disabled, value],
        str: [type, value, name, description, inputType],
        obj: ['default', testValues, eventScopes],
        jsonProp: [eventScopes],
        reflect: [readOnly, type, value, disabled, name, inputType]
    } as AttributeProps);

    readyToInit = true;

    mainTemplate = mainTemplate;

    readyToRender = true;

    initTransform: any = initTransform;

    propActions = [
        linkInputType,
    ];

    updateTransforms = [
        updateLabel, updateInput
    ]  as SelectiveUpdate<any>[];

    name: string | undefined;
    description: string | undefined;
    inputType: 'text' | 'checkbox' | 'number' | undefined; 
    type: 'string' | 'boolean' | 'number' | undefined;
    readOnly!: boolean;
    value: any | undefined;
   /**
   * key = test name
   * val = test prop value
   */
   testValues: { [key: string]: any } | undefined;

}
define(SwagTagPrimitiveBase);