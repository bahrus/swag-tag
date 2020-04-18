import { WCSuiteInfo, WCInfo } from "wc-info/types.js";
import { define } from "trans-render/define.js";
import { repeat } from "trans-render/repeat.js";
import { appendTag } from "trans-render/appendTag.js";
import { decorate } from "trans-render/decorate.js";
import { newRenderContext } from "xtal-element/newRenderContext.js";
import { createTemplate } from "trans-render/createTemplate.js";
import {
  RenderContext,
  RenderOptions,
  TransformRules
} from "trans-render/init.d.js";
import { XtalViewElement } from "xtal-element/xtal-view-element.js";
import "p-et-alia/p-d.js";
import {PDProps} from 'p-et-alia/types.d.js';
import { extend } from "p-et-alia/p-d-x.js";
import { XtalJsonEditor } from "xtal-json-editor/xtal-json-editor.js";

const pdxEvent = 'event';

const pdxJSONParser = extend({
  name: 'json-parsed',
  valFromEvent: e => {
    if((<any>e).target.dataset.propType === 'boolean'){
      return (<any>e).target.value !== null;
    }else{
      return JSON.parse((<any>e).target.value);
    }
    
  }  
})

const fieldEditorTemplate = createTemplate(/* html */ `
  <div>
    <input>
    <p-d-x-json-parsed on=input from=fieldset to=details m=1 skip-init></p-d>
  </div>
`);

const mainTemplate = createTemplate(/* html */ `
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

const valFromEvent = (e: Event) =>({
  type: e.type,
  detail: (<any>e).detail
})

const href = "href";
const tag = "tag";
//const test = "test";
export class SwagTagBase extends XtalViewElement<WCSuiteInfo> {
  static get is() {
    return "swag-tag-base";
  }
  get initRenderContext() {
    if(this._wcInfo.path === undefined){
      console.warn("No self resolving module path found in " + this._href + ' tag: ' + this._tag);
      return {};
    }
    const selfResolvingModuleSplitPath = this.href?.split('/');
    selfResolvingModuleSplitPath?.pop();
    const selfResolvingModulePath = selfResolvingModuleSplitPath?.join('/') + this._wcInfo.path.substring(1) +  '?module';
    import(selfResolvingModulePath);
    return newRenderContext({
      fieldset: ({ target }) => {
        const allProperties = this._wcInfo.properties;
        if (allProperties === undefined) return false;
        const writeableProps = allProperties.filter(prop => !prop.readOnly);
        return {
          legend: {
            var: this._wcInfo.name
          },
          form: ({ target, ctx }) =>
            repeat(fieldEditorTemplate, ctx, writeableProps.length, target, {
              div: ({ idx }) => {
                const prop = writeableProps[idx];
                const propVal =  prop.default;
                let propType = 'other';
                switch(prop.type){
                  case 'boolean':
                  case 'string':
                  case 'object':
                    propType = prop.type;
                    break;

                }
                return {
                  input: ({ target }) => {
                    const inp = target as HTMLInputElement;
                    decorate(inp, {
                      propVals:{
                        dataset:{
                          propName: prop.name,
                          propType: propType,
                          description: prop.description
                        } as DOMStringMap,
                        placeholder: prop.name
                      } as HTMLInputElement,
                      attribs:{
                        "type": prop.type === 'boolean' ? 'checkbox' : 'text'
                      }
                    });
                    if(propVal !== undefined){
                      switch (prop.type) {
                        case "boolean":
                            target.setAttribute("checked", "");
                            inp.value = "on";
                          break;
                        default:
                            inp.value = propVal;
                      }
                    }

                  },
                  '[on]': ({ target }) =>
                    decorate(target as HTMLElement, 
                      {propVals: {
                        careOf: this._wcInfo.name,
                        prop: prop.name,
                      } as PDProps, 
                      attribs: {"data-type": prop.type}
                  })
                };
              }
            }) as TransformRules
        } as TransformRules;
      },
      details: ({target}) =>{
        const el = appendTag(target, this._wcInfo.name, {}) as any;
        this._wcInfo.properties?.filter(prop => prop.default !== undefined).forEach(prop =>{
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
            Object.assign(pdEvent, { on: ce.name, from: 'details', to: XtalJsonEditor.is, prop: "input", m: 1} );
          });
        }
        return {
          summary: this._wcInfo.name + ''
        }
      },
      [XtalJsonEditor.is]: ({ target }) => {
        Object.assign(target, {archive: true});
      }
    });
  }

  get noShadow() {
    return true;
  }


  get readyToInit() {
    return this._href !== undefined;
  }

  init() {
    return new Promise<WCSuiteInfo>(resolve => {
      fetch(this._href!).then(resp => {
        resp.json().then(info => {
          resolve(info as WCSuiteInfo);
        });
      });
    });
  }

  update() {
    return this.init();
  }

  onPropsChange() {
    this._initialized = false;
    this.root.innerHTML = "";
    return super.onPropsChange();
  }

  static get observedAttributes() {
    return super.observedAttributes.concat([href, tag]);
  }

  attributeChangedCallback(n: string, ov: string, nv: string) {
    switch (n) {
      case href:
      case tag:
      case test:
        (<any>this)["_" + n] = nv;
        break;
    }
    super.attributeChangedCallback(n, ov, nv);
  }

  _href: string | null = null;
  get href() {
    return this._href;
  }
  set href(nv) {
    this.attr(href, nv!);
  }

  _tag: string | null = null;
  get tag() {
    return this._tag;
  }

  set tag(nv) {
    this.attr(tag, nv!);
  }

  get mainTemplate() {
    return mainTemplate;
  }

  connectedCallback() {
    this.propUp([href, tag]);
    super.connectedCallback();
  }

  set viewModel(nv: WCSuiteInfo) {
    super.viewModel = nv;
    this._wcInfo = nv.tags.find(t => t.name === this._tag)!;
  }

  _wcInfo!: WCInfo;
  get WCInfo() {
    return this._wcInfo;
  }
}

define(SwagTagBase);
