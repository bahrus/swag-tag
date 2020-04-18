import {SwagTagBase} from './swag-tag-base.js';
import { define } from "trans-render/define.js";
import {
    RenderOptions,
    RenderContext,
    TransformRules,
    TransformFn
} from "trans-render/init.d.js";

import { createTemplate } from "trans-render/createTemplate.js";
import { init } from "trans-render/init.js";
import { replaceElementWithTemplate } from "trans-render/replaceElementWithTemplate.js";

//template refs
const stringInputTemplate = 'stringInputTemplate';
const objectInputTemplate = 'objectInputTemplate';
const boolInputTemplate = 'boolInputTemplate';

const styleTemplate = createTemplate(/* html */`
<style>
    mwc-textarea {
        width: 95%;
        resize: vertical;
        margin-bottom:20px
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
                    replaceElementWithTemplate(target, ctx, createTemplate(/* html */ `
                        <mwc-textfield disabled></mwc-textfield>
                    `, ctx, {as: stringInputTemplate}));
                },
                'input[type="text"][data-prop-type="object"],input[type="text"][data-prop-type="other"]': ({
                    ctx,
                    target
                  }) => {
                    replaceElementWithTemplate(target, ctx, createTemplate(/* html */ `
                        <mwc-textarea rows=4 disabled></mwc-textarea>
                    `, ctx, {as: objectInputTemplate}))
                },
                'input[type="checkbox"]': ({ ctx, target }) => {
                    replaceElementWithTemplate(target, ctx, createTemplate(/* html */ `
                    <mwc-formfield disabled>
                        <mwc-checkbox data-prop-type="boolean"></mwc-checkbox>
                    </mwc-formfield>
                    `, ctx, {as: boolInputTemplate}));
                },
                'mwc-textarea, mwc-textfield': ({target, ctx}) =>{
                    const inp = ctx.replacedElement as HTMLInputElement;
                    Object.assign(target, {label: inp.dataset.propName!, value: inp.value, helper: inp.dataset.description});
                },
                'mwc-formfield': ({target, ctx}) =>{
                    const inp = ctx.replacedElement as HTMLInputElement;
                    (<any>target).label = inp.dataset.propName!;
                    // return {
                    //     'mwc-checkbox': ({target, ctx}) =>{

                    //     },
                    // }
                },
                '[on][data-type="boolean"]': [{on: 'change', val: 'target.checked'}],
            }
        })
    }

} 

define(SwagTagMWC);