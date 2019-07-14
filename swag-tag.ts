import { SwagTagBase } from "./swag-tag-base.js";
import { define } from "trans-render/define.js";
import {RenderOptions, RenderContext, TransformRules} from 'trans-render/init.d.js';
import {append} from 'trans-render/append.js';
import { createTemplate } from "xtal-element/utils.js";
import {init} from 'trans-render/init.js';
//import {replaceTargetWithTag} from 'trans-render/replaceTargetWithTag.js';
import {replaceElementWithTemplate} from 'trans-render/replaceElementWithTemplate.js';
import {XtalTextInputMD} from 'xtal-text-input-md/xtal-text-input-md.js';
import {XtalCheckboxInputMD} from 'xtal-checkbox-input-md/xtal-checkbox-input-md.js';
import { decorate } from "trans-render/decorate.js";
import {PD} from "p-et-alia/p-d.js";

const styleTemplate = createTemplate(
/* html */ `
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
const textInputTemplate = createTemplate(/* html */`
<xtal-text-input-md disabled>
  <span slot="label"></span>
</xtal-text-input-md>
`);
const boolInputTemplate = createTemplate(/* html */`
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

  _renderOptions: RenderOptions | undefined; 
  get renderOptions(): RenderOptions {
      if(this._renderOptions === undefined){
          this._renderOptions = {
            initializedCallback:(ctx: RenderContext, target: HTMLElement | DocumentFragment) =>{
                init(target,{
                  Transform:{
                    '*':{
                      Select: '*'
                    } as TransformRules,
                    'input[type="text"]':({ctx, target}) =>{
                      replaceElementWithTemplate(target, textInputTemplate, ctx);
                    },
                    'input[type="checkbox"]':({ctx, target}) =>{
                      replaceElementWithTemplate(target, boolInputTemplate, ctx);
                    },                    
                    [XtalTextInputMD.is]:({ctx,target}) => {
                      const inp = ctx.replacedElement as HTMLInputElement;
                      for(let i = 0, ii= inp.attributes.length; i < ii; i++){
                          const attrib = inp.attributes[i];
                          //const inp = clonedNode.querySelector('input');
                          if (attrib.name === "type") continue;
                          target.setAttribute(attrib.name, attrib.value);
                      }
                      (<any>target).value = inp.value;
                      return {
                        span:inp.dataset.propName,
                      }
                    },
                    'p-d[data-type="boolean"]':({target}) => decorate(target as HTMLElement, {
                      propVals: {
                        val: "target.boolValue"
                      } as PD
                    }),
                    [XtalCheckboxInputMD.is]:({ctx,target}) => {
                      const xci = target as XtalCheckboxInputMD;
                      const inp = ctx.replacedElement as HTMLInputElement;
                      for(let i = 0, ii= inp.attributes.length; i < ii; i++){
                          const attrib = inp.attributes[i];
                          //const inp = clonedNode.querySelector('input');
                          if (attrib.name === "type") continue;
                          target.setAttribute(attrib.name, attrib.value);
                      }
                      xci.value = inp.value;
                      xci.boolValue = inp.hasAttribute('checked');
                      return {
                        span:inp.dataset.propName,
                      }
                    }
                  }
                })
                append(target, styleTemplate)
            }
          } as RenderOptions;
      }
      return this._renderOptions;
  }
}
define(SwagTag);
