import {SwagTagBase, propInfo$} from './swag-tag-base.js';
import { define } from "trans-render/define.js";
import {
    RenderOptions,
    RenderContext,
    PSettings,
    TransformRules,
    TransformFn
} from "trans-render/types.d.js";
import {PDProps} from 'p-et-alia/types.d.js';


import { createTemplate } from "trans-render/createTemplate.js";
import { init } from "trans-render/init.js";
import { replaceElementWithTemplate as replace } from "trans-render/replaceElementWithTemplate.js";
import { PropertyInfo } from '../wc-info/types.js';



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

const string$ = Symbol();
const object$ = Symbol();
const bool$ = Symbol();
export class SwagTagMWC extends SwagTagBase{
    static get is(){return 'swag-tag-mwc';}

    get noShadow() {
        return false;
    }

    initPostTransform = {
        header: styleTemplate,
        fieldset: {
            form:{
                div:{
                    //static declarative rules
                    label: false,
                    textarea: ({ctx, target}) => replace(target, ctx,[object$, /* html */ `
                        <mwc-textarea disabled></mwc-textarea>
                    `]),
                    '[on][data-type="boolean"]': [{on: 'change', val: 'target.checked'}] as PSettings<PDProps>,
                    'input[type="text"]': ({ctx, target}) => replace(target, ctx,[string$, /*html */`
                    <mwc-textfield disabled></mwc-textfield>
                    `]),
                    'input[type="checkbox"]': ({ ctx, target }) => replace(target, ctx, [bool$, /* html */ `
                        <mwc-formfield disabled>
                            <mwc-checkbox></mwc-checkbox>
                        </mwc-formfield>
                    `]),
                },
                // dynamic rules
                '"': ({target}) => {
                    const propInfo = (<any>target)[propInfo$] as PropertyInfo;
                    return {
                        'mwc-textarea, mwc-textfield':[{label: propInfo.name, value: propInfo.default ?? '', helper: propInfo.description ?? ''}],
                        'mwc-formfield': [{label: propInfo.name}],
                        
                    }

                },


            }
        } as TransformRules
    };

    afterInitRenderCallback(ctx: RenderContext, target: HTMLElement | DocumentFragment, renderOptions: RenderOptions | undefined){
        ctx!.Transform = this.initPostTransform;
        init(target, ctx);
    }

} 

define(SwagTagMWC);