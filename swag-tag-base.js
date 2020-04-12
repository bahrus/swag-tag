import { define } from "trans-render/define.js";
import { repeat } from "trans-render/repeat.js";
import { decorate } from "trans-render/decorate.js";
import { createTemplate, newRenderContext } from "xtal-element/utils.js";
import { XtalViewElement } from "xtal-element/xtal-view-element.js";
import "p-et-alia/p-d.js";
import { extend } from "p-et-alia/p-d-x.js";
import { XtalJsonEditor } from "xtal-json-editor/xtal-json-editor.js";
const pdxEvent = 'event';
const pdxJSONParser = extend({
    name: 'json-parsed',
    valFromEvent: e => {
        if (e.target.dataset.propType === 'boolean') {
            return e.target.value !== null;
        }
        else {
            return JSON.parse(e.target.value);
        }
    }
});
const fieldEditorTemplate = createTemplate(/* html */ `
  <div>
    <input>
    <p-d-x-json-parsed on=input from=fieldset to=details val=target.value m=1 skip-init></p-d>
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
const valFromEvent = (e) => ({
    type: e.type,
    detail: e.detail
});
const href = "href";
const tag = "tag";
//const test = "test";
export class SwagTagBase extends XtalViewElement {
    constructor() {
        super(...arguments);
        this._href = null;
        this._tag = null;
    }
    static get is() {
        return "swag-tag-base";
    }
    get initRenderContext() {
        if (this._wcInfo.path === undefined) {
            console.warn("No self resolving module path found in " + this._href + ' tag: ' + this._tag);
            return {};
        }
        const selfResolvingModuleSplitPath = this.href?.split('/');
        selfResolvingModuleSplitPath?.pop();
        const selfResolvingModulePath = selfResolvingModuleSplitPath?.join('/') + this._wcInfo.path.substring(1) + '?module';
        import(selfResolvingModulePath);
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
                            const propVal = prop.default;
                            let propType = 'other';
                            switch (prop.type) {
                                case 'boolean':
                                case 'string':
                                case 'object':
                                    propType = prop.type;
                                    break;
                            }
                            return {
                                input: ({ target }) => {
                                    const inp = target;
                                    decorate(inp, {
                                        propVals: {
                                            dataset: {
                                                propName: prop.name,
                                                propType: propType,
                                                description: prop.description
                                            },
                                            placeholder: prop.name
                                        },
                                        attribs: {
                                            "type": prop.type === 'boolean' ? 'checkbox' : 'text'
                                        }
                                    });
                                    if (propVal !== undefined) {
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
                                '[on]': ({ target }) => decorate(target, { propVals: {
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
                this._wcInfo.properties?.forEach(prop => {
                    if (prop.default) {
                        el[prop.name] = JSON.parse(prop.default);
                    }
                });
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
        return super.observedAttributes.concat([href, tag]);
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
    get mainTemplate() {
        return mainTemplate;
    }
    connectedCallback() {
        this.propUp([href, tag]);
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
