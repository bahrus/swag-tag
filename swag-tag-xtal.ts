import { SwagTagBase } from "./swag-tag-base.js";
import { define } from "trans-render/define.js";
import {
  RenderOptions,
  RenderContext,
  TransformRules
} from "trans-render/init.d.js";
import { append } from "trans-render/append.js";
import { createTemplate } from "xtal-element/utils.js";
import { init } from "trans-render/init.js";
import { replaceElementWithTemplate } from "trans-render/replaceElementWithTemplate.js";

import { decorate } from "trans-render/decorate.js";
import { PD } from "p-et-alia/p-d.js";
import {IXtalInputProperties, xtal_text_input_md} from 'xtal-text-input-md/types.js';

const styleTemplate = createTemplate(/* html */ `
<style>
:host{
    display: block;
}
details>summary {
    margin-top: 20px;
    /*list-style: none;*/
    cursor:pointer;
}
details>summary::-webkit-details-marker{
    /*display:none;*/
}
</style>
`);
const stringInputTemplate = createTemplate(/* html */ `
<xtal-text-input-md disabled>
  <span slot="label"></span>
</xtal-text-input-md>
`);
const objectInputTemplate = createTemplate(/* html */ `
<xtal-text-area-md rows=8 cols=20 disabled>
  <span slot="label"></span>
</xtal-text-area-md>
`);
const boolInputTemplate = createTemplate(/* html */ `
<xtal-checkbox-input-md disabled>
  <span slot="label"></span>
</xtal-checkbox-input-md>
`);
function decorateSpan(target: HTMLSpanElement, inp: HTMLInputElement){
  decorate(target, {
    propVals:{
      textContent: inp.dataset.propName,
      title: inp.dataset.description
    } as HTMLSpanElement
  }) 
}
function decorateSpanForObject(target: HTMLSpanElement, inp: HTMLInputElement){
  decorate(target, {
    propVals:{
      textContent: inp.dataset.propName + " (JSON required)",
      title: inp.dataset.description
    } as HTMLSpanElement
  }) 
}
import ("xtal-text-input-md/xtal-text-input-md.js");
import ("xtal-checkbox-input-md/xtal-checkbox-input-md.js");
import ("xtal-text-area-md/xtal-text-area-md.js");
export class SwagTagXtal extends SwagTagBase {
  static get is() {
    return "swag-tag-xtal";
  }

  get noShadow() {
    return false;
  }



  copyAttr(inp: HTMLElement, target: Element){
    inp.getAttributeNames().forEach(name =>{
      if(name !== 'type') target.setAttribute(name, inp.getAttribute(name)!);
    })
  }

  initRenderCallback(ctx: RenderContext, target: HTMLElement | DocumentFragment){
    super.initRenderCallback(ctx, target);
    const xti : xtal_text_input_md = 'xtal-text-input-md';
    init(target as DocumentFragment, {
      Transform: {
        "*": {
          Select: "*"
        } as TransformRules,
        'input[type="text"][data-prop-type="string"]': ({
          ctx,
          target
        }) => {
          replaceElementWithTemplate(target, stringInputTemplate, ctx);
        },
        'input[type="text"][data-prop-type="object"],input[type="text"][data-prop-type="any"]': ({
          ctx,
          target
        }) => {
          replaceElementWithTemplate(target, objectInputTemplate, ctx);
        },
        'input[type="checkbox"]': ({ ctx, target }) => {
          replaceElementWithTemplate(target, boolInputTemplate, ctx);
        },
        [xti]: ({ ctx, target }) => {
          const inp = ctx.replacedElement as any as  IXtalInputProperties;
          this.copyAttr(inp, target);
          (<any>target).value = inp.value;
          return {
            span: ({target}) => decorateSpan(target, inp as any as HTMLInputElement)
          }
        },
        'xtal-text-area-md':({ctx, target}) => {
          const xta = target as any;
          const inp = ctx.replacedElement as HTMLInputElement;
          xta.coerceToJSON = true;
          xta.value = inp.value;
          return {
            span: ({target}) => decorateSpanForObject(target, inp)
          }
        },
        'p-d[data-type="object"],p-d[data-type="any"]': ({ target }) =>decorate(target, {
            propVals: {
              on: "object-value-changed",
              val: "target.objectValue"
            } as PD
        }),

        'xtal-checkbox-input-md': ({ ctx, target }) => {
          const xci = target as any;
          const inp = ctx.replacedElement as HTMLInputElement;
          this.copyAttr(inp, target);
          xci.value = inp.value;
          xci.boolValue = inp.hasAttribute("checked");
          return {
            span: ({target}) => decorateSpan(target, inp)
          }
        },
        'p-d[data-type="boolean"]': ({ target }) => decorate(target as HTMLElement, {
          propVals: {
            val: "target.boolValue"
          } as PD
        }),
      }
    });
    append(target as DocumentFragment, styleTemplate);
  }

}
define(SwagTagXtal);
