import { SwagTagBase } from './swag-tag-base.js';
import { define } from "trans-render/define.js";
import { createTemplate } from "xtal-element/utils.js";
import { init } from "trans-render/init.js";
import { replaceElementWithTemplate } from "trans-render/replaceElementWithTemplate.js";
const stringInputTemplate = createTemplate(/* html */ `
    <mwc-textfield disabled></mwc-textfield>
`);
const objectInputTemplate = createTemplate(/* html */ `
    <mwc-textarea rows=4 disabled></mwc-textarea>
`);
const boolInputTemplate = createTemplate(/* html */ `
<mwc-formfield disabled>
    <mwc-checkbox data-prop-type="boolean"></mwc-checkbox>
</mwc-formfield>
`);
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
        init(target, {
            Transform: {
                "*": {
                    Select: "*"
                },
                header: styleTemplate,
                'input[type="text"][data-prop-type="string"]': ({ ctx, target }) => {
                    replaceElementWithTemplate(target, stringInputTemplate, ctx);
                },
                'input[type="text"][data-prop-type="object"],input[type="text"][data-prop-type="other"]': ({ ctx, target }) => {
                    replaceElementWithTemplate(target, objectInputTemplate, ctx);
                },
                'input[type="checkbox"]': ({ ctx, target }) => {
                    replaceElementWithTemplate(target, boolInputTemplate, ctx);
                },
                'mwc-textarea, mwc-textfield': ({ target, ctx }) => {
                    const inp = ctx.replacedElement;
                    Object.assign(target, { label: inp.dataset.propName, value: inp.value, helper: inp.dataset.description });
                },
                'mwc-formfield': ({ target, ctx }) => {
                    const inp = ctx.replacedElement;
                    target.label = inp.dataset.propName;
                    return {
                        'mwc-checkbox': ({ target, ctx }) => {
                        },
                    };
                },
                '[on][data-type="boolean"]': ({ target }) => {
                    Object.assign(target, { on: 'change', val: 'target.checked' });
                },
            }
        });
    }
}
define(SwagTagMWC);
