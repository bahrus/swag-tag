import { WCSuiteInfo, WCInfo, PropertyInfo, CustomEventInfo, SlotInfo, AttribInfo } from "wc-info/types.js";
import {more} from 'trans-render/transform.js';
import { createTemplate as T } from "trans-render/createTemplate.js";
//import {RenderContext, PEATSettings, PEATUnionSettings} from 'trans-render/types2.d.js';
import { 
  XtalFetchViewElement, define, mergeProps, AttributeProps, p, symbolize, RenderContext, PEATSettings, TransformValueOptions,
  SelectiveUpdate
} from "xtal-element/XtalFetchViewElement.js";
import {PD} from "p-et-alia/p-d.js";
import { SwagTagPrimitiveBase, linkInputType } from './swag-tag-primitive-base.js';
import {SwagTagObjectBase} from './swag-tag-object-base.js';
import {JsonEventViewer} from './json-event-viewer.js';
//import('@power-elements/json-viewer/json-viewer.js');

//Very little top level styling used, so consumers can take the first crack at styling.
//So make what little styling there is  guaranteed to not affect anything else via guid.
const mainTemplate = T(/* html */ `
<style id=0f0d62e5-0d00-4e70-ad90-277fcd94c963>
  fieldset[data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963"]>legend{
    cursor: pointer;
  }
  fieldset[data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963"][data-open="false"]>scrollable--area{
    display: none;
  }
  fieldset[data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963"][data-open="true"]>[part="scrollableArea"]{
    max-height: 500px;
    overflow-y:auto;
    display:flex;
    flex-direction: column;
  }
</style>
<main>
<!-- pass down edited values / parsed objects to demo component -->
<p-d on=edited-value-changed to=section -care-of val=target.editedValue prop-from-event=target.name m=1 skip-init></p-d>
<p-d on=parsed-object-changed to=section -care-of val=target.parsedObject prop-from-event=target.name m=1 skip-init></p-d>
<header>
</header>
<section>
  <component--holder>
    <component--listeners></component--listeners>
  </component--holder>
</section>
<json-event-viewer -new-event></json-event-viewer>
<form>
  <fieldset data-open="true" data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963">
    <legend>✏️Edit <var></var>'s properties</legend>
    <div part=scrollableArea>
    </div>
  </fieldset>
</form>


<aside>
  <details>
    <summary>View Schema</summary>
    <json-viewer allowlist="name,properties,attributes,slots,events"></json-viewer>
  </details>
</aside>
</main>
`);

const eventListenerForJsonViewer = T(/* html */`
<p-d from=section to=${JsonEventViewer.is}[-new-event] val=. skip-init m=1></p-d>
`);

export const uiRefs = {
  fflVar: p, header: p, dComponentHolder: p, dchComponentListenersForJsonViewer: p, adJsonViewer: p, 
  fFieldset: p, ffScrollableArea: p
};

symbolize(uiRefs);

const initTransform = ({self, tag}: SwagTagBase) => ({
  main:{
    '[-care-of]': tag,
    header: uiRefs.header,
    section:{
      'component--holder': uiRefs.dComponentHolder,
      '"': {
        'component--listeners': uiRefs.dchComponentListenersForJsonViewer
      }
    },
    form:{
      fieldset:{
        legend: [{},{click: self.toggleForm},,{
          var: uiRefs.fflVar
        }] as PEATSettings,
        '[part="scrollableArea"]': uiRefs.ffScrollableArea
      },
      '"': uiRefs.fFieldset
    },
    aside:{
      details:{
        'json-viewer': uiRefs.adJsonViewer
      }
    }
  }

} as TransformValueOptions);



export const bindName = ({name, innerTemplate}: SwagTagBase) => ({
  [uiRefs.header]: `<${name}>`,
  [uiRefs.fflVar]: name,
  [uiRefs.dComponentHolder]: [name, 'afterBegin'],
  [more]:{
    [uiRefs.dComponentHolder]: {
      [name!]: ({target}: RenderContext) => {
        if(innerTemplate !== undefined){
          target!.appendChild(innerTemplate!.content.cloneNode(true));
        }
        
      }
    }
  }
});
export const addEventListeners =   ({events, name}: SwagTagBase) => ({
  [uiRefs.dchComponentListenersForJsonViewer]: [events || [], eventListenerForJsonViewer,,{
    [PD.is]:({item}: RenderContext) => [{observe: name, on: item.name}]
  }]
});

export const copyPropInfoIntoEditor = ({item, target}: RenderContext<HTMLElement, PropertyInfo>) => {
  Object.assign(target, item);
  target!.setAttribute('role', 'textbox');
};

const copyPropInfoIntoEditors = {
  [`${SwagTagPrimitiveBase.is},${SwagTagObjectBase.is}`]: copyPropInfoIntoEditor,
}

export const addEditors =   ({massagedProps, name}: SwagTagBase) => ({
  // Loop over massagedProps, and insert dynamic editor via tag name (item.editor is the tag name)
  [uiRefs.ffScrollableArea]: [
    //Array to loop over
    massagedProps || [],
    //A **toTagOrTemplate** function that returns a string -- used to generate a (custom element) with the name of the string. 
    ({item}: RenderContext) => (<any>item).editor,
    //range could go here
    , 
    //now that document.createElement(tag) done, apply transform
    copyPropInfoIntoEditors]
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


export function adjustValueAndType(prop: PropertyInfo){
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

const massaged = Symbol();
export const linkMassagedProps = ({properties, self, block}: SwagTagBase) => {
  if(properties === undefined || (<any>properties)[massaged as any as string]) return;
  properties.forEach(prop =>{
    adjustValueAndType(prop);
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

export const linkInnerTemplate = ({useInnerTemplate, self}: SwagTagBase) =>{
  if(!useInnerTemplate) return;
  const innerTemplate = self.querySelector('template');
  if(innerTemplate === null){
    setTimeout(() =>{
      linkInnerTemplate(self);
    }, 50);
    return;
  }
  self.innerTemplate = innerTemplate;
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

  static attributeProps: any = ({tag, name, properties, path, events, slots, testCaseNames, attribs, editOpen, block, useInnerTemplate, innerTemplate} : SwagTagBase) =>{
    const ap = {
      str: [tag, name, path],
      bool: [editOpen, useInnerTemplate],
      obj: [properties, events, slots, testCaseNames, attribs, block, innerTemplate],
      jsonProp: [block],
      reflect: [tag, editOpen]
    } as AttributeProps;
    return mergeProps(ap, (<any>XtalFetchViewElement).props);
  }

  propActions = [
    linkWcInfo, linkMassagedProps, triggerImportReferencedModule, showHideEditor, linkInnerTemplate
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

  useInnerTemplate: boolean | undefined;

  innerTemplate: HTMLTemplateElement | undefined;

  toggleForm(e: Event){
    this.editOpen = !this.editOpen;
  }

}

define(SwagTagBase);


