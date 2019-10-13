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
import { append } from "trans-render/append.js";
import { createTemplate } from "xtal-element/utils.js";
import { init } from "trans-render/init.js";
import { replaceElementWithTemplate } from "trans-render/replaceElementWithTemplate.js";

const stringInputTemplate = createTemplate(/* html */ `
<ui5-input disabled>
  <span slot="label"></span>
</ui5-input>
`);

const objectInputTemplate = createTemplate(/* html */ `
<ui5-textarea rows=8 cols=200 growing disabled style="width:100%">
  <span slot="label"></span>
</ui5-textarea>
`);

export class SwagTagUI5 extends SwagTagBase{
    static get is(){return 'swag-tag-ui5';}

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
                'ui5-input,ui5-textarea': (({target, ctx}) =>{
                    const inp = ctx.replacedElement as HTMLInputElement;
                    target.placeholder = inp.dataset.propName!;
                }) as TransformFn<HTMLInputElement> as TransformFn,
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

define(SwagTagUI5);