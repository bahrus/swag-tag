import { WCSuiteInfo, WCInfo } from "wc-info/types.js";
import { define } from "trans-render/define.js";
//import {init} from "trans-render/init.js";
import {repeat} from "trans-render/repeat.js";
import {createTemplate, newRenderContext} from "xtal-element/utils.js";
import { RenderContext, RenderOptions, TransformRules } from "trans-render/init.d.js";
import {XtalViewElement} from "xtal-element/xtal-view-element.js";
import "p-et-alia/p-d.js";

const fieldEditorTemplate = createTemplate(/* html */`
  <div>
    <label></label><input>
    <p-d on="input" from="details"></p-d>
  </div>
`);

const mainTemplate = createTemplate(/* html */ `
<header>
  <h3></h3>
  <nav>
    <a target="_blank">📜</a>
  </nav>
</header>
<details>
  <summary>Editor</summary>
  <form>
  </form>
</details>
<main></main>
`);

const href = 'href';
const tag = 'tag';

export class SwagTagBase extends XtalViewElement<WCSuiteInfo> {
  static get is() {
    return "swag-tag-base";
  }
  _initRenderContext: RenderContext | undefined;
  get initRenderContext() {
    import(this._wcInfo.selfResolvingModulePath!);
    if(this._initRenderContext === undefined){
      this._initRenderContext = newRenderContext({
        header:{
          h3: this._wcInfo.name
        },
        details: ({target}) => {
          const el = document.createElement(this._wcInfo.name);
          target.insertAdjacentElement('afterend', el);
          const properties = this._wcInfo.properties;
          if(properties === undefined) return false;
          return {
            form: ({target}) => repeat(fieldEditorTemplate, this._initRenderContext!, properties.length, target, {
              div: ({idx}) =>{
                const prop = properties[idx];
                return{
                  label: prop.name + ': ',
                  input: ({target}) =>{
                    switch(prop.type){
                      case 'boolean':
                        target.setAttribute('type', 'checkbox');
                        break;
                    }
                  },
                  'p-d': ({target}) =>{
                    target.setAttribute('to', this._wcInfo.name);
                    target.setAttribute('prop', prop.name);
                  }
                }
              }
            }) as TransformRules,
          } as TransformRules
        },
        // main:({target}) =>{
        //   const el = document.createElement(this._wcInfo.name);
        //   target.appendChild(el);
        // }
      });
    }
    return this._initRenderContext;
  }

  get noShadow() {
    return true;
  }

  get eventContext() {
    return {};
  }
  get ready() {
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
        (<any>this)['_' + n] = nv;
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
  get tag(){
    return this._tag;
  }

  set tag(nv){
    this.attr(tag, nv!);
  }

  get mainTemplate() {
    return mainTemplate;
  }

  //_c = false;
  connectedCallback() {
    this.propUp([href, tag]);
    super.connectedCallback();
  }

  set viewModel(nv: WCSuiteInfo){
    super.viewModel = nv;
    this._wcInfo = nv.tags.find(t => t.name === this._tag)!;
  }

  _wcInfo! : WCInfo;
  get WCInfo(){
    return this._wcInfo;
  }

}

define(SwagTagBase);
