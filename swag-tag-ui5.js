import { SwagTagBase } from './swag-tag-base.js';
import { define } from "trans-render/define.js";
import "@ui5/webcomponents/dist/Input.js";
import { createTemplate } from "xtal-element/utils.js";
import { init } from "trans-render/init.js";
import { replaceElementWithTemplate } from "trans-render/replaceElementWithTemplate.js";
const stringInputTemplate = createTemplate(/* html */ `
<ui5-input disabled>
  <span slot="label"></span>
</ui5-input>
`);
export class SwagTagUI5 extends SwagTagBase {
    static get is() { return 'swag-tag-ui5'; }
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
            }
        });
    }
}
define(SwagTagUI5);
