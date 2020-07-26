import {SwagTagPrimitiveBase, linkInputType} from './swag-tag-primitive-base.js';
import {SelectiveUpdate} from 'xtal-element/types.d.js';
import {define, AttributeProps, mergeProps} from 'xtal-element/xtal-latx.js';
import {createTemplate} from 'trans-render/createTemplate.js';

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
  <label for=myInput part=fieldLabel></label>
  <textarea id=myInput part=textarea></textarea>
`);


const [label$, textarea$] = [Symbol('label'), Symbol('textarea')];


const updateLabel = ({name}: SwagTagObjectBase) => ({
    [label$]: name + ':',
});
const updateTextArea = ({readOnly, inputType, disabled, value}: SwagTagPrimitiveBase) => ({
    [textarea$]: [{value: value || ''},,{'readonly': readOnly, type: inputType, disabled: disabled}]
});

const linkParsedObject = ({value, self}: SwagTagObjectBase) =>{
    try{
        const parsed = JSON.parse(value);
        self.parsedObject = parsed;
    }catch(e){}
}

export class SwagTagObjectBase extends SwagTagPrimitiveBase{
    static is = 'swag-tag-object-base';

    static attributeProps = ({parsedObject}: SwagTagObjectBase) =>{
        const ap = {
            obj: [parsedObject],
            notify: [parsedObject]
        } as AttributeProps;
        return mergeProps(ap, SwagTagPrimitiveBase.props);
    }

    propActions = [linkParsedObject, linkInputType] as SelectiveUpdate<any>[];

    mainTemplate = mainTemplate;
    initTransform: any = {
        label: label$,
        textarea: [,{'input': this.handleInput},,, textarea$]
    };

    handleInput(e: Event){
        try{
            const parsed = JSON.parse((<any>e.target!).value);
            this.parsedObject = parsed;
        }catch(e){}
    }

    updateTransforms = [
        updateLabel, updateTextArea
    ]  as SelectiveUpdate<any>[];

    parsedObject: any;
}
define(SwagTagObjectBase);