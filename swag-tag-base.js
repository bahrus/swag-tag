import { define } from "trans-render/define.js";
//import {init} from "trans-render/init.js";
import { repeat } from "trans-render/repeat.js";
import { createTemplate, newRenderContext } from "xtal-element/utils.js";
import { XtalViewElement } from "xtal-element/xtal-view-element.js";
import "p-et-alia/p-d.js";
const fieldEditorTemplate = createTemplate(/* html */ `
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
        import(this._wcInfo.selfResolvingModulePath);
        if (this._initRenderContext === undefined) {
            this._initRenderContext = newRenderContext({
                header: {
                    h3: this._wcInfo.name
                },
                details: x => {
                    const properties = this._wcInfo.properties;
                    if (properties === undefined)
                        return false;
                    return {
                        form: ({ target }) => repeat(fieldEditorTemplate, this._initRenderContext, properties.length, target, {
                            div: ({ idx }) => {
                                const prop = properties[idx];
                                return {
                                    label: prop.name,
                                    input: ({ target }) => {
                                        switch (prop.type) {
                                            case 'boolean':
                                                target.setAttribute('type', 'checkbox');
                                                break;
                                        }
                                    }
                                };
                            }
                        }),
                    };
                },
                main: ({ target }) => {
                    const el = document.createElement(this._wcInfo.name);
                    target.appendChild(el);
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
        return super.observedAttributes.concat([href, tag]);
    }
    attributeChangedCallback(n, ov, nv) {
        switch (n) {
            case href:
            case tag:
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
    get mainTemplate() {
        return mainTemplate;
    }
    //_c = false;
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
