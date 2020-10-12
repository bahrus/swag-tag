import { SwagTagPrimitiveBase, linkInputType } from './swag-tag-primitive-base.js';
import { define } from 'xtal-element/xtal-latx.js';
import { createTemplate } from 'trans-render/createTemplate.js';
import 'xtal-json-editor/xtal-json-editor.js';
import 'xtal-editor/src/xtal-editor-base-primitive.js';
import { templStampSym } from 'trans-render/plugins/templStamp.js';
const mainTemplate = createTemplate(/* html */ `
  <style>
      :host{
          display:block;
      }
      label{
          display:block
      }
  </style>
  <main>
    <label for=myInput part=label></label>
    <xtal-editor-base-primitive key=root part=xtalEditor></xtal-editor-base-primitive>
  </main>
`);
const uiRefs = {
    label: Symbol('label'),
    xtalEditor: Symbol('xtalEditor')
};
const initTransform = ({ self, handleChange }) => ({
    ':host': [templStampSym, uiRefs],
    [uiRefs.xtalEditor]: [{}, { 'parsed-object-changed': handleChange }]
});
const updateLabel = ({ name }) => ({
    [uiRefs.label]: [{ textContent: name + ':' }]
});
const updateJsonEditor = ({ value, name }) => ({
    [uiRefs.xtalEditor]: [{ value: value }]
});
const linkParsedObject = ({ value, self }) => {
    try {
        const parsed = JSON.parse(value);
        self.parsedObject = parsed;
    }
    catch (e) { }
};
const propActions = [linkParsedObject, linkInputType];
export class SwagTagJsonEditor extends SwagTagPrimitiveBase {
    constructor() {
        super(...arguments);
        this.propActions = propActions;
        this.mainTemplate = mainTemplate;
        this.initTransform = initTransform;
        this.updateTransforms = [
            updateLabel, updateJsonEditor
        ];
    }
    handleChange(e) {
        this.parsedObject = e.target.parsedObject;
    }
}
SwagTagJsonEditor.is = 'swag-tag-json-editor';
SwagTagJsonEditor.attributeProps = ({ parsedObject }) => ({
    obj: [parsedObject],
    notify: [parsedObject]
});
define(SwagTagJsonEditor);
