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
//import {replaceTargetWithTag} from 'trans-render/replaceTargetWithTag.js';
import { replaceElementWithTemplate } from "trans-render/replaceElementWithTemplate.js";
import { XtalTextInputMD } from "xtal-text-input-md/xtal-text-input-md.js";
import { XtalCheckboxInputMD } from "xtal-checkbox-input-md/xtal-checkbox-input-md.js";
import {XtalTextAreaMD} from "xtal-text-area-md/xtal-text-area-md.js";
import { decorate } from "trans-render/decorate.js";
import { PD } from "p-et-alia/p-d.js";

const styleTemplate = createTemplate(/* html */ `
<style>
:host{
    display: block;
}
details>summary {
    margin-top: 20px;
    list-style: none;
    cursor:pointer;
}
details>summary::-webkit-details-marker{
    display:none;
}
</style>
`);
const stringInputTemplate = createTemplate(/* html */ `
<xtal-text-input-md disabled>
  <span slot="label"></span>
</xtal-text-input-md>
`);
const objectInputTemplate = createTemplate(/* html */ `
<xtal-text-area-md disabled>
  <span slot="label"></span>
</xtal-text-area-md>
`);
const boolInputTemplate = createTemplate(/* html */ `
<xtal-checkbox-input-md disabled>
  <span slot="label"></span>
</xtal-checkbox-input-md>
`);
export class SwagTag extends SwagTagBase {
  static get is() {
    return "swag-tag";
  }

  get noShadow() {
    return false;
  }

  //_renderOptions: RenderOptions;
  copyAttribs(inp: HTMLElement, target: Element) {
    for (let i = 0, ii = inp.attributes.length; i < ii; i++) {
      const attrib = inp.attributes[i];
      if (attrib.name === "type") continue;
      target.setAttribute(attrib.name, attrib.value);
    }
  }
  initRenderCallback(ctx: RenderContext, target: HTMLElement | DocumentFragment){
    super.initRenderCallback(ctx, target);
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
        'input[type="text"][data-prop-type="object"]': ({
          ctx,
          target
        }) => {
          replaceElementWithTemplate(target, objectInputTemplate, ctx);
        },
        'input[type="checkbox"]': ({ ctx, target }) => {
          replaceElementWithTemplate(target, boolInputTemplate, ctx);
        },
        [XtalTextInputMD.is]: ({ ctx, target }) => {
          const inp = ctx.replacedElement as HTMLInputElement;
          this.copyAttribs(inp, target);
          (<any>target).value = inp.value;
          return {
            span: inp.dataset.propName
          };
        },
        [XtalTextAreaMD.is]:({ctx, target}) => {
          const xta = target as XtalTextAreaMD;
          const inp = ctx.replacedElement as HTMLInputElement;
          xta.coerceToJSON = true;
          xta.value = inp.value;
          return {
            span: inp.dataset.propName + " (JSON required)"
          }
        },
        'p-d[data-type="object"]': ({ target }) =>decorate(target as HTMLElement, {
            propVals: {
              on: "object-value-changed",
              val: "target.objectValue"
            } as PD
        }),

        [XtalCheckboxInputMD.is]: ({ ctx, target }) => {
          const xci = target as XtalCheckboxInputMD;
          const inp = ctx.replacedElement as HTMLInputElement;
          this.copyAttribs(inp, target);
          xci.value = inp.value;
          xci.boolValue = inp.hasAttribute("checked");
          return {
            span: inp.dataset.propName
          };
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
define(SwagTag);
