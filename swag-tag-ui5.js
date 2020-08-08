import { SwagTagBase, uiRefs, bindName, addEventListeners, linkWcInfo, triggerImportReferencedModule, adjustValueAndType, bindSelf, showHideEditor, linkInnerTemplate, copyPropInfoIntoEditor } from './swag-tag-base.js';
import { define } from 'xtal-element/XtalElement.js';
//import {SwagTagMWCTextField} from './swag-tag-mwc-textfield.js';
import { SwagTagUI5Input } from './swag-tag-ui5-input.js';
import { SwagTagUI5Checkbox } from './swag-tag-ui5-checkbox.js';
//import {SwagTagMWCTextarea} from './swag-tag-mwc-textarea.js';
import { SwagTagJsonEditor } from './swag-tag-json-editor.js';
import { SwagTagMWCSelect } from './swag-tag-mwc-select.js';
const copyPropInfoIntoEditors = {
    [`${SwagTagUI5Input.is},${SwagTagUI5Checkbox.is},${SwagTagJsonEditor.is},${SwagTagMWCSelect.is}`]: copyPropInfoIntoEditor,
};
export const addEditors = ({ massagedProps, name }) => ({
    // Loop over massagedProps, and insert dynamic editor via tag name (item.editor is the tag name)
    [uiRefs.fFieldset]: [
        //Array to loop over
        massagedProps || [],
        //A **toTagOrTemplate** function that returns a string -- used to generate a (custom element) with the name of the string.
        ({ item }) => item.editor,
        //empty range
        ,
        //now that document.createElement(tag) done, apply transform
        copyPropInfoIntoEditors
    ]
});
const massaged = Symbol();
export const linkMassagedProps = ({ properties, self, block }) => {
    if (properties === undefined || properties[massaged])
        return;
    properties.forEach(prop => {
        adjustValueAndType(prop);
        const anyProp = prop;
        let defaultVal = anyProp.default;
        switch (prop.type) {
            case 'string':
            case 'number':
                anyProp.editor = SwagTagUI5Input.is;
                break;
            case 'boolean':
                anyProp.editor = SwagTagUI5Checkbox.is;
                break;
            case 'object':
                anyProp.editor = SwagTagJsonEditor.is;
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
export class SwagTagUI5 extends SwagTagBase {
    constructor() {
        super(...arguments);
        this.updateTransforms = updateTransforms;
        this.propActions = [
            linkWcInfo, linkMassagedProps, triggerImportReferencedModule, showHideEditor, linkInnerTemplate
        ];
    }
}
SwagTagUI5.is = 'swag-tag-ui5';
define(SwagTagUI5);
