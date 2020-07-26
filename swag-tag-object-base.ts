import {SwagTagPrimitiveBase} from './swag-tag-primitive-base.js';
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

export class SwagTagObjectBase extends SwagTagPrimitiveBase{
    static is = 'swag-tag-object-base';
    mainTemplate = mainTemplate;
}
define(SwagTagObjectBase);