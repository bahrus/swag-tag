import { createTemplate as T } from "trans-render/createTemplate.js";
import { XtalFetchViewElement, define, mergeProps, p, symbolize } from "xtal-element/XtalFetchViewElement.js";
import { PD } from "p-et-alia/p-d.js";
import { SwagTagPrimitiveBase } from './swag-tag-primitive-base.js';
import { SwagTagObjectBase } from './swag-tag-object-base.js';
import { JsonEventViewer } from './json-event-viewer.js';
//import('@power-elements/json-viewer/json-viewer.js');
//Very little top level styling used, so consumers can take the first crack at styling.
//So make what little styling there is  guaranteed to not affect anything else via guid.
const mainTemplate = T(/* html */ `
<style id=0f0d62e5-0d00-4e70-ad90-277fcd94c963>
  fieldset[data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963"]>legend{
    cursor: pointer;
  }
  fieldset[data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963"][data-open="false"] [role]{
    display: none;
  }
  fieldset[data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963"][data-open="true"]{
    max-height: 500px;
    overflow-y:auto;
  }
</style>
<main>
<!-- pass down edited values / parsed objects to demo component -->
<p-d on=edited-value-changed to=section -care-of val=target.editedValue prop-from-event=target.name m=1 skip-init></p-d>
<p-d on=parsed-object-changed to=section -care-of val=target.parsedObject prop-from-event=target.name m=1 skip-init></p-d>
<header>
</header>
<section>
  <component--holder>
    <component--listeners></component--listeners>
  </component--holder>
</section>
<json-event-viewer -new-event></json-event-viewer>
<!-- <events--viewer>
  <details open>
    <summary>Live Events</summary>
    <json-viewer -object allowlist="detail,type,bubbles,cancelBubble,cancelable,composed,defaultPrevented,eventPhase,isTrusted,returnValue,timeStamp"></json-viewer>
  </details>
</events--viewer> -->
<form>
  <fieldset data-open="true" data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963">
    <legend>✏️Edit <var></var>'s properties</legend>
  </fieldset>
</form>


<aside>
  <details>
    <summary>View Schema</summary>
    <json-viewer allowlist="name,properties,attributes,slots,events"></json-viewer>
  </details>
</aside>
</main>
`);
const eventListenerForJsonViewer = T(/* html */ `
<p-d from=section to=${JsonEventViewer.is}[-new-event] val=. skip-init m=1></p-d>
`);
export const uiRefs = { fflVar: p, header: p, dComponentHolder: p, dchComponentListenersForJsonViewer: p, adJsonViewer: p, fFieldset: p, };
symbolize(uiRefs);
const initTransform = ({ self, tag }) => ({
    main: {
        '[-care-of]': tag,
        header: uiRefs.header,
        section: {
            'component--holder': uiRefs.dComponentHolder,
            '"': {
                'component--listeners': uiRefs.dchComponentListenersForJsonViewer
            }
        },
        form: {
            fieldset: uiRefs.fFieldset,
            '"': {
                legend: [, { click: self.toggleForm }, , {
                        var: uiRefs.fflVar
                    }]
            },
        },
        aside: {
            details: {
                'json-viewer': uiRefs.adJsonViewer
            }
        }
    }
});
export const bindName = ({ name }) => ({
    [uiRefs.header]: `<${name}>`,
    [uiRefs.fflVar]: name,
    [uiRefs.dComponentHolder]: [name, 'afterBegin'],
});
export const addEventListeners = ({ events, name }) => ({
    [uiRefs.dchComponentListenersForJsonViewer]: [events || [], eventListenerForJsonViewer, , {
            [PD.is]: ({ item }) => [{ observe: name, on: item.name }]
        }]
});
export const addEditors = ({ massagedProps, name }) => ({
    // Loop over massagedProps, and insert dynamic editor via tag name (item.editor is the tag name)
    [uiRefs.fFieldset]: [massagedProps, ({ item }) => item.editor, , {
            [`${SwagTagPrimitiveBase.is},${SwagTagObjectBase.is}`]: ({ item, target }) => {
                Object.assign(target, item);
                target.setAttribute('role', 'textbox');
            },
        }]
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
    self[uiRefs.fFieldset].dataset.open = (editOpen || false).toString();
};
export class SwagTagBase extends XtalFetchViewElement {
    constructor() {
        super(...arguments);
        this.noShadow = true;
        this.mainTemplate = mainTemplate;
        this.readyToRender = true;
        this.propActions = [
            linkWcInfo, linkMassagedProps, triggerImportReferencedModule, showHideEditor
        ];
        this.initTransform = initTransform;
        this.updateTransforms = updateTransforms;
    }
    toggleForm(e) {
        this.editOpen = !this.editOpen;
    }
}
SwagTagBase.is = "swag-tag-base";
SwagTagBase.attributeProps = ({ tag, name, properties, path, events, slots, testCaseNames, attribs, editOpen, block }) => {
    const ap = {
        str: [tag, name, path],
        bool: [editOpen],
        obj: [properties, events, slots, testCaseNames, attribs, block],
        jsonProp: [block],
        reflect: [tag, editOpen]
    };
    return mergeProps(ap, XtalFetchViewElement.props);
};
define(SwagTagBase);
