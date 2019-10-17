import {SwagTagBase} from './swag-tag-base.js';
import { define } from "trans-render/define.js";
import {
    RenderOptions,
    RenderContext,
    TransformRules,
    TransformFn
} from "trans-render/init.d.js";

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
<ui5-checkbox disabled></ui5-checkbox>
`);

import("@ui5/webcomponents/dist/Input.js");
import("@ui5/webcomponents/dist/TextArea.js");
import("@ui5/webcomponents/dist/CheckBox.js");
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
                'input[type="checkbox"]': ({ ctx, target }) => {
                    replaceElementWithTemplate(target, boolInputTemplate, ctx);
                },
                'ui5-input,ui5-textarea': (({target, ctx}) =>{
                    const inp = ctx.replacedElement as HTMLInputElement;
                    target.placeholder = inp.dataset.propName!;
                }) as TransformFn<HTMLInputElement> as TransformFn,
                'ui5-checkbox': (({target, ctx}) =>{
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

define(SwagTagUI5);