import { SwagTagBase } from './swag-tag-base.js';
import { define } from "trans-render/define.js";
import { createTemplate } from "trans-render/createTemplate.js";
import { init } from "trans-render/init.js";
import { replaceElementWithTemplate as replace } from "trans-render/replaceElementWithTemplate.js";
//template refs
const stringInputTemplate = 'stringInputTemplate';
const objectInputTemplate = 'objectInputTemplate';
const boolInputTemplate = 'boolInputTemplate';
const styleTemplate = createTemplate(/* html */ `
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
import("@material/mwc-textfield/mwc-textfield.js");
export class SwagTagMWC extends SwagTagBase {
    static get is() { return 'swag-tag-mwc'; }
    get noShadow() {
        return false;
    }
    initRenderCallback(ctx, target) {
        super.initRenderCallback(ctx, target);
        const string$ = Symbol();
        const object$ = Symbol();
        const bool$ = Symbol();
        init(target, {
            Transform: {
                "*": {
                    Select: "*"
                },
                header: styleTemplate,
                'input[type="text"][data-prop-type="string"]': ({ ctx, target }) => {
                    replace(target, ctx, [string$, /* html */ `
                        <mwc-textfield disabled></mwc-textfield>
                    `]);
                },
                'input[type="text"][data-prop-type="object"],input[type="text"][data-prop-type="other"]': ({ ctx, target }) => {
                    replace(target, ctx, [object$, /* html */ `
                        <mwc-textarea rows=4 disabled></mwc-textarea>
                    `]);
                },
                'input[type="checkbox"]': ({ ctx, target }) => {
                    replace(target, ctx, [bool$, /* html */ `
                    <mwc-formfield disabled>
                        <mwc-checkbox data-prop-type="boolean"></mwc-checkbox>
                    </mwc-formfield>
                    `]);
                },
                'mwc-textarea, mwc-textfield': ({ target, ctx }) => {
                    const inp = ctx.replacedElement;
                    Object.assign(target, { label: inp.dataset.propName, value: inp.value, helper: inp.dataset.description });
                },
                'mwc-formfield': ({ target, ctx }) => {
                    const inp = ctx.replacedElement;
                    target.label = inp.dataset.propName;
                    // return {
                    //     'mwc-checkbox': ({target, ctx}) =>{
                    //     },
                    // }
                },
                '[on][data-type="boolean"]': [{ on: 'change', val: 'target.checked' }],
            }
        });
    }
}
define(SwagTagMWC);
