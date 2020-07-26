import {SwagTagPrimitiveBase, updateLabel} from './swag-tag-primitive-base.js';
import {SelectiveUpdate} from 'xtal-element/types.d.js';
import {define} from 'xtal-element/XtalElement.js';
import {createTemplate} from 'trans-render/createTemplate.js';

const mainTemplate = createTemplate(/* html */`
  <style>
      :host{
          display:block;
      }
  </style>
  <label for=myInput part=fieldLabel></label>
  <textarea id=myInput part=inputElement></textarea>
`);


const [label$, textarea$] = [Symbol('label'), Symbol('textarea')];
const initTransform  = {
    label: label$,
    textarea: textarea$
};

export const updateTextArea = ({readOnly, inputType, disabled, value}: SwagTagPrimitiveBase) =>({
    [textarea$]: [{value: value},,{'readonly': readOnly, type: inputType, disabled: disabled}]
});

export class SwagTagObjectBase extends SwagTagPrimitiveBase{
    static is = 'swag-tag-object-base';
    mainTemplate = mainTemplate;
    initTransform = initTransform;

    updateTransforms = [
        updateLabel, updateTextArea
    ]  as SelectiveUpdate<any>[];
}
define(SwagTagObjectBase);