import { WCSuiteInfo, WCInfo, PropertyInfo, CustomEventInfo, SlotInfo, AttribInfo } from "wc-info/types.js";
import { createTemplate as T } from "trans-render/createTemplate.js";
import {RenderContext, PEATSettings, PEATUnionSettings} from 'trans-render/types2.d.js';
import { XtalFetchViewElement, define, mergeProps, AttributeProps, p, symbolize} from "xtal-element/XtalFetchViewElement.js";
import {PD} from "p-et-alia/p-d.js";
import { SwagTagPrimitiveBase } from './swag-tag-primitive-base.js';
import {SwagTagObjectBase} from './swag-tag-object-base.js';
import { SelectiveUpdate, TransformRules} from "../xtal-element/types.js";
import('@power-elements/json-viewer/json-viewer.js');

const mainTemplate = T(/* html */ `
<style id=collapsible>
  fieldset[data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963"]>legend{
    cursor: pointer;
  }
  fieldset[data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963"][data-open="false"] [role]{
    display: none;
  }
  fieldset[data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963"][data-open="true"]{
    height: 500px;
    overflow-y:auto;
  }
</style>
<main>
<!-- pass down edited values / parsed objects to demo component -->
<p-d on=edited-value-changed to=details -care-of val=target.editedValue prop-from-event=target.name m=1 skip-init></p-d>
<p-d on=parsed-object-changed to=details -care-of val=target.parsedObject prop-from-event=target.name m=1 skip-init></p-d>
<details open>
  <summary></summary>
  <component--holder>
    <component--listeners></component--listeners>
  </component--holder>
</details>
<form>
  <fieldset data-open="true" data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963">
    <legend>✏️Edit <var></var>'s properties</legend>
  </fieldset>
</form>

<h4>Live Events Fired</h4>
<json-viewer -object allowlist="detail,type,bubbles,cancelBubble,cancelable,composed,defaultPrevented,eventPhase,isTrusted,returnValue,timeStamp"></json-viewer>
<aside>
  <details>
    <summary>View Schema</summary>
    <json-viewer allowlist="name,properties,attributes,slots,events"></json-viewer>
  </details>
</aside>
</main>
`);

const eventListenerForJsonViewer = T(/* html */`
<p-d from=details to=json-viewer[-object] val=. skip-init m=1></p-d>
`);

export const uiRefs = {fflVar: p, dSummary: p, dComponentHolder: p, dchComponentListenersForJsonViewer: p, adJsonViewer: p, fFieldset: p,}
symbolize(uiRefs);

const initTransform = ({self, tag}: SwagTagBase) => ({
  main:{
    '[-care-of]': tag,
    form:{
      fieldset: uiRefs.fFieldset,
      '"':{
        legend: [,{click: self.toggleForm},,{
          var: uiRefs.fflVar
        }] as PEATSettings
      },
    },
    details:{
      summary: uiRefs.dSummary,
      'component--holder': uiRefs.dComponentHolder,
      '"': {
        'component--listeners': uiRefs.dchComponentListenersForJsonViewer
      }
    },
    aside:{
      details:{
        'json-viewer': uiRefs.adJsonViewer
      }
    }
  }

} as TransformRules);



export const bindName = ({name}: SwagTagBase) => ({
  [uiRefs.dSummary]: name,
  [uiRefs.fflVar]: name,
  [uiRefs.dComponentHolder]: [name, 'afterBegin'],
});
export const addEventListeners =   ({events, name}: SwagTagBase) => ({
  [uiRefs.dchComponentListenersForJsonViewer]: [events || [], eventListenerForJsonViewer,,{
    [PD.is]:({item}: RenderContext) => [{observe: name, on: item.name}]
  }]
});
export const addEditors =   ({massagedProps, name}: SwagTagBase) => ({
  [uiRefs.fFieldset]: [massagedProps, ({item}: RenderContext) => (<any>item).editor,, {
    [`${SwagTagPrimitiveBase.is},${SwagTagObjectBase.is}`]: ({item, target}: RenderContext<SwagTagPrimitiveBase, PropertyInfo>) => {
      Object.assign(target, item);
      target!.setAttribute('role', 'textbox');
    },
    //'"': ({item}: RenderContext) => ([PD.is, 'afterEnd', [{on:'edited-value-changed', from:'form', to: 'details', careOf: name, prop: item.name, val: 'target.editedValue', m:1}]]),
    // [SwagTagObjectBase.is]: ({item, target}: RenderContext<SwagTagPrimitiveBase, PropertyInfo>) => {
    //   Object.assign(target, item);
    //   target!.setAttribute('role', 'textbox');
    // },
    //'""': ({item}: RenderContext) => ([PD.is, 'afterEnd', [{on:'parsed-object-changed', from:'form', to: 'details', careOf: name, prop: item.name, val: 'target.parsedObject', m:1}]])
  }]
});

export const bindSelf = ({attribs, self}: SwagTagBase) => ({
  [uiRefs.adJsonViewer]: [{object: self}]
});

const updateTransforms = [
  bindName,
  addEventListeners,
  addEditors,
  bindSelf
] as SelectiveUpdate<any>[];


export const linkWcInfo = ({viewModel, tag, self} : SwagTagBase) => {
  if(tag === undefined || viewModel === undefined) return;
  const wcInfo = viewModel.tags.find(t => t.name === tag)!;
  wcInfo.attribs = (<any>wcInfo).attributes;
  delete (<any>wcInfo).attributes;
  Object.assign(self, wcInfo);
}

const massaged = Symbol();
export function tryParsed(prop: PropertyInfo){
  

  let defaultVal = (<any>prop).default;
  let parsedType = undefined;
  if(defaultVal !== undefined){
    try{
      defaultVal = JSON.parse(defaultVal);
      parsedType = JSON.parse('[' + prop.type!.replace(/\|/g, ',') + ']');
    }catch(e){}
    if(Array.isArray(parsedType)){
      prop.value = defaultVal;
      prop.type = 'stringArray';
      prop.options = parsedType;
      return;
    }
    switch(typeof defaultVal){
      case 'object':

        prop.value = (<any>prop).default;
        prop.type = 'object'
        break;
      case 'string':
        prop.value = defaultVal;
        prop.type = 'string';
        break;
      case 'number':
        prop.value = defaultVal;
        prop.type = 'number';
        break;
      case 'boolean':
        prop.value = defaultVal;
        prop.type = 'boolean';
        break;
      default:
        prop.value = (<any>prop).default;
        prop.type = 'object';
    }
  }else{
    switch(prop.type){
      case 'string':
      case 'boolean':
      case 'number':
        break;
      default:
        prop.type = 'object';
    }
  }
}

export const linkMassagedProps = ({properties, self, block}: SwagTagBase) => {
  if(properties === undefined || (<any>properties)[massaged as any as string]) return;
  properties.forEach(prop =>{
    tryParsed(prop);
    const anyProp = <any>prop;
    switch(prop.type){
      case 'string':
      case 'number':
      case 'boolean':
        anyProp.editor = SwagTagPrimitiveBase.is;
        break;
      case 'object':
        anyProp.editor = SwagTagObjectBase.is;
        break;
      default:
        throw 'not implemented';
    }
  });
  (<any>properties)[massaged as any as string] = true;
  self.massagedProps = block !== undefined ? properties.filter(prop => !block.includes(prop.name!)) : properties;
}

export const triggerImportReferencedModule = ({path, self}: SwagTagBase) => {
  if(path !== undefined){
    if(self.href!.indexOf('//') > -1 && self.href!.indexOf('//') < 7){
      const selfResolvingModuleSplitPath = self.href!.split('/');
      selfResolvingModuleSplitPath.pop();
      const selfResolvingModulePath = selfResolvingModuleSplitPath.join('/') + self.path!.substring(1) + '?module';
      import(selfResolvingModulePath);
    }else{
      const splitPath = (location.origin + location.pathname).split('/');
      splitPath.pop();
      let path = self.path!;
      while(path.startsWith('../')){
        splitPath.pop();
        path = path.substr(3);
      }
      const importPath = splitPath.join('/') + '/' + path;
      import(importPath);
    }
  }
}

export const showHideEditor = ({editOpen, self}: SwagTagBase) => {
  (<any>self)[uiRefs.fFieldset].dataset.open = (editOpen || false).toString();
}

export class SwagTagBase extends XtalFetchViewElement<WCSuiteInfo> implements WCInfo {

  static is = "swag-tag-base";

  noShadow = true;

  mainTemplate = mainTemplate;
  readyToRender = true;

  static attributeProps: any = ({tag, name, properties, path, events, slots, testCaseNames, attribs, editOpen, block} : SwagTagBase) =>{
    const ap = {
      str: [tag, name, path],
      bool: [editOpen],
      obj: [properties, events, slots, testCaseNames, attribs, block],
      jsonProp: [block],
      reflect: [tag, editOpen]
    } as AttributeProps;
    return mergeProps(ap, (<any>XtalFetchViewElement).props);
  }

  propActions = [
    linkWcInfo, linkMassagedProps, triggerImportReferencedModule, showHideEditor
  ];

  initTransform = initTransform;
  

  updateTransforms = updateTransforms;

  tag: string | undefined;

  name: string | undefined;

  block: string[] | undefined;

  description: string | undefined;

  properties: PropertyInfo[] | undefined;
  massagedProps: PropertyInfo[] | undefined;

  path: string | undefined;

  events: CustomEventInfo[] | undefined;

  slots: SlotInfo[] | undefined;

  attribs: AttribInfo[] | undefined; 

  testCaseNames: string[] | undefined;

  editOpen: boolean | undefined;

  toggleForm(e: Event){
    this.editOpen = !this.editOpen;
  }

}

define(SwagTagBase);


