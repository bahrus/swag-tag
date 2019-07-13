import { SwagTagBase } from "./swag-tag-base.js";
import { define } from "trans-render/define.js";
import { append } from 'trans-render/append.js';
import { createTemplate } from "xtal-element/utils.js";
import { init } from 'trans-render/init.js';
//import {replaceTargetWithTag} from 'trans-render/replaceTargetWithTag.js';
import { replaceElementWithTemplate } from 'trans-render/replaceElementWithTemplate.js';
import { XtalTextInputMD } from 'xtal-text-input-md/xtal-text-input-md.js';
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
const inputTemplate = createTemplate(/* html */ `
<xtal-text-input-md>
  <span slot="label"></span>
</xtal-text-input-md>
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
                                //const t = target as HTMLInputElement;
                                // replaceElementWithTemplate(t, XtalTextInputMD.is, ctx, (repl) => {
                                //   const x = repl as XtalTextInputMD;
                                //   x.value = t.value; 
                                //   for (let i = 0, ii = t.attributes.length; i < ii; i++) {
                                //     const attrib = t.attributes[i];
                                //     //const inp = clonedNode.querySelector('input');
                                //     if (attrib.name === "type") continue;
                                //     x.setAttribute(attrib.name, attrib.value);
                                //     const s = document.createElement('span');
                                //     s.setAttribute('slot', 'label');
                                //     s.textContent = t.getAttribute('placeholder');
                                //     t.setAttribute('placeholder', '');
                                //     x.appendChild(s);
                                //   }
                                // });
                                //(target as HTMLElement).style.backgroundColor = 'red';
                                replaceElementWithTemplate(target, inputTemplate, ctx);
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
                                return {
                                    'span': inp.getAttribute('placeholder'),
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
