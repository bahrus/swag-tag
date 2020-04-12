import {SwagTagBase} from './swag-tag-base.js';
import { define } from "trans-render/define.js";
import {
    RenderOptions,
    RenderContext,
    TransformRules,
    TransformFn
} from "trans-render/init.d.js";

import { createTemplate } from "xtal-element/utils.js";
import { init } from "trans-render/init.js";
import { replaceElementWithTemplate } from "trans-render/replaceElementWithTemplate.js";

const stringInputTemplate = createTemplate(/* html */ `
    <mwc-textfield disabled></mwc-textfield>
`);

const objectInputTemplate = createTemplate(/* html */ `
    <mwc-textarea disabled></mwc-textarea>
`);

const boolInputTemplate = createTemplate(/* html */ `
<mwc-formfield disabled>
    <mwc-checkbox data-prop-type="boolean"></mwc-checkbox>
</mwc-formfield>
`);

const styleTemplate = createTemplate(/* html */`
<style>
    mwc-textarea {
        width: 95%;
    }
</style>
`);

import("@material/mwc-checkbox/mwc-checkbox.js");
import("@material/mwc-textarea/mwc-textarea.js");
import("@material/mwc-formfield/mwc-formfield.js");
import ("@material/mwc-textfield/mwc-textfield.js");
export class SwagTagMWC extends SwagTagBase{
    static get is(){return 'swag-tag-mwc';}

    get noShadow() {
        return false;
    }

    initRenderCallback(ctx: RenderContext, target: HTMLElement | DocumentFragment){
        super.initRenderCallback(ctx, target);
        init(target as DocumentFragment, {
            Transform: {
                "*": {
                  Select: "*"
                } as TransformRules,
                header: styleTemplate,
                'input[type="text"][data-prop-type="string"]': ({ctx, target}) => {
                    replaceElementWithTemplate(target, stringInputTemplate, ctx);
                },
                'input[type="text"][data-prop-type="object"],input[type="text"][data-prop-type="other"]': ({
                    ctx,
                    target
                  }) => {
                    replaceElementWithTemplate(target, objectInputTemplate, ctx);
                },
                'mwc-textfield':({target, ctx}) =>{
                    const inp = ctx.replacedElement as HTMLInputElement;
                    (<any>target).label = inp.dataset.propName!;
                    (<any>target).value = inp.value;
                },
                'input[type="checkbox"]': ({ ctx, target }) => {
                    replaceElementWithTemplate(target, boolInputTemplate, ctx);
                },
                'mwc-textarea': ({target, ctx}) =>{
                    const inp = ctx.replacedElement as HTMLInputElement;
                    (<any>target).label = inp.dataset.propName!;
                    (<any>target).value = inp.value;
                    
                },
                // 'mwc-checkbox': ({target, ctx}) =>{
                //     const inp = ctx.replacedElement as HTMLInputElement;
                //     (<any>target).text = inp.dataset.propName!;
                // },
                'p-d[data-type="boolean"]': ({target}) =>{
                    const uicheckbox = target as any;
                    uicheckbox.on = 'change';
                    uicheckbox.val = 'target.checked';
                },

            }
        })
    }

} 

define(SwagTagMWC);