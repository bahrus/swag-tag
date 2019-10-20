import { define } from "trans-render/define.js";
//import {init} from "trans-render/init.js";
import { repeat } from "trans-render/repeat.js";
import { decorate } from "trans-render/decorate.js";
import { createTemplate, newRenderContext } from "xtal-element/utils.js";
import { XtalViewElement } from "xtal-element/xtal-view-element.js";
import { extend } from "p-et-alia/p-d-x.js";
import { XtalJsonEditor } from "xtal-json-editor/xtal-json-editor.js";
const pdxEvent = 'event';
// extend({
//   name: pdxEvent,
//   valFromEvent: e => ({
//     type: e.type,
//     detail: (<any>e).detail
//   })
// });
const fieldEditorTemplate = createTemplate(/* html */ `
  <div>
    <input>
    <p-d on=input from=fieldset to=details val=target.value m=1></p-d>
  </div>
`);
const mainTemplate = createTemplate(/* html */ `

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
`);
const valFromEvent = (e) => ({
    type: e.type,
    detail: e.detail
});
const href = "href";
const tag = "tag";
const test = "test";
export class SwagTagBase extends XtalViewElement {
    constructor() {
        super(...arguments);
        this._href = null;
        this._tag = null;
        this._test = null;
    }
    static get is() {
        return "swag-tag-base";
    }
    get initRenderContext() {
        if (this._wcInfo.selfResolvingModulePath === undefined) {
            console.warn("No self resolving module path found in " + this._href + ' tag: ' + this._tag);
            return {};
        }
        import(this._wcInfo.selfResolvingModulePath);
        return newRenderContext({
            fieldset: ({ target }) => {
                const allProperties = this._wcInfo.properties;
                if (allProperties === undefined)
                    return false;
                const writeableProps = allProperties.filter(prop => !prop.readOnly);
                return {
                    legend: {
                        var: this._wcInfo.name
                    },
                    form: ({ target, ctx }) => repeat(fieldEditorTemplate, ctx, writeableProps.length, target, {
                        div: ({ idx }) => {
                            const prop = writeableProps[idx];
                            let propVal = undefined;
                            if (this._test && prop.testValues) {
                                propVal = prop.testValues[this._test];
                            }
                            return {
                                //label: prop.name + ': ',
                                input: ({ target }) => {
                                    const inp = target;
                                    decorate(inp, {
                                        propVals: {
                                            dataset: {
                                                propName: prop.name,
                                                propType: prop.type,
                                                description: prop.description
                                            },
                                            placeholder: prop.name
                                        },
                                        attribs: {
                                            "type": prop.type === 'boolean' ? 'checkbox' : 'text'
                                        }
                                    });
                                    if (propVal) {
                                        switch (prop.type) {
                                            case "boolean":
                                                target.setAttribute("checked", "");
                                                inp.value = "on";
                                                break;
                                            case "any": //TODO
                                            case "object":
                                                inp.value = JSON.stringify(propVal);
                                                break;
                                            default:
                                                inp.value = propVal;
                                        }
                                    }
                                },
                                'p-d': ({ target }) => decorate(target, { propVals: {
                                        careOf: this._wcInfo.name,
                                        prop: prop.name,
                                    },
                                    attribs: { "data-type": prop.type }
                                })
                            };
                        }
                    })
                };
            },
            details: ({ target }) => {
                const el = document.createElement(this._wcInfo.name);
                const ces = this._wcInfo.events;
                if (ces !== undefined)
                    el.setAttribute("disabled", ces.length.toString());
                target.appendChild(el);
                if (ces !== undefined) {
                    ces.forEach(ce => {
                        const pdEvent = extend({
                            name: pdxEvent,
                            valFromEvent: valFromEvent,
                            insertAfter: el
                        });
                        decorate(pdEvent, { propVals: { on: ce.name, from: 'details', to: XtalJsonEditor.is, prop: "input", m: 1 } });
                        //target.appendChild(pdEvent);
                    });
                }
                return {
                    summary: this._wcInfo.name + ''
                };
            },
            [XtalJsonEditor.is]: ({ target }) => {
                decorate(target, {
                    propVals: {
                        archive: true,
                    }
                });
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
        return new Promise(resolve => {
            fetch(this._href).then(resp => {
                resp.json().then(info => {
                    resolve(info);
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
    attributeChangedCallback(n, ov, nv) {
        switch (n) {
            case href:
            case tag:
            case test:
                this["_" + n] = nv;
                break;
        }
        super.attributeChangedCallback(n, ov, nv);
    }
    get href() {
        return this._href;
    }
    set href(nv) {
        this.attr(href, nv);
    }
    get tag() {
        return this._tag;
    }
    set tag(nv) {
        this.attr(tag, nv);
    }
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
    set viewModel(nv) {
        super.viewModel = nv;
        this._wcInfo = nv.tags.find(t => t.name === this._tag);
    }
    get WCInfo() {
        return this._wcInfo;
    }
}
define(SwagTagBase);
