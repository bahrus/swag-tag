import { SwagTagPrimitiveBase, linkInputType } from './swag-tag-primitive-base.js';
import { define, mergeProps } from 'xtal-element/xtal-latx.js';
import { createTemplate } from 'trans-render/createTemplate.js';
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
  <label for=myInput part=fieldLabel></label>
  <textarea id=myInput part=inputElement part=textarea debug></textarea>
`);
const [label$, textarea$] = [Symbol('label'), Symbol('textarea')];
const updateLabel = ({ name }) => ({
    [label$]: name + ':',
});
const updateTextArea = ({ readOnly, inputType, disabled, value }) => ({
    [textarea$]: [{ value: value || '' }, , { 'readonly': readOnly, type: inputType, disabled: disabled }]
});
const linkParsedObject = ({ value, self }) => {
    try {
        const parsed = JSON.parse(value);
        self.parsedObject = parsed;
    }
    catch (e) { }
};
export class SwagTagObjectBase extends SwagTagPrimitiveBase {
    constructor() {
        super(...arguments);
        this.propActions = [linkParsedObject, linkInputType];
        this.mainTemplate = mainTemplate;
        this.initTransform = {
            label: label$,
            textarea: [, { 'input': this.handleInput }, , , textarea$]
        };
        this.updateTransforms = [
            updateLabel, updateTextArea
        ];
    }
    handleInput(e) {
        try {
            const parsed = JSON.parse(e.target.value);
            this.parsedObject = parsed;
        }
        catch (e) { }
    }
}
SwagTagObjectBase.is = 'swag-tag-object-base';
SwagTagObjectBase.attributeProps = ({ parsedObject }) => {
    const ap = {
        obj: [parsedObject],
        notify: [parsedObject]
    };
    return mergeProps(ap, SwagTagPrimitiveBase.props);
};
define(SwagTagObjectBase);
