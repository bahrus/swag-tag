import {SwagTagPrimitiveBase, linkInputType} from './swag-tag-primitive-base.js';
import {SelectiveUpdate} from 'xtal-element/types.d.js';
import {define, AttributeProps, mergeProps} from 'xtal-element/xtal-latx.js';
import {createTemplate} from 'trans-render/createTemplate.js';
import {XtalJsonEditor} from 'xtal-json-editor/xtal-json-editor.js';

const mainTemplate = createTemplate(/* html */`
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


const updateLabel = ({name, value}: SwagTagJsonEditor) => ({
    [label$]: [{textContent: name + ':', style: {display: value === undefined ? 'none': 'block'}]
});
const updateJsonEditor = ({readOnly, inputType, disabled, value}: SwagTagPrimitiveBase) => ({
    [jsonEditor]: [{options: {}, input: JSON.parse(value || {})},,{'readonly': readOnly, type: inputType, disabled: disabled}]
});
// const adjustMain = ({name, value}: SwagTagPrimitiveBase) => ({
//     main: [value===undefined,{
//         label:[{style: {display: 'none'}}]
//     },{
//         label:[{style: {display: 'block'}}]
//     }
//     ]
// });

const linkParsedObject = ({value, self}: SwagTagJsonEditor) =>{
    try{
        const parsed = JSON.parse(value);
        self.parsedObject = parsed;
    }catch(e){}
}

export class SwagTagJsonEditor extends SwagTagPrimitiveBase{
    static is = 'swag-tag-json-editor';

    static attributeProps = ({parsedObject}: SwagTagJsonEditor) =>{
        const ap = {
            obj: [parsedObject],
            notify: [parsedObject]
        } as AttributeProps;
        return mergeProps(ap, SwagTagPrimitiveBase.props);
    }

    propActions = [linkParsedObject, linkInputType] as SelectiveUpdate<any>[];

    mainTemplate = mainTemplate;
    initTransform = {
        main:{
            label: label$,
            [XtalJsonEditor.is]: [,{'edited-result-changed': this.handleChange},,, jsonEditor]
        }
    };

    handleChange(e: CustomEvent){
        this.parsedObject = e.detail.value;
    }

    updateTransforms = [
        updateLabel, updateJsonEditor
    ]  as SelectiveUpdate<any>[];

    parsedObject: any;
}
define(SwagTagJsonEditor);