import { SwagTagPrimitiveBase } from './swag-tag-primitive-base.js';
import { define, mergeProps } from 'xtal-element/XtalElement.js';
import { createTemplate } from 'trans-render/createTemplate.js';
import("@material/mwc-select/mwc-select.js");
import("@material/mwc-list/mwc-list-item.js");
const mainTemplate = createTemplate(/* html */ `
  <style>
      :host{
          display:block;
      }
      label{
          display:block;
      }
      mwc-select{
          width: 100%;
      }
  </style>
  <mwc-select></mwc-select>
`);
const optionTemplate = createTemplate(/* html */ `
<mwc-list-item></mwc-list-item>
`);
const [mwcSel] = [Symbol()];
const initTransform = ({ self }) => ({
    'mwc-select': [, { selected: self.handleSelected }, { label: name }, , mwcSel]
});
const updateSelect = ({ readOnly, inputType, disabled, value, name }) => ({
    [mwcSel]: [, , { 'readonly': readOnly, disabled: disabled, value: value, label: name }]
});
const updateOptions = ({ self, options }) => ({
    [mwcSel]: [options || [], optionTemplate, , {
            'mwc-list-item': ({ item }) => [{ textContent: item, value: item }]
        }]
});
export class SwagTagMWCSelect extends SwagTagPrimitiveBase {
    constructor() {
        super(...arguments);
        this.mainTemplate = mainTemplate;
        this.initTransform = initTransform;
        this.updateTransforms = [updateOptions, updateSelect];
    }
    handleSelected(e) {
    }
}
SwagTagMWCSelect.is = 'swag-tag-mwc-select';
SwagTagMWCSelect.attributeProps = ({ options }) => {
    const ap = {
        obj: [options]
    };
    return mergeProps(ap, SwagTagPrimitiveBase.props);
};
define(SwagTagMWCSelect);
