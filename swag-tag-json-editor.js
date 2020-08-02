import { SwagTagPrimitiveBase, linkInputType } from './swag-tag-primitive-base.js';
import { define, mergeProps } from 'xtal-element/xtal-latx.js';
import { createTemplate } from 'trans-render/createTemplate.js';
import { XtalJsonEditor } from 'xtal-json-editor/xtal-json-editor.js';
const mainTemplate = createTemplate(/* html */ `
  <style>
      :host{
          display:block;
      }
      textarea{
          height: 200px;
          width: 100%;
      }
      label{
          display:block
      }
  </style>
  <main>
    <label for=myInput part=fieldLabel></label>
    <xtal-json-editor as=json></xtal-json-editor>
  </main>
`);
const [label$, jsonEditor] = [Symbol('label'), Symbol('jsonEditor')];
const updateLabel = ({ name }) => ({
    [label$]: name + ':',
});
const updateJsonEditor = ({ readOnly, inputType, disabled, value }) => ({
    [jsonEditor]: [{ options: {}, input: JSON.parse(value || {}) }, , { 'readonly': readOnly, type: inputType, disabled: disabled }]
});
const adjustMain = ({ name, value }) => ({
    main: [value === undefined, {
            label: [{ style: { display: 'none' } }]
        }, {
            label: [{ style: { display: 'block' } }]
        }
    ]
});
const linkParsedObject = ({ value, self }) => {
    try {
        const parsed = JSON.parse(value);
        self.parsedObject = parsed;
    }
    catch (e) { }
};
export class SwagTagJsonEditor extends SwagTagPrimitiveBase {
    constructor() {
        super(...arguments);
        this.propActions = [linkParsedObject, linkInputType];
        this.mainTemplate = mainTemplate;
        this.initTransform = {
            main: {
                label: label$,
                [XtalJsonEditor.is]: [, { 'edited-result-changed': this.handleChange }, , , jsonEditor]
            }
        };
        this.updateTransforms = [
            adjustMain, updateLabel, updateJsonEditor
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
