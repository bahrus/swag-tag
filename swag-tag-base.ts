import { WCSuiteInfo, WCInfo } from "wc-info/types.js";
import { define } from "trans-render/define.js";
//import {init} from "trans-render/init.js";
import {repeat} from "trans-render/repeat.js";
import {decorate} from "trans-render/decorate.js";
import {createTemplate, newRenderContext} from "xtal-element/utils.js";
import { RenderContext, RenderOptions, TransformRules } from "trans-render/init.d.js";
import {XtalViewElement} from "xtal-element/xtal-view-element.js";
import {PD} from "p-et-alia/p-d.js";
import {extend} from "p-et-alia/p-d-x.js";
import {XtalJsonEditor} from "xtal-json-editor/xtal-json-editor.js";

extend('event', {
  valFromEvent : e =>({
    type: e.type,
    detail: (<any>e).detail
  })
});

const fieldEditorTemplate = createTemplate(/* html */`
  <div>
    <input>
    <p-d on="input" from="details" val="target.value"></p-d>
  </div>
`);


const mainTemplate = createTemplate(/* html */ `

<details open>
  <summary>✏️Edit <var></var>'s properties</summary>
  <form>
  </form>
</details>
<h4>Event Monitoring</h4>
<xtal-json-editor options="{}"  height="300px"></xtal-json-editor>
<main></main>
`);

const href = 'href';
const tag = 'tag';
const test = 'test';
export class SwagTagBase extends XtalViewElement<WCSuiteInfo> {
  static get is() {
    return "swag-tag-base";
  }
  _initRenderContext: RenderContext | undefined;
  get initRenderContext() {
    
    if(this._initRenderContext === undefined){
      import(this._wcInfo.selfResolvingModulePath!);
      this._initRenderContext = newRenderContext({
        details: ({target}) => {
          const el = document.createElement(this._wcInfo.name);
          const ces = this._wcInfo.customEvents;
          if(ces !== undefined) el.setAttribute('disabled', ces.length.toString());
          target.insertAdjacentElement('afterend', el);
          let leaf = el;
          
          if(ces !== undefined){
            ces.forEach(ce =>{
              const pdEvent = document.createElement('p-d-x-event');
              decorate(pdEvent, {
                propVals:{
                  on:ce.name,
                  to: XtalJsonEditor.is,
                  prop:'input',
                  m: 1,
                } as PD
              });
              leaf.insertAdjacentElement('afterend', pdEvent);
              leaf = pdEvent;
            })
          }
          const properties = this._wcInfo.properties;
          if(properties === undefined) return false;
          return {
            summary:{
              var: this._wcInfo.name
            },
            form: ({target}) => repeat(fieldEditorTemplate, this._initRenderContext!, properties.length, target, {
              div: ({idx}) =>{
                const prop = properties[idx];
                let propVal: any = undefined;
                if(this._test && prop.testValues){
                  propVal = prop.testValues[this._test];
                }
                return{
                  //label: prop.name + ': ',
                  input: ({target}) =>{
                    const inp = target as HTMLInputElement;
                    inp.dataset.propName = prop.name;
                    inp.dataset.propType = prop.type;
                    switch(prop.type){
                      
                      case 'boolean':
                        target.setAttribute('type', 'checkbox');
                        if(propVal) {
                          target.setAttribute('checked', '');
                          inp.value = 'on';
                        }
                        break;
                      default:
                        inp.placeholder = prop.name;
                        inp.type = 'text'
                          if(propVal) {
                            inp.value = propVal;
                          }
                    }
                    if(this._test && prop.testValues && prop.testValues[this._test]){

                    } 
                  },
                  [PD.is]: ({target}) => decorate(target as HTMLElement, {
                    propVals:{
                      to: this._wcInfo.name,
                      prop: prop.name,
                      //dataset: prop,
                      //val: prop.type === 'boolean' ? 'target.boolValue' : undefined
                    } as PD,
                    attribs:{
                      'data-type':prop.type
                    } 
                  }),
                  
                }
              }
            }) as TransformRules,
          } as TransformRules
        },
        [XtalJsonEditor.is]: ({target}) => {
          decorate(target as HTMLElement, {
            propVals:{
              archive: true
            } as XtalJsonEditor
          })
        }
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
    return super.observedAttributes.concat([href, tag, test]);
  }

  attributeChangedCallback(n: string, ov: string, nv: string) {
    switch (n) {
      case href:
      case tag:
      case test:
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

  _test: string | null = null;
  get test(){
    return this._test;
  }
  set test(nv){
    this.attr(test, nv);
  }

  get mainTemplate() {
    return mainTemplate;
  }

  //_c = false;
  connectedCallback() {
    this.propUp([href, tag, test]);
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
