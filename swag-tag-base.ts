import { WCSuiteInfo, WCInfo, PropertyInfo, CustomEventInfo, SlotInfo, AttribInfo } from "wc-info/types.js";
import { createTemplate as T } from "trans-render/createTemplate.js";
import {RenderContext, PEATSettings} from 'trans-render/types2.d.js';
import { XtalFetchViewElement, define, mergeProps, AttributeProps, p, symbolize} from "xtal-element/XtalFetchViewElement.js";
import {PD} from "p-et-alia/p-d.js";
import { SwagTagPrimitiveBase } from './swag-tag-primitive-base.js';
import {SwagTagObjectBase} from './swag-tag-object-base.js';
import { SelectiveUpdate, TransformRules} from "../xtal-element/types.js";
import('@power-elements/json-viewer/json-viewer.js');

const mainTemplate = T(/* html */ `
<style id=collapsibleForm>
  legend{
    cursor: pointer;
  }
  fieldset[data-open="false"] [role="textbox"]{
    display: none;
  }
  fieldset[data-open="true"]{
    height: 500px;
    overflow-y:auto;
  }
</style>
<form>
  <fieldset data-open="false">
    <legend>✏️Edit <var></var>'s properties</legend>
  </fieldset>
</form>
<details open>
  <summary></summary>
  <var>
    <div></div>
  </var>
</details>
<h4>Live Events Fired</h4>
<json-viewer -object allowlist="detail,type,bubbles,cancelBubble,cancelable,composed,defaultPrevented,eventPhase,isTrusted,returnValue,timeStamp"></json-viewer>
<aside>
  <details>
    <summary>View Schema</summary>
    <json-viewer allowlist="name,properties,attributes,slots,events"></json-viewer>
  </details>
</aside>
`);

const eventListener = T(/* html */`
<p-d from=details to=json-viewer[-object] val=. skip-init m=1></p-d>
`);

export const uiRefs = {fflVar: p, dSummary: p, dVar: p, dsvDiv: p, adJV: p, fFieldset: p,}
symbolize(uiRefs);

const initTransform = ({self}: SwagTagBase) =>({
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
    var: uiRefs.dVar,
    '"': {
      div: uiRefs.dsvDiv
    }
  },
  aside:{
    details:{
      'json-viewer': uiRefs.adJV
    }
  }
} as TransformRules);



export const bindName = ({name}: SwagTagBase) => ({
  [uiRefs.dSummary]: name,
  [uiRefs.fflVar]: name,
  [uiRefs.hdsVar]: name,
  [uiRefs.dVar]: [name, 'afterBegin'],
});
export const addEventListeners =   ({events, name}: SwagTagBase) => ({
  [uiRefs.dsvDiv]: [events || [], eventListener,,{
    [PD.is]:({item}: RenderContext) => [{observe: name, on: item.name}]
  }]
});
export const addEditors =   ({massagedProps, name}: SwagTagBase) => ({
  [uiRefs.fFieldset]: [massagedProps, ({item}: RenderContext) => (<any>item).editor,, {
    [SwagTagPrimitiveBase.is]: ({item, target}: RenderContext<SwagTagPrimitiveBase, PropertyInfo>) => {
      Object.assign(target, item);
      target!.setAttribute('role', 'textbox');
    },
    '"': ({item}: RenderContext) => ([PD.is, 'afterEnd', [{on:'edited-value-changed', from:'form', to: 'details', careOf: name, prop: item.name, val: 'target.editedValue', m:1}]]),
    [SwagTagObjectBase.is]: ({item, target}: RenderContext<SwagTagPrimitiveBase, PropertyInfo>) => {
      Object.assign(target, item);
      target!.setAttribute('role', 'textbox');
    },
    '""': ({item}: RenderContext) => ([PD.is, 'afterEnd', [{on:'parsed-object-changed', from:'form', to: 'details', careOf: name, prop: item.name, val: 'target.parsedObject', m:1}]])
  }]
});

export const bindSelf = ({attribs, self}: SwagTagBase) => ({
  [uiRefs.adJV]: [{object: self}]
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
  if(defaultVal !== undefined){
    try{
      defaultVal = JSON.parse(defaultVal);
    }catch(e){}
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

export const linkMassagedProps = ({properties, self}: SwagTagBase) => {
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
  self.massagedProps = properties;
}

export const triggerImportReferencedModule = ({path, self}: SwagTagBase) => {
  if(path !== undefined){
    self.importReferencedModule();
  }
}


export const noPathFound$ = Symbol();
export const noPathFoundTemplate = 'noPathFoundTemplate';
export class SwagTagBase extends XtalFetchViewElement<WCSuiteInfo> implements WCInfo {

  static is = "swag-tag-base";

  noShadow = true;

  mainTemplate = mainTemplate;
  readyToRender = true;

  static attributeProps: any = ({tag, name, properties, path, events, slots, testCaseNames, attribs} : SwagTagBase) =>{
    const ap = {
      str: [tag, name, path],
      obj: [properties, events, slots, testCaseNames, attribs],
      reflect: [tag]
    } as AttributeProps;
    return mergeProps(ap, (<any>XtalFetchViewElement).props);
  }

  propActions = [
    linkWcInfo, linkMassagedProps, triggerImportReferencedModule
  ];

  initTransform = initTransform;
  

  updateTransforms = updateTransforms;

  tag: string | undefined;

  name: string | undefined;

  description: string | undefined;

  properties: PropertyInfo[] | undefined;
  massagedProps: PropertyInfo[] | undefined;

  path: string | undefined;

  events: CustomEventInfo[] | undefined;

  slots: SlotInfo[] | undefined;

  attribs: AttribInfo[] | undefined; 

  testCaseNames: string[] | undefined;

  toggleForm(e: Event){
    const fieldset = (e.target as HTMLElement).closest('fieldset') as HTMLFieldSetElement;
    const currentVal = fieldset.dataset.open;
    fieldset.dataset.open = currentVal === 'true'? 'false': 'true';
  }

  get [noPathFoundTemplate](){
    return T(`<div>No path found.</div>`, SwagTagBase, noPathFound$);
  }

  importReferencedModule() {
    if(this.href!.indexOf('//') > -1 && this.href!.indexOf('//') < 7){
      const selfResolvingModuleSplitPath = this.href!.split('/');
      selfResolvingModuleSplitPath.pop();
      const selfResolvingModulePath = selfResolvingModuleSplitPath.join('/') + this.path!.substring(1) + '?module';
      import(selfResolvingModulePath);
    }else{
      const splitPath = (location.origin + location.pathname).split('/');
      splitPath.pop();
      let path = this.path!;
      while(path.startsWith('../')){
        splitPath.pop();
        path = path.substr(3);
      }
      const importPath = splitPath.join('/') + '/' + path;
      import(importPath);
    }

  }

}

define(SwagTagBase);


