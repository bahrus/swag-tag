import { more } from 'trans-render/transform.js';
import { createTemplate as T } from "trans-render/createTemplate.js";
import { XtalFetchViewElement, define, mergeProps, p, symbolize } from "xtal-element/XtalFetchViewElement.js";
import { PD } from "p-et-alia/p-d.js";
import { SwagTagPrimitiveBase } from './swag-tag-primitive-base.js';
import { SwagTagObjectBase } from './swag-tag-object-base.js';
import { JsonEventViewer } from './json-event-viewer.js';
//#region Templates 
//Very little top level styling used, so consumers can take the first crack at styling.
//So make what little styling there is  guaranteed to not affect anything else via guid.
const mainTemplate = T(/* html */ `
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
<json-event-viewer -new-event></json-event-viewer>
<form>
  <fieldset data-open="true" data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963" part=fieldset>
    <legend>✏️Edit <var></var>'s properties</legend>
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
export const uiRefs = {
    fflVar: p, header: p, componentHolder: p, componentListenersForJsonViewer: p, adJsonViewer: p,
    fieldset: p, scrollableArea: p
};
symbolize(uiRefs);
const initTransform = ({ self, tag }) => ({
    main: {
        '[-care-of]': tag,
        header: uiRefs.header,
        section: {
            componentHolderPart: uiRefs.componentHolder,
            '"': {
                componentListenersPart: uiRefs.componentListenersForJsonViewer
            }
        },
        form: {
            fieldset: {
                legend: [{}, { click: self.toggleForm }, , {
                        var: uiRefs.fflVar
                    }],
                scrollableAreaPart: uiRefs.scrollableArea
            },
            '"': uiRefs.fieldset
        },
        viewSchemaPart: {
            jsonViewerPart: uiRefs.adJsonViewer
        }
    }
});
export const bindName = ({ name, innerTemplate }) => ({
    [uiRefs.header]: `<${name}>`,
    [uiRefs.fflVar]: name,
    [uiRefs.componentHolder]: [name, 'afterBegin'],
    [more]: {
        [uiRefs.componentHolder]: {
            [name]: ({ target }) => {
                if (innerTemplate !== undefined) {
                    target.appendChild(innerTemplate.content.cloneNode(true));
                }
            }
        }
    }
});
export const addEventListeners = ({ events, name }) => ({
    [uiRefs.componentListenersForJsonViewer]: [events || [], eventListenerForJsonViewer, , {
            [PD.is]: ({ item }) => [{ observe: name, on: item.name }]
        }]
});
export const copyPropInfoIntoEditor = ({ item, target }) => {
    Object.assign(target, item);
    target.setAttribute('role', 'textbox');
};
const copyPropInfoIntoEditors = {
    [`${SwagTagPrimitiveBase.is},${SwagTagObjectBase.is}`]: copyPropInfoIntoEditor,
};
export const addEditors = ({ massagedProps, name }) => ({
    // Loop over massagedProps, and insert dynamic editor via tag name (item.editor is the tag name)
    [uiRefs.scrollableArea]: [
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
export const bindSelf = ({ attribs, self }) => ({
    [uiRefs.adJsonViewer]: [{ object: self }]
});
const updateTransforms = [
    bindName,
    addEventListeners,
    addEditors,
    bindSelf
];
//#endregion
//#region propActions
export const linkWcInfo = ({ viewModel, tag, self }) => {
    if (tag === undefined || viewModel === undefined)
        return;
    const wcInfo = viewModel.tags.find(t => t.name === tag);
    wcInfo.attribs = wcInfo.attributes;
    delete wcInfo.attributes;
    Object.assign(self, wcInfo);
};
export function adjustValueAndType(prop) {
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
export const linkMassagedProps = ({ properties, self, block }) => {
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
                anyProp.editor = SwagTagObjectBase.is;
                break;
            default:
                throw 'not implemented';
        }
    });
    properties[massaged] = true;
    self.massagedProps = block !== undefined ? properties.filter(prop => !block.includes(prop.name)) : properties;
};
export const linkInnerTemplate = ({ useInnerTemplate, self }) => {
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
export const triggerImportReferencedModule = ({ path, self }) => {
    if (path !== undefined) {
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
export const showHideEditor = ({ editOpen, self }) => {
    self[uiRefs.fieldset].dataset.open = (editOpen || false).toString();
};
const propActions = [
    linkWcInfo, linkMassagedProps, triggerImportReferencedModule, showHideEditor, linkInnerTemplate
];
//#endregion
export class SwagTagBase extends XtalFetchViewElement {
    constructor() {
        super(...arguments);
        this.noShadow = true;
        this.mainTemplate = mainTemplate;
        this.readyToRender = true;
        this.propActions = [
            linkWcInfo, linkMassagedProps, triggerImportReferencedModule, showHideEditor, linkInnerTemplate
        ];
        this.initTransform = initTransform;
        this.updateTransforms = updateTransforms;
    }
    toggleForm(e) {
        this.editOpen = !this.editOpen;
    }
}
SwagTagBase.is = "swag-tag-base";
SwagTagBase.attributeProps = ({ tag, name, properties, path, events, slots, testCaseNames, attribs, editOpen, block, useInnerTemplate, innerTemplate }) => {
    const ap = {
        str: [tag, name, path],
        bool: [editOpen, useInnerTemplate],
        obj: [properties, events, slots, testCaseNames, attribs, block, innerTemplate],
        jsonProp: [block],
        reflect: [tag, editOpen]
    };
    return mergeProps(ap, XtalFetchViewElement.props);
};
define(SwagTagBase);
