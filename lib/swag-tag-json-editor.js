import { SwagTagPrimitiveBase, linkInputType } from './swag-tag-primitive-base.js';
import { define, mergeProps } from 'xtal-element/xtal-latx.js';
import { createTemplate } from 'trans-render/createTemplate.js';
import 'xtal-json-editor/xtal-json-editor.js';
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
    <xtal-json-editor as=json part=jsonEditor></xtal-json-editor>
  </main>
`);
const uiRefs = {
    label: Symbol('label'),
    jsonEditor: Symbol('jsonEditor')
};
const initTransform = ({ self, handleChange }) => ({
    ':host': [templStampSym, uiRefs],
    main: {
        //[uiRefs.jsonEditor]: [{},{'edited-result-changed': handleChange}]
        'xtal-json-editor': [{}, { 'edited-result-changed': handleChange }]
    }
});
const updateLabel = ({ name }) => ({
    [uiRefs.label]: [{ textContent: name + ':' }]
});
const updateJsonEditor = ({ value, name }) => ({
    [uiRefs.jsonEditor]: [{ options: {}, input: value === undefined ? {} : JSON.parse(value) }]
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
        this.parsedObject = e.detail.value;
    }
}
SwagTagJsonEditor.is = 'swag-tag-json-editor';
SwagTagJsonEditor.attributeProps = ({ parsedObject }) => {
    const ap = {
        obj: [parsedObject],
        notify: [parsedObject]
    };
    return mergeProps(ap, SwagTagPrimitiveBase.props);
};
define(SwagTagJsonEditor);
