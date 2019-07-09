import { SwagTagBase } from "./swag-tag-base.js";
import { define } from "trans-render/define.js";
import { append } from 'trans-render/append.js';
import { createTemplate } from "xtal-element/utils.js";
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
    get renderOptions() {
        if (this._renderOptions === undefined) {
            this._renderOptions = {
                initializedCallback: (ctx, target) => {
                    append(target, styleTemplate);
                }
            };
        }
        return this._renderOptions;
    }
}
define(SwagTag);
