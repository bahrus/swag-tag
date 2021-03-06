import {XtalElement, AttributeProps, define} from 'xtal-element/XtalElement.js';
import {SelectiveUpdate} from 'xtal-element/types.d.js';
import {createTemplate} from 'trans-render/createTemplate.js';

const mainTemplate = createTemplate(/* html */`
  <style>
      :host{
          display:block;
      }
      label{
          display:block;
      }
  </style>
  <label for=myInput part=label></label>
  <input id=myInput part=input>
`);

const [label$, input$] = [Symbol('label'), Symbol('input')];
const initTransform  = ({self}: SwagTagPrimitiveBase) => ({
    label: label$,
    input: [{},{input: self.handleInput},,,input$]
});

const updateLabel = ({name}: SwagTagPrimitiveBase) => ({
    [label$]: name + ':',
});



const updateInput = ({readOnly, inputType, disabled, value}: SwagTagPrimitiveBase) =>({
    [input$]: [{},,{'readonly': readOnly, type: inputType, disabled: disabled, value: value}]
});

const updateTransforms = [
    updateLabel, updateInput
]  as SelectiveUpdate<any>[];


export const linkInputType = ({type, self}: SwagTagPrimitiveBase) => {
    switch(type){
        case 'boolean':
            self.inputType = 'checkbox';
            break;
        case 'number':
            self.inputType = 'number';
            break;
        case 'string':
            self.inputType = 'text';
            break;
    }
}

export const linkEditedValue = ({value, self}: SwagTagPrimitiveBase) => {
    self.editedValue = value;
}

export class SwagTagPrimitiveBase extends XtalElement {

    constructor(){
        super();
        this.eventScopes = [[,'bubbles']];
    }

    static is = 'swag-tag-primitive-base';

    static attributeProps : any = ({readOnly, type, testValues, value, disabled, eventScopes, name, description, inputType, editedValue}: SwagTagPrimitiveBase) => ({
        bool: [readOnly, disabled],
        async: [readOnly, inputType, disabled, value],
        str: [type, value, name, description, inputType, editedValue],
        notify: [editedValue],
        obj: ['default', testValues, eventScopes],
        jsonProp: [eventScopes],
        reflect: [readOnly, type, disabled, name, inputType]
    } as AttributeProps);

    handleInput(e: Event){
        this.editedValue = (<any>e.target!).value;
    }

    readyToInit = true;

    mainTemplate = mainTemplate;

    readyToRender = true;

    initTransform: any = initTransform;

    editedValue: any;

    propActions = [
        linkInputType, linkEditedValue
    ];

    updateTransforms = updateTransforms;

    name: string | undefined;
    description: string | undefined;
    inputType: 'text' | 'checkbox' | 'number' | undefined; 
    type: 'string' | 'boolean' | 'number' | undefined;
    readOnly!: boolean;
    value: any | undefined;
   /**
   * key = test name
   * val = test prop value
   */
   testValues: { [key: string]: any } | undefined;

}
define(SwagTagPrimitiveBase);