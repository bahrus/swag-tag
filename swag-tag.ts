import { SwagTagBase } from "./swag-tag-base.js";
import { define } from "trans-render/define.js";
import {RenderOptions, RenderContext, TransformRules} from 'trans-render/init.d.js';
import {append} from 'trans-render/append.js';
import { createTemplate } from "xtal-element/utils.js";
import {init} from 'trans-render/init.js';

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
                    'input':({target}) =>{
                      (target as HTMLElement).style.backgroundColor = 'red';
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
