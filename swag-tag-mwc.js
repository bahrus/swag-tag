import { SwagTagBase, uiRefs, bindName, addEventListeners, linkWcInfo, triggerImportReferencedModule, tryParsed, bindSelf, showHideEditor } from './swag-tag-base.js';
import { define } from 'xtal-element/XtalElement.js';
import { PD } from "p-et-alia/p-d.js";
import { SwagTagMWCTextField } from './swag-tag-mwc-textfield.js';
import { SwagTagMWCCheckbox } from './swag-tag-mwc-checkbox.js';
import { SwagTagMWCTextarea } from './swag-tag-mwc-textarea.js';
import { SwagTagMWCSelect } from './swag-tag-mwc-select.js';
export const addEditors = ({ massagedProps, name }) => ({
    [uiRefs.fFieldset]: [massagedProps, ({ item }) => item.editor, , {
            [`${SwagTagMWCTextField.is},${SwagTagMWCCheckbox.is}`]: ({ item, target }) => {
                Object.assign(target, item);
                target.setAttribute('role', 'textbox');
            },
            '"': ({ item }) => ([PD.is, 'afterEnd', [{ on: 'edited-value-changed', from: 'form', to: 'details', careOf: name, prop: item.name, val: 'target.editedValue', m: 1 }]]),
            [SwagTagMWCTextarea.is]: ({ item, target }) => {
                Object.assign(target, item);
                target.setAttribute('role', 'textbox');
            },
            '""': ({ item }) => ([PD.is, 'afterEnd', [{ on: 'parsed-object-changed', from: 'form', to: 'details', careOf: name, prop: item.name, val: 'target.parsedObject', m: 1 }]]),
            [SwagTagMWCSelect.is]: ({ item, target }) => {
                Object.assign(target, item);
                target.setAttribute('role', 'select');
            },
            '"""': ({ item }) => ([PD.is, 'afterEnd', [{ on: 'edited-value-changed', from: 'form', to: 'details', careOf: name, prop: item.name, val: 'target.editedValue', m: 1 }]]),
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
