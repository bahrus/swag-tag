import { createTemplate as T } from "trans-render/createTemplate.js";
import { XtalFetchViewElement, define, mergeProps, p, symbolize } from "xtal-element/XtalFetchViewElement.js";
import { PD } from "p-et-alia/p-d.js";
import { SwagTagPrimitiveBase } from './swag-tag-primitive-base.js';
import { SwagTagObjectBase } from './swag-tag-object-base.js';
import('@power-elements/json-viewer/json-viewer.js');
const mainTemplate = T(/* html */ `
<style id=collapsible>
  fieldset[data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963"]>legend{
    cursor: pointer;
  }
  fieldset[data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963"][data-open="false"] [role]{
    display: none;
  }
  fieldset[data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963"][data-open="true"]{
    height: 500px;
    overflow-y:auto;
  }
</style>
<main>
<!-- pass down edited values / parsed objects to demo component -->
<p-d on=edited-value-changed to=details -care-of val=target.editedValue prop-from-event=target.name m=1 skip-init></p-d>
<p-d on=parsed-object-changed to=details -care-of val=target.parsedObject prop-from-event=target.name m=1 skip-init></p-d>
<details open>
  <summary></summary>
  <component--holder>
    <component--listeners></component--listeners>
  </component--holder>
</details>
<form>
  <fieldset data-open="true" data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963">
    <legend>✏️Edit <var></var>'s properties</legend>
  </fieldset>
</form>

<h4>Live Events Fired</h4>
<json-viewer -object allowlist="detail,type,bubbles,cancelBubble,cancelable,composed,defaultPrevented,eventPhase,isTrusted,returnValue,timeStamp"></json-viewer>
<aside>
  <details>
    <summary>View Schema</summary>
    <json-viewer allowlist="name,properties,attributes,slots,events"></json-viewer>
  </details>
</aside>
</main>
`);
const eventListenerForJsonViewer = T(/* html */ `
<p-d from=details to=json-viewer[-object] val=. skip-init m=1></p-d>
`);
export const uiRefs = { fflVar: p, dSummary: p, dComponentHolder: p, dchComponentListenersForJsonViewer: p, adJsonViewer: p, fFieldset: p, };
symbolize(uiRefs);
const initTransform = ({ self, tag }) => ({
    main: {
        //'[-care-of]': tag,
        'p-d': [{ careOf: tag }],
        form: {
            fieldset: uiRefs.fFieldset,
            '"': {
                legend: [, { click: self.toggleForm }, , {
                        var: uiRefs.fflVar
                    }]
            },
        },
        details: {
            summary: uiRefs.dSummary,
            'component--holder': uiRefs.dComponentHolder,
            '"': {
                'component--listeners': uiRefs.dchComponentListenersForJsonViewer
            }
        },
        aside: {
            details: {
                'json-viewer': uiRefs.adJsonViewer
            }
        }
    }
});
export const bindName = ({ name }) => ({
    [uiRefs.dSummary]: name,
    [uiRefs.fflVar]: name,
    [uiRefs.dComponentHolder]: [name, 'afterBegin'],
});
export const addEventListeners = ({ events, name }) => ({
    [uiRefs.dchComponentListenersForJsonViewer]: [events || [], eventListenerForJsonViewer, , {
            [PD.is]: ({ item }) => [{ observe: name, on: item.name }]
        }]
});
export const addEditors = ({ massagedProps, name }) => ({
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
const massaged = Symbol();
export function tryParsed(prop) {
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
export const linkMassagedProps = ({ properties, self, block }) => {
    if (properties === undefined || properties[massaged])
        return;
    properties.forEach(prop => {
        tryParsed(prop);
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
