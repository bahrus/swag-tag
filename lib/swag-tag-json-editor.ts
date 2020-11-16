import {SwagTagPrimitiveBase, linkInputType} from './swag-tag-primitive-base.js';
import {SelectiveUpdate} from 'xtal-element/types.d.js';
import {conditionalImport} from 'xtal-sip/conditionalImport.js';
import {define, AttributeProps, mergeProps, RenderContext} from 'xtal-element/xtal-latx.js';
import {createTemplate} from 'trans-render/createTemplate.js';
import {templStampSym} from 'trans-render/plugins/templStamp.js';

const mainTemplate = createTemplate(/* html */`
  <style>
      :host{
          display:block;
      }
  </style>
  <main>
    <xtal-editor key=root part=xtalEditor></xtal-editor>
  </main>
`);

const uiRefs = {
    label: Symbol('label'),
    xtalEditor: Symbol('xtalEditor')
}

const initTransform = ({self}: SwagTagJsonEditor) => ({
    ':host': [templStampSym, uiRefs],
    '"': ({target}: RenderContext<SwagTagJsonEditor>) => {
        conditionalImport(target as any as HTMLElement, {
            'xtal-editor':[
                [
                    'xtal-editor/src/xtal-editor.js',
                    () => import('xtal-editor/src/xtal-editor.js'),
                    ({path}) => `//unpkg.com/${path}?module`,,
                ]
            ]
        });
    },
    [uiRefs.xtalEditor]: [{}, {'parsed-object-changed': self.handleChange}]
    
})

const updateLabel = ({name}: SwagTagJsonEditor) => ({
    [uiRefs.xtalEditor]: [{key: name}]
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