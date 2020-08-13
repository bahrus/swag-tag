import {SwagTagPrimitiveBase, linkInputType} from './swag-tag-primitive-base.js';
import {SelectiveUpdate} from 'xtal-element/types.d.js';
import {define, AttributeProps, mergeProps} from 'xtal-element/xtal-latx.js';
import {createTemplate} from 'trans-render/createTemplate.js';
import 'xtal-json-editor/xtal-json-editor.js';
import {templStampSym} from 'trans-render/plugins/templStamp.js';

const mainTemplate = createTemplate(/* html */`
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
}

const initTransform = ({self, handleChange}: SwagTagJsonEditor) => ({
    ':host': [templStampSym, uiRefs],
    main:{
        //[uiRefs.jsonEditor]: [{},{'edited-result-changed': handleChange}]
        'xtal-json-editor': [{},{'edited-result-changed': handleChange}]
    }
})

const updateLabel = ({name}: SwagTagJsonEditor) => ({
    [uiRefs.label]: [{textContent: name + ':'}]
});
const updateJsonEditor = ({value, name}: SwagTagPrimitiveBase) => ({
    [uiRefs.jsonEditor]: [{options: {}, input: value===undefined ? {} : JSON.parse(value)}]
});


const linkParsedObject = ({value, self}: SwagTagJsonEditor) =>{
    try{
        const parsed = JSON.parse(value);
        self.parsedObject = parsed;
    }catch(e){}
}
const propActions = [linkParsedObject, linkInputType] as SelectiveUpdate<any>[];

export class SwagTagJsonEditor extends SwagTagPrimitiveBase {
    static is = 'swag-tag-json-editor';

    static attributeProps = ({parsedObject}: SwagTagJsonEditor) =>{
        const ap = {
            obj: [parsedObject],
            notify: [parsedObject]
        } as AttributeProps;
        return mergeProps(ap, SwagTagPrimitiveBase.props);
    }

    propActions = propActions;

    mainTemplate = mainTemplate;

    initTransform = initTransform;

    handleChange(e: CustomEvent){
        this.parsedObject = e.detail.value;
    }

    updateTransforms = [
        updateLabel, updateJsonEditor
    ]  as SelectiveUpdate<any>[];

    parsedObject: any;
}
define(SwagTagJsonEditor);