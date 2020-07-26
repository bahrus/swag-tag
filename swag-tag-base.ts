import { WCSuiteInfo, WCInfo, PropertyInfo, CustomEventInfo, SlotInfo, AttribInfo } from "wc-info/types.js";
import {symbolize} from 'xtal-element/symbolize.js';
import { createTemplate as T } from "trans-render/createTemplate.js";
import {RenderContext, PEATSettings} from 'trans-render/types2.d.js';
import { XtalFetchViewElement, define, mergeProps, AttributeProps} from "xtal-element/XtalFetchViewElement.js";
import {PD} from "p-et-alia/p-d.js";
import { SwagTagPrimitiveBase } from './swag-tag-primitive-base.js';
import {SwagTagObjectBase} from './swag-tag-object-base.js';
import { SelectiveUpdate, TransformRules} from "../xtal-element/types.js";

const mainTemplate = T(/* html */ `
<style id=collapsibleForm>
  legend{
    cursor: pointer;
  }
  fieldset[data-open="false"] ${SwagTagPrimitiveBase.is}, fieldset[data-open="false"] ${SwagTagObjectBase.is} {
    display: none;
  }
</style>
<header>
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
<dfn -text-content></dfn>
<json-viewer -data></json-viewer>
<main></main>
<footer></footer>
`);

const eventListener = T(/* html */`
<p-d m=1 from=details to=json-viewer[-data] val=detail></p-d>
<p-d m=1 from=details to=dfn[-text-content] val=type></p-d>
`);

interface IUIRef{editName: symbol; fieldset: symbol, summary: symbol; xtalJsonEditor: symbol; var$: symbol; eventListeners$: symbol;}
const symbolGen = ({editName, fieldset, summary, xtalJsonEditor, var$, eventListeners$}: IUIRef) => 0;
const uiRefs = symbolize(symbolGen) as IUIRef;



const updateTransforms = [
  ({name}: SwagTagBase) => ({
    [uiRefs.summary]: name,
    [uiRefs.editName]: name,
    [uiRefs.var$]: [name, 'afterBegin'],
  }),
  ({events, name}: SwagTagBase) => ({
    [uiRefs.eventListeners$]: [events, eventListener,,{
      [PD.is]:({item}) => [{observe: name, on: item.name}]
    }]
  }),
  ({massagedProps, name}: SwagTagBase) => ({
    [uiRefs.fieldset]: [massagedProps, ({item}) => (<any>item).isPrimitive ?  SwagTagPrimitiveBase.is : SwagTagObjectBase.is,, {
      [SwagTagPrimitiveBase.is]: ({item, target}: RenderContext<SwagTagPrimitiveBase, PropertyInfo>) => {
        Object.assign(target, item);
      },
      '"': ({item}) => ([PD.is, 'afterEnd', [{on:'input', from:'form', to: 'details', careOf: name, prop: item.name, val: 'target.value', m:1}]]),
      [SwagTagObjectBase.is]: ({item, target}: RenderContext<SwagTagPrimitiveBase, PropertyInfo>) => {
        Object.assign(target, item);
      },
      '""': ({item}) => ([PD.is, 'afterEnd', [{on:'parsed-object-changed', from:'form', to: 'details', careOf: name, prop: item.name, val: 'target.parsedObject', m:1}]])

    }]
  })
] as SelectiveUpdate<any>[];


export const linkWcInfo = ({viewModel, tag, self} : SwagTagBase) => {
  if(tag === undefined || viewModel === undefined) return;
  const wcInfo = viewModel.tags.find(t => t.name === tag)!;
  wcInfo.attribs = (<any>wcInfo).attributes;
  delete (<any>wcInfo).attributes;
  Object.assign(self, wcInfo);
}

const massaged = Symbol();
export const linkMassagedProps = ({properties, self}: SwagTagBase) => {
  if(properties === undefined || (<any>properties)[massaged as any as string]) return;
  properties.forEach(prop =>{
    prop.value = (<any>prop).default;
    switch(prop.type){
      case 'string':
      case 'number':
      case 'boolean':
        (<any>prop).isPrimitive = true;
        break;
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
export const propInfo$ = Symbol();
export const propBase$ = Symbol();
export const noPathFound$ = Symbol();
export const noPathFoundTemplate = 'noPathFoundTemplate';
export class SwagTagBase extends XtalFetchViewElement<WCSuiteInfo> implements WCInfo {
  constructor(){
    super();
    import('@alenaksu/json-viewer/build/index.js');
  }
  static is = "swag-tag-base";

  noShadow = true;

  mainTemplate = mainTemplate;
  readyToRender = true;

  static attributeProps: any = ({tag, name, properties, path, events, slots, testCaseNames} : SwagTagBase) =>{
    const ap = {
      str: [tag, name, path],
      obj: [properties, events, slots, testCaseNames],
      reflect: [tag]
    } as AttributeProps;
    return mergeProps(ap, (<any>XtalFetchViewElement).props);
  }

  propActions = [
    linkWcInfo, linkMassagedProps, triggerImportReferencedModule
  ];

  initTransform = {
    form:{
      fieldset: uiRefs.fieldset,
      '"':{
        legend: [,{click: this.toggleForm},,{
          var: uiRefs.editName
        }] as PEATSettings
      },
    },
    details:{
      summary: uiRefs.summary,
      var: uiRefs.var$,
      '"': {
        div: uiRefs.eventListeners$
      }
    },
  } as TransformRules;

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
    const selfResolvingModuleSplitPath = this.href?.split('/');
    selfResolvingModuleSplitPath?.pop();
    const selfResolvingModulePath = selfResolvingModuleSplitPath?.join('/') + this.path!.substring(1) + '?module';
    import(selfResolvingModulePath);
  }

}

define(SwagTagBase);


