import {SwagTagBase} from './swag-tag-base.js';
import { define } from "trans-render/define.js";
import {
    RenderOptions,
    RenderContext,
    TransformRules
} from "trans-render/init.d.js";
import "xy-ui/components/xy-input.js";
import { append } from "trans-render/append.js";
import { createTemplate } from "xtal-element/utils.js";
import { init } from "trans-render/init.js";
//import { replaceElementWithTemplate } from "trans-render/replaceElementWithTemplate.js";
import {replaceTargetWithTag} from "trans-render/replaceTargetWithTag.js";

const stringInputTemplate = createTemplate(/* html */ `
<xy-input disabled></xy-input>
`);

export class SwagTagXyUI extends SwagTagBase{
    static get is(){return 'swag-tag-xyui';}

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
                    const label = target.dataset.propName;
                    //replaceElementWithTemplate(target, stringInputTemplate, ctx);

                    replaceTargetWithTag(target, 'xy-input', ctx, el => {
                        //debugger;
                        if(label !== undefined){
                            el.setAttribute('label', label);
                        }
                        
                    })
                    return {
                        'xy-input': ({target}) => {
                            debugger;
                            (<any>target).label = label
                        },
                    }
                },
                
            }
        })
    }

} 

define(SwagTagXyUI);