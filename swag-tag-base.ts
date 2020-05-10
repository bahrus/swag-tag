import { WCSuiteInfo, WCInfo } from "wc-info/types.js";
import { define } from "trans-render/define.js";
import { repeat } from "trans-render/repeat.js";
import { replaceTargetWithTag } from "trans-render/replaceTargetWithTag.js";
import { appendTag } from "trans-render/appendTag.js";
import { createTemplate as T } from "trans-render/createTemplate.js";
import {
  RenderContext,
  RenderOptions,
  TransformRules,
  PSettings,
  PESettings,
  PEASettings
} from "trans-render/types.d.js";
//import { XtalViewElement } from "xtal-element/xtal-view-element.js";
import { XtalFetchViewElement} from "xtal-element/XtalFetchViewElement.js";
import "p-et-alia/p-d.js";
import { PDProps } from 'p-et-alia/types.d.js';
import { extend } from "p-et-alia/p-d-x.js";
import { XtalJsonEditor } from "xtal-json-editor/xtal-json-editor.js";



const mainTemplate = T(/* html */ `
<header>
</header>
<fieldset>
  <legend>✏️Edit <var></var>'s properties</legend>
  <form>
  </form>
</fieldset>
<details open>
  <summary></summary>
</details>
<h4>Live Events Fired</h4>
<xtal-json-editor options="{}"  height="300px"></xtal-json-editor>
<main></main>
<footer></footer>
`);

const valFromEvent = (e: Event) => ({
  type: e.type,
  detail: (<any>e).detail
})


const tag = "tag";
const pdxEvent = 'event';
export const propInfo$ = Symbol();
export const propBase$ = Symbol();
export const fieldEditor$ = Symbol();
export const noPathFound$ = Symbol();
export const noPathFoundTemplate = 'noPathFoundTemplate';
export class SwagTagBase extends XtalFetchViewElement<WCSuiteInfo> {
  static get is() {
    return "swag-tag-base";
  }

  //#region Required Methods / Properties

  get readyToRender(){
    if(this._wcInfo !== undefined && this._wcInfo.path !== undefined) {
      this.importReferencedModule();
      return true;
    }
    return noPathFoundTemplate;
  }

  mainTemplate = mainTemplate;

  get initTransform(){
    const allProperties = this._wcInfo.properties;
    if (allProperties === undefined) return {};
    const writeableProps = allProperties.filter(prop => !prop.readOnly);
    return {
      fieldset: {
          form: ({ target, ctx }) =>
            repeat([fieldEditor$, /* html */ `
                <div>
                  <label></label>
                  <input>
                  <p-d-x-json-parsed on=input from=fieldset to=details m=1 skip-init></p-d>
                </div>
              `], ctx, writeableProps, target, {
              div: ({ target, item }) => {
                const propAny = item as any;
                (<any>target)[propInfo$] = item;
                const propVal = item.default;
                let propBase = 'object';
                switch (item.type) {
                  case 'boolean': case 'string':
                    propBase = item.type;
                    break;

                }
                propAny[propBase$] = propBase;
                return {
                  label: [{ textContent: item.name},,{ for: 'rc_' + item.name }] as PEASettings<HTMLLabelElement>,
                  input: ({ target, ctx }) => {
                    if (propBase === 'object') {
                      replaceTargetWithTag(target, ctx, 'textarea');
                    }
                  },
                  '"': [,, { type: item.type === 'boolean' ? 'checkbox' : 'text', id: 'rc_' + item.name }] as PEASettings<HTMLInputElement>,
                  textarea: [{ textContent: item.default },,{ id: 'rc_' + item.name }]  as PEASettings<HTMLTextAreaElement>,
                  'input[type="checkbox"]': [,, { checked: item.default }]  as PEASettings<HTMLInputElement>,
                  'input[type="text"]': [,,{ value: item.default ?? '' }] as PEASettings<HTMLInputElement>,
                  '[on]': [{ careOf: this._wcInfo.name, prop: item.name as string }] as PSettings<PDProps>,
                };
              },
            }) as TransformRules
      },
      '"':{
        legend:{
          var: this._wcInfo.name
        }
      },
      details: ({ target }) => {
        const el = appendTag(target, this._wcInfo.name, {}) as any;
        //Set initial values
        this._wcInfo.properties?.filter(prop => prop.default !== undefined).forEach(prop => {
          el[prop.name] = JSON.parse(prop.default);
        })
        const ces = this._wcInfo.events;
        if (ces !== undefined) el.setAttribute("disabled", ces.length.toString());
        if (ces !== undefined) {
          ces.forEach(ce => {
            const pdEvent = extend({
              name: pdxEvent,
              valFromEvent: valFromEvent,
              insertAfter: el
            }) as HTMLElement;
            Object.assign(pdEvent, { on: ce.name, from: 'details', to: XtalJsonEditor.is, prop: "input", m: 1 });
          });
        }
        return {
          summary: this._wcInfo.name + ''
        }
      },
      [XtalJsonEditor.is]: ({ target }) => {
        Object.assign(target, { archive: true });
      }
    } as TransformRules;
  }

  //#endregion

  //#region overridden members
  get noShadow() {
    return true;
  }
  set viewModel(nv: WCSuiteInfo) {
    this._wcInfo = nv.tags.find(t => t.name === this._tag)!;
    super.viewModel = nv;
  }
  //#endregion 

  get [noPathFoundTemplate](){
    return T(`<div>No path found.</div>`, SwagTagBase, noPathFound$);
  }

  importReferencedModule() {
    const selfResolvingModuleSplitPath = this.href?.split('/');
    selfResolvingModuleSplitPath?.pop();
    const selfResolvingModulePath = selfResolvingModuleSplitPath?.join('/') + this._wcInfo.path!.substring(1) + '?module';
    import(selfResolvingModulePath);
  }

  _wcInfo!: WCInfo;
  get WCInfo() {
    return this._wcInfo;
  }

  //#region boilerplate

  static get observedAttributes() {
    return super.observedAttributes.concat([tag]);
  }

  attributeChangedCallback(n: string, ov: string, nv: string) {
    switch (n) {
      case tag:
        (<any>this)["_" + n] = nv;
        break;
    }
    super.attributeChangedCallback(n, ov, nv);
  }



  _tag: string | null = null;
  get tag() {
    return this._tag;
  }

  set tag(nv) {
    this.attr(tag, nv!);
  }

  connectedCallback() {
    this.propUp([tag]);
    super.connectedCallback();
  }
  //#endregion

}

define(SwagTagBase);

const pdxJSONParser = extend({
  name: 'json-parsed',
  valFromEvent: e => {
    if ((<any>e).target.dataset.propType === 'boolean') {
      return (<any>e).target.value !== null;
    } else {
      return JSON.parse((<any>e).target.value);
    }

  }
})
