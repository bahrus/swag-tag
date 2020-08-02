import {SwagTagBase, uiRefs, bindName, addEventListeners, linkWcInfo, triggerImportReferencedModule, adjustValueAndType, bindSelf, showHideEditor} from './swag-tag-base.js';
import { WCSuiteInfo, WCInfo, PropertyInfo, CustomEventInfo, SlotInfo, AttribInfo } from "wc-info/types.js";
import {define} from 'xtal-element/XtalElement.js';
import {RenderContext, PEATSettings} from 'trans-render/types2.d.js';
import {PD} from "p-et-alia/p-d.js";
import {PU} from 'p-et-alia/p-u.js';
import {SwagTagMWCTextField} from './swag-tag-mwc-textfield.js';
import {SwagTagMWCCheckbox} from './swag-tag-mwc-checkbox.js';
//import {SwagTagMWCTextarea} from './swag-tag-mwc-textarea.js';
import {SwagTagJsonEditor} from './swag-tag-json-editor.js';
import {SwagTagMWCSelect} from './swag-tag-mwc-select.js';
import { SelectiveUpdate, TransformRules} from "../xtal-element/types.js";

export const addEditors =   ({massagedProps, name}: SwagTagBase) => ({
    // Loop over massagedProps, and insert dynamic editor via tag name (item.editor is the tag name)
    [uiRefs.fFieldset]: [massagedProps || [], ({item}: RenderContext) => (<any>item).editor,, {
      [`${SwagTagMWCTextField.is},${SwagTagMWCCheckbox.is},${SwagTagJsonEditor.is},${SwagTagMWCSelect.is}`]: ({item, target}: RenderContext<SwagTagMWCTextField, PropertyInfo>) => {
        Object.assign(target, item);
        target!.setAttribute('role', 'textbox');
      },
    }]
});

const massaged = Symbol();
export const linkMassagedProps = ({properties, self, block}: SwagTagBase) => {
    if(properties === undefined || (<any>properties)[massaged as any as string]) return;
    properties.forEach(prop =>{
      adjustValueAndType(prop);
      const anyProp = <any>prop;
      let defaultVal = anyProp.default;
      switch(prop.type){
        case 'string':
        case 'number':
          anyProp.editor = SwagTagMWCTextField.is;
          break;
        case 'boolean':
          anyProp.editor = SwagTagMWCCheckbox.is;
          break;
        case 'object':
          anyProp.editor = SwagTagJsonEditor.is;
          break;
        case 'stringArray':
          anyProp.editor = SwagTagMWCSelect.is;
          break;
        default:
          throw 'Not implemented';
          
      }
    });
    (<any>properties)[massaged as any as string] = true;
    self.massagedProps = block !== undefined ? properties.filter(prop => !block.includes(prop.name!)) : properties;
  }

const updateTransforms = [
    bindName,
    addEventListeners,
    addEditors,
    bindSelf,
  ] as SelectiveUpdate<any>[];

export class SwagTagMWC extends SwagTagBase{
    static is = 'swag-tag-mwc';

    updateTransforms = updateTransforms;

    propActions = [
        linkWcInfo, linkMassagedProps, triggerImportReferencedModule, showHideEditor
    ];

}

define(SwagTagMWC);