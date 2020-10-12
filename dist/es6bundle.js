import { more } from 'trans-render/transform.js';
import { templStampSym as templStampSym$1 } from 'trans-render/standardPlugins.js';
import { createTemplate } from 'trans-render/createTemplate.js';
import { p, symbolize, XtalFetchViewElement, mergeProps, define as define$3 } from 'xtal-element/XtalFetchViewElement.js';
import { PD } from 'p-et-alia/p-d.js';
import { define, XtalElement } from 'xtal-element/XtalElement.js';
import { define as define$1, XtalElement as XtalElement$1 } from 'xtal-element/XtalElement';
import { define as define$2 } from 'xtal-element/xtal-latx.js';
import 'xtal-editor/src/xtal-editor-base-primitive.js';
import { templStampSym } from 'trans-render/plugins/templStamp.js';

const mainTemplate = createTemplate(/* html */ `
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
const initTransform = ({ self }) => ({
    label: label$,
    input: [{}, { input: self.handleInput }, , , input$]
});
const updateLabel = ({ name }) => ({
    [label$]: name + ':',
});
const updateInput = ({ readOnly, inputType, disabled, value }) => ({
    [input$]: [{}, , { 'readonly': readOnly, type: inputType, disabled: disabled, value: value }]
});
const updateTransforms = [
    updateLabel, updateInput
];
const linkInputType = ({ type, self }) => {
    switch (type) {
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
};
const linkEditedValue = ({ value, self }) => {
    self.editedValue = value;
};
class SwagTagPrimitiveBase extends XtalElement {
    constructor() {
        super();
        this.readyToInit = true;
        this.mainTemplate = mainTemplate;
        this.readyToRender = true;
        this.initTransform = initTransform;
        this.propActions = [
            linkInputType, linkEditedValue
        ];
        this.updateTransforms = updateTransforms;
        this.eventScopes = [[, 'bubbles']];
    }
    handleInput(e) {
        this.editedValue = e.target.value;
    }
}
SwagTagPrimitiveBase.is = 'swag-tag-primitive-base';
SwagTagPrimitiveBase.attributeProps = ({ readOnly, type, testValues, value, disabled, eventScopes, name, description, inputType, editedValue }) => ({
    bool: [readOnly, disabled],
    async: [readOnly, inputType, disabled, value],
    str: [type, value, name, description, inputType, editedValue],
    notify: [editedValue],
    obj: ['default', testValues, eventScopes],
    jsonProp: [eventScopes],
    reflect: [readOnly, type, disabled, name, inputType]
});
define(SwagTagPrimitiveBase);

import('@power-elements/json-viewer/json-viewer.js');
const mainTemplate$1 = createTemplate(/* html */ `
<style>
details{
    max-height: 300px;
    overflow-y:auto;
}
</style>
<details open>
    <summary>Event History</summary>
    <json-viewer -object></json-viewer>
</details>
`);
const jsonViewer = Symbol('json-viewer');
const details = Symbol('details');
const initTransform$1 = {
    details: {
        'json-viewer': jsonViewer
    },
    '"': [{ style: { display: 'none' } }, , , , details]
};
const allowList = ['detail', 'type', 'bubbles', 'cancelBubble', 'cancelable', 'composed', 'defaultPrevented', 'eventPhase', 'isTruted', 'returnValue', 'timeStamp'];
const appendToEventArchive = ({ newEvent, self }) => {
    if (newEvent === undefined)
        return;
    const safeEvent = {};
    allowList.forEach(prop => {
        safeEvent[prop] = newEvent[prop];
    });
    if (self.eventArchive === undefined) {
        self.eventArchive = {
            eventHistory: []
        };
    }
    self.eventArchive.eventHistory.unshift(safeEvent);
    self.eventArchive = self.eventArchive;
};
const bindJsonViewer = ({ eventArchive }) => ({
    [jsonViewer]: [{ object: eventArchive }],
    [details]: [{ style: { display: 'block' } }]
});
const updateTransforms$1 = [bindJsonViewer];
class JsonEventViewer extends XtalElement$1 {
    constructor() {
        super(...arguments);
        this.readyToInit = true;
        this.mainTemplate = mainTemplate$1;
        this.readyToRender = true;
        this.initTransform = initTransform$1;
        this.propActions = [appendToEventArchive];
        this.updateTransforms = updateTransforms$1;
    }
}
JsonEventViewer.is = 'json-event-viewer';
JsonEventViewer.attributeProps = ({ newEvent, eventArchive }) => ({
    obj: [newEvent, eventArchive]
});
define$1(JsonEventViewer);

const mainTemplate$2 = createTemplate(/* html */ `
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
};
const initTransform$2 = ({ self, handleChange }) => ({
    ':host': [templStampSym, uiRefs],
    [uiRefs.xtalEditor]: [{}, { 'parsed-object-changed': handleChange }]
});
const updateLabel$1 = ({ name }) => ({
    [uiRefs.label]: [{ textContent: name + ':' }]
});
const updateJsonEditor = ({ value, name }) => ({
    [uiRefs.xtalEditor]: [{ value: value }]
});
const linkParsedObject = ({ value, self }) => {
    try {
        const parsed = JSON.parse(value);
        self.parsedObject = parsed;
    }
    catch (e) { }
};
const propActions = [linkParsedObject, linkInputType];
class SwagTagJsonEditor extends SwagTagPrimitiveBase {
    constructor() {
        super(...arguments);
        this.propActions = propActions;
        this.mainTemplate = mainTemplate$2;
        this.initTransform = initTransform$2;
        this.updateTransforms = [
            updateLabel$1, updateJsonEditor
        ];
    }
    handleChange(e) {
        this.parsedObject = e.target.parsedObject;
    }
}
SwagTagJsonEditor.is = 'swag-tag-json-editor';
SwagTagJsonEditor.attributeProps = ({ parsedObject }) => ({
    obj: [parsedObject],
    notify: [parsedObject]
});
define$2(SwagTagJsonEditor);

//#region Templates 
//Very little top level styling used, so consumers can take the first crack at styling.
//So make what little styling there is  guaranteed to not affect anything else via guid.
const mainTemplate$3 = createTemplate(/* html */ `
<style id=0f0d62e5-0d00-4e70-ad90-277fcd94c963>
  fieldset[data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963"]>legend{
    cursor: pointer;
  }
  fieldset[data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963"][data-open="false"]>[part="scrollableArea"]{
    display: none;
  }
  fieldset[data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963"][data-open="true"]>[part="scrollableArea"]{
    max-height: 500px;
    overflow-y:auto;
    display:flex;
    flex-direction: column;
  }
</style>
<main>
<!-- pass down edited values / parsed objects to demo component -->
<p-d on=edited-value-changed to=section -care-of val=target.editedValue prop-from-event=target.name m=1 skip-init></p-d>
<p-d on=parsed-object-changed to=section -care-of val=target.parsedObject prop-from-event=target.name m=1 skip-init></p-d>
<header part=header>
</header>
<section part=section>
  <div part=componentHolder>
    <div part=componentListeners></div>
  </div>
</section>
<json-event-viewer -new-event part=jsonEventViewer></json-event-viewer>
<form part=propsEditor>
  <fieldset data-open="true" data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963" part=fieldset>
    <legend part=legend><span part=action>Edit</span> <var part=componentName></var>'s properties</legend>
    <div part=scrollableArea>
    </div>
  </fieldset>
</form>

<details part=viewSchema>
  <summary>View Schema</summary>
  <json-viewer part=jsonViewer allowlist="name,properties,attributes,slots,events"></json-viewer>
</details>

</main>
`);
const eventListenerForJsonViewer = T(/* html */ `
<p-d from=section to=${JsonEventViewer.is}[-new-event] val=. skip-init m=1></p-d>
`);
//#endregion
//#region Transforms
const uiRefs$1 = {
    componentName: p, header: p, componentHolder: p, componentListeners: p, jsonViewer: p,
    fieldset: p, scrollableArea: p, legend: p
};
symbolize(uiRefs$1);
const initTransform$3 = ({ self, tag }) => ({
    ':host': [templStampSym$1, uiRefs$1],
    [uiRefs$1.legend]: [{}, { click: self.toggleForm }],
    main: {
        '[-care-of]': tag,
    }
});
const bindName = ({ name, innerTemplate }) => ({
    [uiRefs$1.header]: `<${name}>`,
    [uiRefs$1.componentName]: name,
    [uiRefs$1.componentHolder]: [name, 'afterBegin'],
    [more]: {
        [uiRefs$1.componentHolder]: {
            [name]: ({ target }) => {
                if (innerTemplate !== undefined) {
                    target.appendChild(innerTemplate.content.cloneNode(true));
                }
            }
        }
    }
});
const addEventListeners = ({ events, name }) => ({
    [uiRefs$1.componentListeners]: [events || [], eventListenerForJsonViewer, , {
            [PD.is]: ({ item }) => [{ observe: name, on: item.name }]
        }]
});
const copyPropInfoIntoEditor = ({ item, target }) => {
    Object.assign(target, item);
    target.setAttribute('role', 'textbox');
};
const copyPropInfoIntoEditors = {
    [`${SwagTagPrimitiveBase.is},${SwagTagJsonEditor.is}`]: copyPropInfoIntoEditor,
};
const addEditors = ({ massagedProps, name }) => ({
    // Loop over massagedProps, and insert dynamic editor via tag name (item.editor is the tag name)
    [uiRefs$1.scrollableArea]: [
        //Array to loop over
        massagedProps || [],
        //A **toTagOrTemplate** function that returns a string -- used to generate a (custom element) with the name of the string. 
        ({ item }) => item.editor,
        //range could go here
        ,
        //now that document.createElement(tag) done, apply transform
        copyPropInfoIntoEditors
    ]
});
const bindSelf = ({ attribs, self }) => ({
    [uiRefs$1.jsonViewer]: [{ object: self }]
});
const updateTransforms$2 = [
    bindName,
    addEventListeners,
    addEditors,
    bindSelf
];
//#endregion
//#region propActions
const linkWcInfo = ({ viewModel, tag, self }) => {
    if (tag === undefined || viewModel === undefined)
        return;
    const wcInfo = viewModel.tags.find(t => t.name === tag);
    wcInfo.attribs = wcInfo.attributes;
    delete wcInfo.attributes;
    Object.assign(self, wcInfo);
};
function adjustValueAndType(prop) {
    let defaultVal = prop.default;
    let parsedType = undefined;
    if (defaultVal !== undefined) {
        try {
            defaultVal = JSON.parse(defaultVal);
            parsedType = JSON.parse('[' + prop.type.replace(/\|/g, ',') + ']');
        }
        catch (e) { }
        if (Array.isArray(parsedType)) {
            prop.value = defaultVal;
            prop.type = 'stringArray';
            prop.options = parsedType;
            return;
        }
        switch (typeof defaultVal) {
            case 'object':
                prop.value = prop.default;
                prop.type = 'object';
                break;
            case 'string':
                prop.value = defaultVal;
                prop.type = 'string';
                break;
            case 'number':
                prop.value = defaultVal;
                prop.type = 'number';
                break;
            case 'boolean':
                prop.value = defaultVal;
                prop.type = 'boolean';
                break;
            default:
                prop.value = prop.default;
                prop.type = 'object';
        }
    }
    else {
        switch (prop.type) {
            case 'string':
            case 'boolean':
            case 'number':
                break;
            default:
                prop.type = 'object';
        }
    }
}
const massaged = Symbol();
const linkMassagedProps = ({ properties, self, block }) => {
    if (properties === undefined || properties[massaged])
        return;
    properties.forEach(prop => {
        adjustValueAndType(prop);
        const anyProp = prop;
        switch (prop.type) {
            case 'string':
            case 'number':
            case 'boolean':
                anyProp.editor = SwagTagPrimitiveBase.is;
                break;
            case 'object':
                anyProp.editor = SwagTagJsonEditor.is;
                break;
            default:
                throw 'not implemented';
        }
    });
    properties[massaged] = true;
    self.massagedProps = block !== undefined ? properties.filter(prop => !block.includes(prop.name)) : properties;
};
const linkInnerTemplate = ({ useInnerTemplate, self }) => {
    if (!useInnerTemplate)
        return;
    const innerTemplate = self.querySelector('template');
    if (innerTemplate === null) {
        setTimeout(() => {
            linkInnerTemplate(self);
        }, 50);
        return;
    }
    self.innerTemplate = innerTemplate;
};
const triggerImportReferencedModule = ({ path, self, skipImports }) => {
    if (path !== undefined && !skipImports) {
        if (self.href.indexOf('//') > -1 && self.href.indexOf('//') < 7) {
            const selfResolvingModuleSplitPath = self.href.split('/');
            selfResolvingModuleSplitPath.pop();
            const selfResolvingModulePath = selfResolvingModuleSplitPath.join('/') + self.path.substring(1) + '?module';
            import(selfResolvingModulePath);
        }
        else {
            const splitPath = (location.origin + location.pathname).split('/');
            splitPath.pop();
            let path = self.path;
            while (path.startsWith('../')) {
                splitPath.pop();
                path = path.substr(3);
            }
            const importPath = splitPath.join('/') + '/' + path;
            import(importPath);
        }
    }
};
const showHideEditor = ({ editOpen, self }) => {
    self[uiRefs$1.fieldset].dataset.open = (editOpen || false).toString();
};
//#endregion
/**
 * @csspart header
 * @csspart section
 * @csspart componentHolder
 * @csspart componentListeners
 * @csspart jsonEventViewer
 * @csspart propsEditor
 * @csspart fieldset
 * @csspart action
 * @csspart componentName
 * @csspart scrollableArea
 * @csspart viewSchema
 * @csspart jsonViewer
 */
class SwagTag extends XtalFetchViewElement {
    constructor() {
        super(...arguments);
        /**
         * @private
         */
        this.noShadow = true;
        this.mainTemplate = mainTemplate$3;
        this.readyToRender = true;
        this.propActions = [
            linkWcInfo, linkMassagedProps, triggerImportReferencedModule, showHideEditor, linkInnerTemplate
        ];
        this.initTransform = initTransform$3;
        this.updateTransforms = updateTransforms$2;
        /**
         * If test page contains needed imports, skip any imports contained in test script.
         * @attr skip-imports
         */
        this.skipImports = false;
    }
    toggleForm(e) {
        this.editOpen = !this.editOpen;
    }
}
SwagTag.is = "swag-tag";
SwagTag.attributeProps = ({ tag, name, properties, path, events, slots, testCaseNames, attribs, editOpen, block, useInnerTemplate, innerTemplate, skipImports }) => {
    const ap = {
        str: [tag, name, path],
        bool: [editOpen, useInnerTemplate, skipImports],
        obj: [properties, events, slots, testCaseNames, attribs, block, innerTemplate],
        jsonProp: [block],
        reflect: [tag, editOpen]
    };
    return mergeProps(ap, XtalFetchViewElement.props);
};
define$3(SwagTag);

export { SwagTag, addEditors, addEventListeners, adjustValueAndType, bindName, bindSelf, copyPropInfoIntoEditor, linkInnerTemplate, linkMassagedProps, linkWcInfo, showHideEditor, triggerImportReferencedModule, uiRefs$1 as uiRefs };
