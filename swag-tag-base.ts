import { WCSuiteInfo, WCInfo, PropertyInfo, CustomEventInfo, SlotInfo, AttribInfo } from "wc-info/types.js";
import {symbolize} from 'xtal-element/symbolize.js';
import { createTemplate as T } from "trans-render/createTemplate.js";
import {RenderContext, PEATSettings} from 'trans-render/types2.d.js';
import { XtalFetchViewElement, define, mergeProps, AttributeProps} from "xtal-element/XtalFetchViewElement.js";
import {PD} from "p-et-alia/p-d.js";
import { SwagTagPrimitiveBase } from './swag-tag-primitive-base.js';
import {SwagTagObjectBase} from './swag-tag-object-base.js';
import { SelectiveUpdate, TransformRules} from "../xtal-element/types.js";
import('@power-elements/json-viewer/json-viewer.js');

interface IUIRef{editName: symbol; fieldset: symbol, summary: symbol;editingName: symbol; schemaName: symbol; eventListeners: symbol; tagInfoViewer: symbol}
const symbolGen = ({editName, fieldset, summary, editingName, schemaName, eventListeners, tagInfoViewer}: IUIRef) => 0;
export const uiRefs = symbolize(symbolGen) as IUIRef;

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
<header>
  <details>
    <summary><var></var> schema</summary>
    
  </details>
</header>
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
<p-d m=1 from=details to=json-viewer[-object] val=. skip-init></p-d>
`);


const initTransform = ({self}: SwagTagBase) =>({
  header:{
    details:{
      summary:{
        var: uiRefs.schemaName
      },
      
    },
  },
  form:{
    fieldset: uiRefs.fieldset,
    '"':{
      legend: [,{click: self.toggleForm},,{
        var: uiRefs.editName
      }] as PEATSettings
    },
  },
  details:{
    summary: uiRefs.summary,
    var: uiRefs.editingName,
    '"': {
      div: uiRefs.eventListeners
    }
  },
  aside:{
    details:{
      'json-viewer': uiRefs.tagInfoViewer
    }
  }
} as TransformRules);



export const bindName = ({name}: SwagTagBase) => ({
  [uiRefs.summary]: name,
  [uiRefs.editName]: name,
  [uiRefs.schemaName]: name,
  [uiRefs.editingName]: [name, 'afterBegin'],
});
export const addEventListeners =   ({events, name}: SwagTagBase) => ({
  [uiRefs.eventListeners]: [events || [], eventListener,,{
    [PD.is]:({item}: RenderContext) => [{observe: name, on: item.name}]
  }]
});
export const addEditors =   ({massagedProps, name}: SwagTagBase) => ({
  [uiRefs.fieldset]: [massagedProps, ({item}: RenderContext) => (<any>item).editor,, {
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
  [uiRefs.tagInfoViewer]: [{object: self}]
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


const pdxEvent = 'event';
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
      selfResolvingModuleSplitPath?.pop();
      const selfResolvingModulePath = selfResolvingModuleSplitPath?.join('/') + this.path!.substring(1) + '?module';
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


