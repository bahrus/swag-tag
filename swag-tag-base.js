import { repeat } from "trans-render/repeat.js";
import { replaceTargetWithTag } from "trans-render/replaceTargetWithTag.js";
import { appendTag } from "trans-render/appendTag.js";
import { createTemplate as T } from "trans-render/createTemplate.js";
import { XtalFetchViewElement, define, mergeProps } from "xtal-element/XtalFetchViewElement.js";
import "p-et-alia/p-d.js";
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
const valFromEvent = (e) => ({
    type: e.type,
    detail: e.detail
});
const tag = "tag";
const pdxEvent = 'event';
export const propInfo$ = Symbol();
export const propBase$ = Symbol();
export const fieldEditor$ = Symbol();
export const noPathFound$ = Symbol();
export const noPathFoundTemplate = 'noPathFoundTemplate';
let SwagTagBase = /** @class */ (() => {
    class SwagTagBase extends XtalFetchViewElement {
        constructor() {
            super(...arguments);
            this.tag = null;
            this.noShadow = true;
            this.mainTemplate = mainTemplate;
        }
        get WCInfo() {
            return this._wcInfo;
        }
        //#region Required Methods / Properties
        get readyToRender() {
            if (this._wcInfo === undefined)
                return false;
            if (this._wcInfo !== undefined && this._wcInfo.path !== undefined) {
                this.importReferencedModule();
                return true;
            }
            return noPathFoundTemplate;
        }
        get initTransform() {
            const allProperties = this._wcInfo.properties;
            if (allProperties === undefined)
                return {};
            const writeableProps = allProperties.filter(prop => !prop.readOnly);
            return {
                fieldset: {
                    form: ({ target, ctx }) => repeat([fieldEditor$, /* html */ `
                <div>
                  <label></label>
                  <input>
                  <p-d-x-json-parsed on=input from=fieldset to=details m=1 skip-init></p-d>
                </div>
              `], ctx, writeableProps, target, {
                        div: ({ target, item }) => {
                            const propAny = item;
                            target[propInfo$] = item;
                            const propVal = item.default;
                            let propBase = 'object';
                            switch (item.type) {
                                case 'boolean':
                                case 'string':
                                    propBase = item.type;
                                    break;
                            }
                            propAny[propBase$] = propBase;
                            return {
                                label: [{ textContent: item.name }, , { for: 'rc_' + item.name }],
                                input: ({ target, ctx }) => {
                                    if (propBase === 'object') {
                                        replaceTargetWithTag(target, ctx, 'textarea');
                                    }
                                },
                                '"': [, , { type: item.type === 'boolean' ? 'checkbox' : 'text', id: 'rc_' + item.name }],
                                textarea: [{ textContent: item.default }, , { id: 'rc_' + item.name }],
                                'input[type="checkbox"]': [, , { checked: item.default }],
                                'input[type="text"]': [, , { value: item.default ?? '' }],
                                '[on]': [{ careOf: this._wcInfo.name, prop: item.name }],
                            };
                        },
                    })
                },
                '"': {
                    legend: {
                        var: this._wcInfo.name
                    }
                },
                details: ({ target }) => {
                    const el = appendTag(target, this._wcInfo.name, {});
                    //Set initial values
                    this._wcInfo.properties?.filter(prop => prop.default !== undefined).forEach(prop => {
                        el[prop.name] = JSON.parse(prop.default);
                    });
                    const ces = this._wcInfo.events;
                    if (ces !== undefined)
                        el.setAttribute("disabled", ces.length.toString());
                    if (ces !== undefined) {
                        ces.forEach(ce => {
                            const pdEvent = extend({
                                name: pdxEvent,
                                valFromEvent: valFromEvent,
                                insertAfter: el
                            });
                            Object.assign(pdEvent, { on: ce.name, from: 'details', to: XtalJsonEditor.is, prop: "input", m: 1 });
                        });
                    }
                    return {
                        summary: this._wcInfo.name + ''
                    };
                },
                [XtalJsonEditor.is]: ({ target }) => {
                    Object.assign(target, { archive: true });
                }
            };
        }
        set viewModel(nv) {
            this._wcInfo = nv.tags.find(t => t.name === this.tag);
            super.viewModel = nv;
        }
        //#endregion 
        get [noPathFoundTemplate]() {
            return T(`<div>No path found.</div>`, SwagTagBase, noPathFound$);
        }
        importReferencedModule() {
            const selfResolvingModuleSplitPath = this.href?.split('/');
            selfResolvingModuleSplitPath?.pop();
            const selfResolvingModulePath = selfResolvingModuleSplitPath?.join('/') + this._wcInfo.path.substring(1) + '?module';
            import(selfResolvingModulePath);
        }
    }
    SwagTagBase.is = "swag-tag-base";
    SwagTagBase.attributeProps = ({ tag }) => {
        const ap = {
            str: [tag],
        };
        return mergeProps(ap, XtalFetchViewElement.props);
    };
    return SwagTagBase;
})();
export { SwagTagBase };
define(SwagTagBase);
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
