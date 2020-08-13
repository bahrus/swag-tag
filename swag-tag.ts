import { WCSuiteInfo, WCInfo, PropertyInfo, CustomEventInfo, SlotInfo, AttribInfo } from "wc-info/types.js";
import { more } from 'trans-render/transform.js';
import { templStampSym} from 'trans-render/standardPlugins.js';
import { createTemplate as T } from "trans-render/createTemplate.js";
import { 
  XtalFetchViewElement, define, mergeProps, AttributeProps, p, symbolize, RenderContext, PESettings, TransformValueOptions,
  SelectiveUpdate
} from "xtal-element/XtalFetchViewElement.js";
import {PD} from "p-et-alia/p-d.js";
import { SwagTagPrimitiveBase } from './lib/swag-tag-primitive-base.js';
//import { SwagTagObjectBase } from './lib/swag-tag-object-base.js';
import { JsonEventViewer } from './lib/json-event-viewer.js';
import { SwagTagJsonEditor } from "./lib/swag-tag-json-editor.js";

//#region Templates 
//Very little top level styling used, so consumers can take the first crack at styling.
//So make what little styling there is  guaranteed to not affect anything else via guid.
const mainTemplate = T(/* html */ `
<style id=0f0d62e5-0d00-4e70-ad90-277fcd94c963>
  fieldset[data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963"]>legend{
    cursor: pointer;
  }
  fieldset[data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963"][data-open="false"]>[part="scrollableArea"]{
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
<header part=header>
</header>
<section part=section>
  <div part=componentHolder>
    <div part=componentListeners></div>
  </div>
</section>
<json-event-viewer -new-event part=jsonEventViewer></json-event-viewer>
<form part=propsEditor>
  <fieldset data-open="true" data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963" part=fieldset>
    <legend part=legend><span part=action>Edit</span> <var part=componentName></var>'s properties</legend>
    <div part=scrollableArea>
    </div>
  </fieldset>
</form>

<details part=viewSchema>
  <summary>View Schema</summary>
  <json-viewer part=jsonViewer allowlist="name,properties,attributes,slots,events"></json-viewer>
</details>

</main>
`);

const eventListenerForJsonViewer = T(/* html */`
<p-d from=section to=${JsonEventViewer.is}[-new-event] val=. skip-init m=1></p-d>
`);

//#endregion

//#region Transforms
export const uiRefs = {
  componentName: p, header: p, componentHolder: p, componentListeners: p, jsonViewer: p, 
  fieldset: p, scrollableArea: p, legend: p
};

symbolize(uiRefs);

const initTransform = ({self, tag}: SwagTag) => ({
  ':host': [templStampSym, uiRefs],
  [uiRefs.legend]: [{},{click: self.toggleForm}] as PESettings,
  main:{
    '[-care-of]': tag,
  }
} as TransformValueOptions);



export const bindName = ({name, innerTemplate}: SwagTag) => ({
  [uiRefs.header]: `<${name}>`,
  [uiRefs.componentName]: name,
  [uiRefs.componentHolder]: [name, 'afterBegin'],
  [more]:{
    [uiRefs.componentHolder]: {
      [name!]: ({target}: RenderContext) => {
        if(innerTemplate !== undefined){
          target!.appendChild(innerTemplate!.content.cloneNode(true));
        }
        
      }
    }
  }
});
export const addEventListeners =   ({events, name}: SwagTag) => ({
  [uiRefs.componentListeners]: [events || [], eventListenerForJsonViewer,,{
    [PD.is]:({item}: RenderContext) => [{observe: name, on: item.name}]
  }]
});

export const copyPropInfoIntoEditor = ({item, target}: RenderContext<HTMLElement, PropertyInfo>) => {
  Object.assign(target, item);
  target!.setAttribute('role', 'textbox');
};

const copyPropInfoIntoEditors = {
  [`${SwagTagPrimitiveBase.is},${SwagTagJsonEditor.is}`]: copyPropInfoIntoEditor,
}

export const addEditors =   ({massagedProps, name}: SwagTag) => ({
  // Loop over massagedProps, and insert dynamic editor via tag name (item.editor is the tag name)
  [uiRefs.scrollableArea]: [
    //Array to loop over
    massagedProps || [],
    //A **toTagOrTemplate** function that returns a string -- used to generate a (custom element) with the name of the string. 
    ({item}: RenderContext) => (<any>item).editor,
    //range could go here
    , 
    //now that document.createElement(tag) done, apply transform
    copyPropInfoIntoEditors]
});

export const bindSelf = ({attribs, self}: SwagTag) => ({
  [uiRefs.jsonViewer]: [{object: self}]
});

const updateTransforms = [
  bindName,
  addEventListeners,
  addEditors,
  bindSelf
] as SelectiveUpdate<any>[];
//#endregion

//#region propActions
export const linkWcInfo = ({viewModel, tag, self} : SwagTag) => {
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
export const linkMassagedProps = ({properties, self, block}: SwagTag) => {
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
        anyProp.editor = SwagTagJsonEditor.is;
        break;
      default:
        throw 'not implemented';
    }
  });
  (<any>properties)[massaged as any as string] = true;
  self.massagedProps = block !== undefined ? properties.filter(prop => !block.includes(prop.name!)) : properties;
}

export const linkInnerTemplate = ({useInnerTemplate, self}: SwagTag) =>{
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

export const triggerImportReferencedModule = ({path, self}: SwagTag) => {
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

export const showHideEditor = ({editOpen, self}: SwagTag) => {
  (<any>self)[uiRefs.fieldset].dataset.open = (editOpen || false).toString();
}

const propActions = [
  linkWcInfo, linkMassagedProps, triggerImportReferencedModule, showHideEditor, linkInnerTemplate
];
//#endregion

/**
 * @csspart header
 * @csspart section
 * @csspart componentHolder
 * @csspart componentListeners
 * @csspart jsonEventViewer
 * @csspart propsEditor
 * @csspart fieldset
 * @csspart action
 * @csspart componentName
 * @csspart scrollableArea
 * @csspart viewSchema
 * @csspart jsonViewer
 */
export class SwagTag extends XtalFetchViewElement<WCSuiteInfo> implements WCInfo {

  static is = "swag-tag";

  /**
   * @private
   */
  noShadow = true;

  mainTemplate = mainTemplate;
  readyToRender = true;

  static attributeProps: any = ({tag, name, properties, path, events, slots, testCaseNames, attribs, editOpen, block, useInnerTemplate, innerTemplate} : SwagTag) =>{
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

define(SwagTag);


