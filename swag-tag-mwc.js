import { SwagTagBase, uiRefs, bindName, addEventListeners, linkWcInfo, triggerImportReferencedModule, tryParsed, bindSelf, showHideEditor } from './swag-tag-base.js';
import { define } from 'xtal-element/XtalElement.js';
import { SwagTagMWCTextField } from './swag-tag-mwc-textfield.js';
import { SwagTagMWCCheckbox } from './swag-tag-mwc-checkbox.js';
import { SwagTagMWCTextarea } from './swag-tag-mwc-textarea.js';
import { SwagTagMWCSelect } from './swag-tag-mwc-select.js';
export const addEditors = ({ massagedProps, name }) => ({
    [uiRefs.fFieldset]: [massagedProps, ({ item }) => item.editor, , {
            [`${SwagTagMWCTextField.is},${SwagTagMWCCheckbox.is},${SwagTagMWCTextarea.is},${SwagTagMWCSelect.is}`]: ({ item, target }) => {
                Object.assign(target, item);
                target.setAttribute('role', 'textbox');
            },
        }]
});
const massaged = Symbol();
export const linkMassagedProps = ({ properties, self, block }) => {
    if (properties === undefined || properties[massaged])
        return;
    properties.forEach(prop => {
        tryParsed(prop);
        const anyProp = prop;
        let defaultVal = anyProp.default;
        switch (prop.type) {
            case 'string':
            case 'number':
                anyProp.editor = SwagTagMWCTextField.is;
                break;
            case 'boolean':
                anyProp.editor = SwagTagMWCCheckbox.is;
                break;
            case 'object':
                anyProp.editor = SwagTagMWCTextarea.is;
                break;
            case 'stringArray':
                anyProp.editor = SwagTagMWCSelect.is;
                break;
            default:
                throw 'Not implemented';
        }
    });
    properties[massaged] = true;
    self.massagedProps = block !== undefined ? properties.filter(prop => !block.includes(prop.name)) : properties;
};
const updateTransforms = [
    bindName,
    addEventListeners,
    addEditors,
    bindSelf,
];
export class SwagTagMWC extends SwagTagBase {
    constructor() {
        super(...arguments);
        this.updateTransforms = updateTransforms;
        this.propActions = [
            linkWcInfo, linkMassagedProps, triggerImportReferencedModule, showHideEditor
        ];
    }
}
SwagTagMWC.is = 'swag-tag-mwc';
define(SwagTagMWC);
