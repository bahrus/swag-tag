import { SwagTagBase } from './swag-tag-base.js';
import { define } from "trans-render/define.js";
//import { append } from "trans-render/append.js";
import { createTemplate } from "xtal-element/utils.js";
import { init } from "trans-render/init.js";
import { replaceElementWithTemplate } from "trans-render/replaceElementWithTemplate.js";
const stringInputTemplate = createTemplate(/* html */ `
    <mwc-textfield></mwc-textfield>
`);
const objectInputTemplate = createTemplate(/* html */ `
<mwc-formfield disabled>
    <mwc-textarea></mwc-textarea>
</mwc-formfield>
<!-- <ui5-textarea rows=8 cols=200 growing disabled style="width:100%"></ui5-textarea> -->
`);
const boolInputTemplate = createTemplate(/* html */ `
<mwc-formfield disabled>
    <mwc-checkbox></mwc-checkbox>
</mwc-formfield>
`);
import("@material/mwc-checkbox/mwc-checkbox.js");
//import("@ui5/webcomponents/dist/Input.js");
//import("@ui5/webcomponents/dist/TextArea.js");
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
                'input[type="text"][data-prop-type="string"]': ({ ctx, target }) => {
                    replaceElementWithTemplate(target, stringInputTemplate, ctx);
                },
                'mwc-textfield': ({ target, ctx }) => {
                    const inp = ctx.replacedElement;
                    target.label = inp.dataset.propName;
                },
                'input[type="checkbox"]': ({ ctx, target }) => {
                    replaceElementWithTemplate(target, boolInputTemplate, ctx);
                },
                // 'ui5-input,ui5-textarea': (({target, ctx}) =>{
                'ui5-input': (({ target, ctx }) => {
                    const inp = ctx.replacedElement;
                    target.placeholder = inp.dataset.propName;
                }),
                'mwc-formfield': ({ target, ctx }) => {
                    const inp = ctx.replacedElement;
                    target.label = inp.dataset.propName;
                },
                // 'mwc-checkbox': ({target, ctx}) =>{
                //     const inp = ctx.replacedElement as HTMLInputElement;
                //     (<any>target).text = inp.dataset.propName!;
                // },
                'p-d[data-type="boolean"]': ({ target }) => {
                    const uicheckbox = target;
                    uicheckbox.on = 'change';
                    uicheckbox.val = 'target.checked';
                },
                'input[type="text"][data-prop-type="object"],input[type="text"][data-prop-type="any"]': ({ ctx, target }) => {
                    replaceElementWithTemplate(target, objectInputTemplate, ctx);
                },
            }
        });
    }
}
define(SwagTagMWC);
