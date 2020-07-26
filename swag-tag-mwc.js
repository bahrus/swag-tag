import { SwagTagBase, uiRefs, createUiRefs, addEventListeners, linkWcInfo, triggerImportReferencedModule } from './swag-tag-base.js';
import { define } from 'xtal-element/XtalElement.js';
import { PD } from "p-et-alia/p-d.js";
import { SwagTagMWCTextField } from './swag-tag-mwc-textfield.js';
import { SwagTagMWCCheckbox } from './swag-tag-mwc-checkbox.js';
import { SwagTagMWCTextarea } from './swag-tag-mwc-textarea.js';
export const addEditors = ({ massagedProps, name }) => ({
    [uiRefs.fieldset]: [massagedProps, ({ item }) => item.editor, , {
            [`${SwagTagMWCTextField.is},${SwagTagMWCCheckbox.is}`]: ({ item, target }) => {
                Object.assign(target, item);
                target.setAttribute('role', 'textbox');
            },
            '"': ({ item }) => ([PD.is, 'afterEnd', [{ on: 'input', from: 'form', to: 'details', careOf: name, prop: item.name, val: 'target.value', m: 1 }]]),
            [SwagTagMWCTextarea.is]: ({ item, target }) => {
                Object.assign(target, item);
                target.setAttribute('role', 'textbox');
            },
            '""': ({ item }) => ([PD.is, 'afterEnd', [{ on: 'parsed-object-changed', from: 'form', to: 'details', careOf: name, prop: item.name, val: 'target.parsedObject', m: 1 }]])
        }]
});
const massaged = Symbol();
export const linkMassagedProps = ({ properties, self }) => {
    if (properties === undefined || properties[massaged])
        return;
    properties.forEach(prop => {
        const anyProp = prop;
        prop.value = anyProp.default;
        switch (prop.type) {
            case 'string':
            case 'number':
                anyProp.editor = SwagTagMWCTextField.is;
                break;
            case 'boolean':
                anyProp.editor = SwagTagMWCCheckbox.is;
                break;
            default:
                anyProp.editor = SwagTagMWCTextarea.is;
        }
    });
    properties[massaged] = true;
    self.massagedProps = properties;
};
const updateTransforms = [
    createUiRefs,
    addEventListeners,
    addEditors
];
export class SwagTagMWC extends SwagTagBase {
    constructor() {
        super(...arguments);
        this.updateTransforms = updateTransforms;
        this.propActions = [
            linkWcInfo, linkMassagedProps, triggerImportReferencedModule
        ];
    }
}
SwagTagMWC.is = 'swag-tag-mwc';
define(SwagTagMWC);
