import {SwagTagBase, propInfo$} from './swag-tag-base.js';
import { define } from "trans-render/define.js";
import {
    RenderOptions,
    RenderContext,
    TransformRules,
    TransformFn
} from "trans-render/init.d.js";


import { createTemplate } from "trans-render/createTemplate.js";
import { init } from "trans-render/init.js";
import { replaceElementWithTemplate as replace } from "trans-render/replaceElementWithTemplate.js";
import { PropertyInfo } from '../wc-info/types.js';

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
        const string$ = Symbol();
        const object$ = Symbol();
        const bool$ = Symbol();
        init(target as DocumentFragment, {
            Transform: {
                header: styleTemplate,
                fieldset: {
                    form:{
                        div: ({target}) => {
                            const propInfo = (<any>target)[propInfo$] as PropertyInfo;
                            return {
                                textarea: ({ctx, target}) =>{
                                    replace(target, ctx, [string$, /* html */ `
                                    <mwc-textfield disabled></mwc-textfield>
                                    `]);
                                },
                                'input[type="checkbox"]': ({ ctx, target }) => {
                                    replace(target, ctx, [bool$, /* html */ `
                                    <mwc-formfield disabled>
                                        <mwc-checkbox></mwc-checkbox>
                                    </mwc-formfield>
                                    `]);
                                },
                                'mwc-textarea, mwc-textfield':[{label: propInfo.name, value: propInfo.default ?? '', helper: propInfo.description ?? ''}],
                                'mwc-formfield': [{label: propInfo.name}],
                                '[on][data-type="boolean"]': [{on: 'change', val: 'target.checked'}],
                            }

                        }

                    }
                },

            }
        })
    }

} 

define(SwagTagMWC);