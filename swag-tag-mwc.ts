import {SwagTagBase} from './swag-tag-base.js';
import { define } from "trans-render/define.js";
import {
    RenderOptions,
    RenderContext,
    TransformRules,
    TransformFn
} from "trans-render/init.d.js";
import  "@ui5/webcomponents/dist/Input.js";
import "@ui5/webcomponents/dist/TextArea.js";
import  "@material/mwc-checkbox/mwc-checkbox.js";
import "@material/mwc-formfield/mwc-formfield.js";
import { append } from "trans-render/append.js";
import { createTemplate } from "xtal-element/utils.js";
import { init } from "trans-render/init.js";
import { replaceElementWithTemplate } from "trans-render/replaceElementWithTemplate.js";

const stringInputTemplate = createTemplate(/* html */ `
<ui5-input disabled></ui5-input>
`);

const objectInputTemplate = createTemplate(/* html */ `
<ui5-textarea rows=8 cols=200 growing disabled style="width:100%"></ui5-textarea>
`);

const boolInputTemplate = createTemplate(/* html */ `
<mwc-formfield disabled label="This is a checkbox.">
    <mwc-checkbox></mwc-checkbox>
</mwc-formfield>
`);

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
                'input[type="text"][data-prop-type="string"]': ({ctx, target}) => {
                    replaceElementWithTemplate(target, stringInputTemplate, ctx);
                },
                'input[type="checkbox"]': ({ ctx, target }) => {
                    replaceElementWithTemplate(target, boolInputTemplate, ctx);
                },
                'ui5-input,ui5-textarea': (({target, ctx}) =>{
                    const inp = ctx.replacedElement as HTMLInputElement;
                    target.placeholder = inp.dataset.propName!;
                }) as TransformFn<HTMLInputElement> as TransformFn,
                'mwc-checkbox': (({target, ctx}) =>{
                    const inp = ctx.replacedElement as HTMLInputElement;
                    (<any>target).text = inp.dataset.propName!;
                }),
                'p-d[data-type="boolean"]': ({target}) =>{
                    const uicheckbox = target as any;
                    uicheckbox.on = 'change';
                    uicheckbox.val = 'target.checked';
                },
                'input[type="text"][data-prop-type="object"],input[type="text"][data-prop-type="any"]': ({
                    ctx,
                    target
                  }) => {
                    replaceElementWithTemplate(target, objectInputTemplate, ctx);
                },
            }
        })
    }

} 

define(SwagTagMWC);