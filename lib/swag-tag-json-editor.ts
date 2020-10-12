import {SwagTagPrimitiveBase, linkInputType} from './swag-tag-primitive-base.js';
import {SelectiveUpdate} from 'xtal-element/types.d.js';
import {define, AttributeProps, mergeProps} from 'xtal-element/xtal-latx.js';
import {createTemplate} from 'trans-render/createTemplate.js';
import 'xtal-json-editor/xtal-json-editor.js';
import 'xtal-editor/src/xtal-editor-base-primitive.js';
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
    <xtal-editor-base-primitive key=root part=xtalEditor></xtal-editor-base-primitive>
  </main>
`);

const uiRefs = {
    label: Symbol('label'),
    xtalEditor: Symbol('xtalEditor')
}

const initTransform = ({self, handleChange}: SwagTagJsonEditor) => ({
    ':host': [templStampSym, uiRefs],
    [uiRefs.xtalEditor]: [{}, {'parsed-object-changed': handleChange}]
    
})

const updateLabel = ({name}: SwagTagJsonEditor) => ({
    [uiRefs.label]: [{textContent: name + ':'}]
});
const updateJsonEditor = ({value, name}: SwagTagPrimitiveBase) => ({
    [uiRefs.xtalEditor]: [{value: value}]
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

    static attributeProps = ({parsedObject}: SwagTagJsonEditor) =>({
        obj: [parsedObject],
        notify: [parsedObject]
    })

    propActions = propActions;

    mainTemplate = mainTemplate;

    initTransform = initTransform;

    handleChange(e: CustomEvent){
        this.parsedObject = (<any>e.target!).parsedObject;
    }

    updateTransforms = [
        updateLabel, updateJsonEditor
    ]  as SelectiveUpdate<any>[];

    parsedObject: any;
}
define(SwagTagJsonEditor);