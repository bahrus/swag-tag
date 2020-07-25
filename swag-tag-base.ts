import { WCSuiteInfo, WCInfo, PropertyInfo, CustomEventInfo, SlotInfo, AttribInfo } from "wc-info/types.js";
//import { repeat } from "trans-render/repeat.js";
import { replaceTargetWithTag } from "trans-render/replaceTargetWithTag2.js";
import {symbolize} from 'xtal-element/symbolize.js';
import { appendTag } from "trans-render/appendTag.js";
import { createTemplate as T } from "trans-render/createTemplate.js";
import {
  RenderOptions,
  TransformRules,
  PSettings,
  PESettings,
  PEASettings
} from "trans-render/types.d.js";
import {
  RenderContext
} from 'trans-render/types2.d.js';
import { XtalFetchViewElement, define, mergeProps, AttributeProps} from "xtal-element/XtalFetchViewElement.js";
import "p-et-alia/p-d.js";
import { PDProps } from 'p-et-alia/types.d.js';
import { extend } from "p-et-alia/p-d-x.js";
import { XtalJsonEditor } from "xtal-json-editor/xtal-json-editor.js";
import { SwagTagPrimitiveBase } from './swag-tag-primitive-base.js';
import { SelectiveUpdate } from "../xtal-element/types.js";

const mainTemplate = T(/* html */ `
<header>
</header>
<form>
  <fieldset>
    <legend>✏️Edit <var></var>'s properties</legend>
  </fieldset>
</form>
<details open>
  <summary></summary>
  <var></var>
</details>
<h4>Live Events Fired</h4>
<json-viewer contenteditable>
  {"hello": "goodbye"}
</json-viewer>
<main></main>
<footer></footer>
`);

interface IUIRef{editName: symbol; fieldset: symbol, summary: symbol; xtalJsonEditor: symbol; var$: symbol;}
const symbolGen = ({editName, fieldset, summary, xtalJsonEditor, var$}: IUIRef) => 0;
const uiRefs = symbolize(symbolGen) as IUIRef;

const initTransform = {
  form:{
    fieldset: uiRefs.fieldset,
    '"':{
      legend: {
        var: uiRefs.editName,
      }
    },
  },
  details:{
    summary: uiRefs.summary,
    var: uiRefs.var$
  },
};

const updateTransforms = [
  ({name}: SwagTagBase) => ({
    [uiRefs.summary]: name,
    [uiRefs.editName]: name,
    [uiRefs.var$]: [name]
  }),
  ({properties}: SwagTagBase) => ({
    [uiRefs.fieldset]: [properties, SwagTagPrimitiveBase.is,, {
      [SwagTagPrimitiveBase.is]: ({item, target}: RenderContext<SwagTagPrimitiveBase, PropertyInfo>) => {
        Object.assign(target, item);
      }
    }]
  })
] as SelectiveUpdate<any>[];



// const valFromEvent = (e: Event) => ({
//   type: e.type,
//   detail: (<any>e).detail
// });

const linkWcInfo = ({viewModel, tag, self} : SwagTagBase) => {
  if(tag === undefined || viewModel === undefined) return;
  const wcInfo = viewModel.tags.find(t => t.name === tag)!;
  wcInfo.attribs = (<any>wcInfo).attributes;
  delete (<any>wcInfo).attributes;
  Object.assign(self, wcInfo);
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

  static attributeProps: any = ({tag, name, properties, path, events, slots, testCaseNames} : SwagTagBase) =>{
    const ap = {
      str: [tag, name, path],
      obj: [properties, events, slots, testCaseNames],
      reflect: [tag]
    } as AttributeProps;
    return mergeProps(ap, (<any>XtalFetchViewElement).props);
  }

  propActions = [
    linkWcInfo,
  ];

  updateTransforms = updateTransforms;

  tag: string | undefined;

  name: string | undefined;

  description: string | undefined;

  properties: PropertyInfo[] | undefined;

  path: string | undefined;

  events: CustomEventInfo[] | undefined;

  slots: SlotInfo[] | undefined;

  attribs: AttribInfo[] | undefined; 

  testCaseNames: string[] | undefined;
  //#region Required Methods / Properties

  get readyToRender(){
    if(this.name === undefined) return false;
    if(this.path !== undefined) {
      this.importReferencedModule();
      return true;
    }
    return noPathFoundTemplate;
  }

  initTransform = initTransform;

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


