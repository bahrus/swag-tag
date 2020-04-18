import { SwagTagBase, propInfo$ } from './swag-tag-base.js';
import { define } from "trans-render/define.js";
import { createTemplate } from "trans-render/createTemplate.js";
import { init } from "trans-render/init.js";
import { replaceElementWithTemplate as replace } from "trans-render/replaceElementWithTemplate.js";
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
export class SwagTagUI5 extends SwagTagBase {
    static get is() { return 'swag-tag-ui5'; }
    get noShadow() {
        return false;
    }
    initRenderCallback(ctx, target) {
        super.initRenderCallback(ctx, target);
        init(target, {
            Transform: {
                fieldset: {
                    form: {
                        div: ({ target }) => {
                            const propInfo = target[propInfo$];
                            return {
                                textarea: ({ ctx, target }) => {
                                    replace(target, ctx, objectInputTemplate);
                                }
                            };
                        }
                    }
                },
            }
        });
    }
}
define(SwagTagUI5);
