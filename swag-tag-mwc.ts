import {SwagTagBase, uiRefs, createUiRefs, addEventListeners, linkWcInfo, triggerImportReferencedModule} from './swag-tag-base.js';
import { WCSuiteInfo, WCInfo, PropertyInfo, CustomEventInfo, SlotInfo, AttribInfo } from "wc-info/types.js";
import {define} from 'xtal-element/XtalElement.js';
import {RenderContext, PEATSettings} from 'trans-render/types2.d.js';
import {PD} from "p-et-alia/p-d.js";
import {SwagTagMWCTextField} from './swag-tag-mwc-textfield.js';
import {SwagTagMWCCheckbox} from './swag-tag-mwc-checkbox.js';
import {SwagTagMWCTextarea} from './swag-tag-mwc-textarea.js';
import { SelectiveUpdate, TransformRules} from "../xtal-element/types.js";

export const addEditors =   ({massagedProps, name}: SwagTagBase) => ({
    [uiRefs.fieldset]: [massagedProps, ({item}: RenderContext) => (<any>item).editor,, {
      [`${SwagTagMWCTextField.is},${SwagTagMWCCheckbox.is}`]: ({item, target}: RenderContext<SwagTagMWCTextField, PropertyInfo>) => {
        Object.assign(target, item);
        target!.setAttribute('role', 'textbox');
      },
      '"': ({item}: RenderContext) => ([PD.is, 'afterEnd', [{on:'input', from:'form', to: 'details', careOf: name, prop: item.name, val: 'target.value', m:1}]]),
      [SwagTagMWCTextarea.is]: ({item, target}: RenderContext<SwagTagMWCTextarea, PropertyInfo>) => {
        Object.assign(target, item);
        target!.setAttribute('role', 'textbox');
      },
      '""': ({item}: RenderContext) => ([PD.is, 'afterEnd', [{on:'parsed-object-changed', from:'form', to: 'details', careOf: name, prop: item.name, val: 'target.parsedObject', m:1}]])
  
    }]
});

const massaged = Symbol();
export const linkMassagedProps = ({properties, self}: SwagTagBase) => {
    if(properties === undefined || (<any>properties)[massaged as any as string]) return;
    properties.forEach(prop =>{
      const anyProp = <any>prop;
      prop.value = anyProp.default;
      switch(prop.type){
        case 'string':
        case 'number':
          anyProp.editor = SwagTagMWCTextField.is;
          break;
        case 'boolean':
          anyProp.editor = SwagTagMWCCheckbox.is;
          break;
        default:
          anyProp.editor = SwagTagMWCTextarea.is;
      }
    });
    (<any>properties)[massaged as any as string] = true;
    self.massagedProps = properties;
  }

const updateTransforms = [
    createUiRefs,
    addEventListeners,
    addEditors
  ] as SelectiveUpdate<any>[];

export class SwagTagMWC extends SwagTagBase{
    static is = 'swag-tag-mwc';

    updateTransforms = updateTransforms;

    propActions = [
        linkWcInfo, linkMassagedProps, triggerImportReferencedModule
      ];

}

define(SwagTagMWC);