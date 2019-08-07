import { WCSuiteInfo, WCInfo } from "wc-info/types.js";
import { define } from "trans-render/define.js";
//import {init} from "trans-render/init.js";
import { repeat } from "trans-render/repeat.js";
import { decorate } from "trans-render/decorate.js";
import { createTemplate, newRenderContext } from "xtal-element/utils.js";
import {
  RenderContext,
  RenderOptions,
  TransformRules
} from "trans-render/init.d.js";
import { XtalViewElement } from "xtal-element/xtal-view-element.js";
import { PD } from "p-et-alia/p-d.js";
import { extend } from "p-et-alia/p-d-x.js";
import { XtalJsonEditor } from "xtal-json-editor/xtal-json-editor.js";

extend("event", {
  valFromEvent: e => ({
    type: e.type,
    detail: (<any>e).detail
  })
});

const fieldEditorTemplate = createTemplate(/* html */ `
  <div>
    <input>
    <p-d on="input" from="fieldset" val="target.value"></p-d>
  </div>
`);

const mainTemplate = createTemplate(/* html */ `

<fieldset>
  <legend>✏️Edit <var></var>'s properties</legend>
  <form>
  </form>
</fieldset>
<h4>Live Events Fired</h4>
<xtal-json-editor options="{}"  height="300px"></xtal-json-editor>
<main></main>
`);

const href = "href";
const tag = "tag";
const test = "test";
export class SwagTagBase extends XtalViewElement<WCSuiteInfo> {
  static get is() {
    return "swag-tag-base";
  }
  get initRenderContext() {
    if(this._wcInfo.selfResolvingModulePath === undefined){
      console.warn("No self resolving module path found in " + this._href + ' tag: ' + this._tag);
      return {};
    }
    import(this._wcInfo.selfResolvingModulePath!);
    return newRenderContext({
      fieldset: ({ target }) => {
        const el = document.createElement(this._wcInfo.name);
        const ces = this._wcInfo.customEvents;
        if (ces !== undefined)
          el.setAttribute("disabled", ces.length.toString());
        target.insertAdjacentElement("afterend", el);
        let leaf = el;

        if (ces !== undefined) {
          ces.forEach(ce => {
            const pdEvent = document.createElement("p-d-x-event");
            decorate(pdEvent, {
              propVals: {
                on: ce.name,
                to: XtalJsonEditor.is,
                prop: "input",
                m: 1
              } as PD
            });
            leaf.insertAdjacentElement("afterend", pdEvent);
            leaf = pdEvent;
          });
        }
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
                let propVal: any = undefined;
                if (this._test && prop.testValues) {
                  propVal = prop.testValues[this._test];
                }
                return {
                  //label: prop.name + ': ',
                  input: ({ target }) => {
                    const inp = target as HTMLInputElement;
                    decorate(inp, {
                      propVals:{
                        dataset:{
                          propName: prop.name,
                          propType: prop.type,
                          description: prop.description
                        } as DOMStringMap,
                        placeholder: prop.name
                      } as HTMLInputElement,
                      attribs:{
                        "type": prop.type === 'boolean' ? 'checkbox' : 'text'
                      }
                    });
                    if(propVal){
                      switch (prop.type) {
                        case "boolean":
                            target.setAttribute("checked", "");
                            inp.value = "on";
                          break;
                        case "object":
                            inp.value = JSON.stringify(propVal);
                            break;
                        default:
                            inp.value = propVal;
                      }
                    }

                  },
                  [PD.is]: ({ target }) =>
                    decorate(target as HTMLElement, {
                      propVals: {
                        to: this._wcInfo.name,
                        prop: prop.name
                      } as PD,
                      attribs: {
                        "data-type": prop.type
                      }
                    })
                };
              }
            }) as TransformRules
        } as TransformRules;
      },
      [XtalJsonEditor.is]: ({ target }) => {
        decorate(target as HTMLElement, {
          propVals: {
            archive: true
          } as XtalJsonEditor
        });
      }
    });
  }

  get noShadow() {
    return true;
  }

  // get eventContext() {
  //   return {};
  // }
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
    return super.observedAttributes.concat([href, tag, test]);
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

  _test: string | null = null;
  get test() {
    return this._test;
  }
  set test(nv) {
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
