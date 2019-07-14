import { SwagTagBase } from "./swag-tag-base.js";
import { define } from "trans-render/define.js";
import { append } from 'trans-render/append.js';
import { createTemplate } from "xtal-element/utils.js";
import { init } from 'trans-render/init.js';
//import {replaceTargetWithTag} from 'trans-render/replaceTargetWithTag.js';
import { replaceElementWithTemplate } from 'trans-render/replaceElementWithTemplate.js';
import { XtalTextInputMD } from 'xtal-text-input-md/xtal-text-input-md.js';
import { XtalCheckboxInputMD } from 'xtal-checkbox-input-md/xtal-checkbox-input-md.js';
import { decorate } from "trans-render/decorate.js";
const styleTemplate = createTemplate(
/* html */ `
<style>
:host{
    display: block;
}
details>summary {
    margin-top: 20px;
    list-style: none;
    cursor:pointer;
}
details>summary::-webkit-details-marker{
    display:none;
}
</style>
`);
const textInputTemplate = createTemplate(/* html */ `
<xtal-text-input-md disabled>
  <span slot="label"></span>
</xtal-text-input-md>
`);
const boolInputTemplate = createTemplate(/* html */ `
<xtal-checkbox-input-md disabled>
  <span slot="label"></span>
</xtal-checkbox-input-md>
`);
export class SwagTag extends SwagTagBase {
    static get is() {
        return "swag-tag";
    }
    get noShadow() {
        return false;
    }
    get renderOptions() {
        if (this._renderOptions === undefined) {
            this._renderOptions = {
                initializedCallback: (ctx, target) => {
                    init(target, {
                        Transform: {
                            '*': {
                                Select: '*'
                            },
                            'input[type="text"]': ({ ctx, target }) => {
                                replaceElementWithTemplate(target, textInputTemplate, ctx);
                            },
                            'input[type="checkbox"]': ({ ctx, target }) => {
                                replaceElementWithTemplate(target, boolInputTemplate, ctx);
                            },
                            [XtalTextInputMD.is]: ({ ctx, target }) => {
                                const inp = ctx.replacedElement;
                                for (let i = 0, ii = inp.attributes.length; i < ii; i++) {
                                    const attrib = inp.attributes[i];
                                    //const inp = clonedNode.querySelector('input');
                                    if (attrib.name === "type")
                                        continue;
                                    target.setAttribute(attrib.name, attrib.value);
                                }
                                target.value = inp.value;
                                return {
                                    span: inp.dataset.propName,
                                };
                            },
                            'p-d[data-type="boolean"]': ({ target }) => decorate(target, {
                                propVals: {
                                    val: "target.boolValue"
                                }
                            }),
                            [XtalCheckboxInputMD.is]: ({ ctx, target }) => {
                                const xci = target;
                                const inp = ctx.replacedElement;
                                for (let i = 0, ii = inp.attributes.length; i < ii; i++) {
                                    const attrib = inp.attributes[i];
                                    //const inp = clonedNode.querySelector('input');
                                    if (attrib.name === "type")
                                        continue;
                                    target.setAttribute(attrib.name, attrib.value);
                                }
                                xci.value = inp.value;
                                xci.boolValue = inp.value === 'on';
                                return {
                                    span: inp.dataset.propName,
                                };
                            }
                        }
                    });
                    append(target, styleTemplate);
                }
            };
        }
        return this._renderOptions;
    }
}
define(SwagTag);
