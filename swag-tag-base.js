import { define } from "trans-render/define.js";
//import {init} from "trans-render/init.js";
import { repeat } from "trans-render/repeat.js";
import { decorate } from "trans-render/decorate.js";
import { createTemplate, newRenderContext } from "xtal-element/utils.js";
import { XtalViewElement } from "xtal-element/xtal-view-element.js";
import { PD } from "p-et-alia/p-d.js";
import { extend } from "p-et-alia/p-d-x.js";
import { XtalJsonEditor } from "xtal-json-editor/xtal-json-editor.js";
extend('event', {
    valFromEvent: e => ({
        type: e.type,
        detail: e.detail
    })
});
const fieldEditorTemplate = createTemplate(/* html */ `
  <div>
    <input>
    <p-d on="input" from="details" val="target.value"></p-d>
  </div>
`);
const mainTemplate = createTemplate(/* html */ `
<header>
  <h3></h3>

</header>
<details open>
  <summary>✏️Editor</summary>
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
        if (this._initRenderContext === undefined) {
            import(this._wcInfo.selfResolvingModulePath);
            this._initRenderContext = newRenderContext({
                header: {
                    h3: this._wcInfo.name
                },
                details: ({ target }) => {
                    const el = document.createElement(this._wcInfo.name);
                    const ces = this._wcInfo.customEvents;
                    if (ces !== undefined)
                        el.setAttribute('disabled', ces.length.toString());
                    target.insertAdjacentElement('afterend', el);
                    let leaf = el;
                    //const testCase = this._wcInfo.
                    if (ces !== undefined) {
                        ces.forEach(ce => {
                            const pdEvent = document.createElement('p-d-x-event');
                            decorate(pdEvent, {
                                propVals: {
                                    on: ce.name,
                                    to: XtalJsonEditor.is,
                                    prop: 'input',
                                    m: 1,
                                }
                            });
                            leaf.insertAdjacentElement('afterend', pdEvent);
                            leaf = pdEvent;
                        });
                    }
                    const properties = this._wcInfo.properties;
                    if (properties === undefined)
                        return false;
                    return {
                        form: ({ target }) => repeat(fieldEditorTemplate, this._initRenderContext, properties.length, target, {
                            div: ({ idx }) => {
                                const prop = properties[idx];
                                let propVal = undefined;
                                if (this._test && prop.testValues) {
                                    propVal = prop.testValues[this._test];
                                }
                                return {
                                    //label: prop.name + ': ',
                                    input: ({ target }) => {
                                        const inp = target;
                                        inp.dataset.propName = prop.name;
                                        switch (prop.type) {
                                            case 'boolean':
                                                target.setAttribute('type', 'checkbox');
                                                if (propVal)
                                                    target.setAttribute('checked', '');
                                                break;
                                            default:
                                                inp.placeholder = prop.name;
                                                inp.type = 'text';
                                                if (propVal) {
                                                    inp.value = propVal;
                                                }
                                        }
                                        if (this._test && prop.testValues && prop.testValues[this._test]) {
                                        }
                                    },
                                    [PD.is]: ({ target }) => decorate(target, {
                                        propVals: {
                                            to: this._wcInfo.name,
                                            prop: prop.name,
                                        },
                                        attribs: {
                                            'data-type': prop.type
                                        }
                                    }),
                                };
                            }
                        }),
                    };
                },
                [XtalJsonEditor.is]: ({ target }) => {
                    decorate(target, {
                        propVals: {
                            archive: true
                        }
                    });
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
                this['_' + n] = nv;
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
