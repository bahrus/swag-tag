import { symbolize } from 'xtal-element/symbolize.js';
import { createTemplate as T } from "trans-render/createTemplate.js";
import { XtalFetchViewElement, define, mergeProps } from "xtal-element/XtalFetchViewElement.js";
import { PD } from "p-et-alia/p-d.js";
import { SwagTagPrimitiveBase } from './swag-tag-primitive-base.js';
import { SwagTagObjectBase } from './swag-tag-object-base.js';
import('@power-elements/json-viewer/json-viewer.js');
const symbolGen = ({ editName, fieldset, summary, editingName, schemaName, eventListeners, tagInfoViewer }) => 0;
export const uiRefs = symbolize(symbolGen);
const mainTemplate = T(/* html */ `
<style id=collapsibleForm>
  legend{
    cursor: pointer;
  }
  fieldset[data-open="false"] [role="textbox"]{
    display: none;
  }
  fieldset[data-open="true"]{
    height: 500px;
    overflow-y:auto;
  }
</style>
<header>
  <details>
    <summary><var></var> schema</summary>
    
  </details>
</header>
<form>
  <fieldset data-open="false">
    <legend>✏️Edit <var></var>'s properties</legend>
  </fieldset>
</form>
<details open>
  <summary></summary>
  <var>
    <div></div>
  </var>
</details>
<h4>Live Events Fired</h4>
<json-viewer -object allowlist="detail,type,bubbles,cancelBubble,cancelable,composed,defaultPrevented,eventPhase,isTrusted,returnValue,timeStamp"></json-viewer>
<aside>
  <details>
    <summary>View Schema</summary>
    <json-viewer allowlist="name,properties,attributes,slots,events"></json-viewer>
  </details>
</aside>
`);
const eventListener = T(/* html */ `
<p-d m=1 from=details to=json-viewer[-object] val=. skip-init></p-d>
`);
const initTransform = ({ self }) => ({
    header: {
        details: {
            summary: {
                var: uiRefs.schemaName
            },
        },
    },
    form: {
        fieldset: uiRefs.fieldset,
        '"': {
            legend: [, { click: self.toggleForm }, , {
                    var: uiRefs.editName
                }]
        },
    },
    details: {
        summary: uiRefs.summary,
        var: uiRefs.editingName,
        '"': {
            div: uiRefs.eventListeners
        }
    },
    aside: {
        details: {
            'json-viewer': uiRefs.tagInfoViewer
        }
    }
});
export const bindName = ({ name }) => ({
    [uiRefs.summary]: name,
    [uiRefs.editName]: name,
    [uiRefs.schemaName]: name,
    [uiRefs.editingName]: [name, 'afterBegin'],
});
export const addEventListeners = ({ events, name }) => ({
    [uiRefs.eventListeners]: [events || [], eventListener, , {
            [PD.is]: ({ item }) => [{ observe: name, on: item.name }]
        }]
});
export const addEditors = ({ massagedProps, name }) => ({
    [uiRefs.fieldset]: [massagedProps, ({ item }) => item.editor, , {
            [SwagTagPrimitiveBase.is]: ({ item, target }) => {
                Object.assign(target, item);
                target.setAttribute('role', 'textbox');
            },
            '"': ({ item }) => ([PD.is, 'afterEnd', [{ on: 'edited-value-changed', from: 'form', to: 'details', careOf: name, prop: item.name, val: 'target.editedValue', m: 1 }]]),
            [SwagTagObjectBase.is]: ({ item, target }) => {
                Object.assign(target, item);
                target.setAttribute('role', 'textbox');
            },
            '""': ({ item }) => ([PD.is, 'afterEnd', [{ on: 'parsed-object-changed', from: 'form', to: 'details', careOf: name, prop: item.name, val: 'target.parsedObject', m: 1 }]])
        }]
});
export const bindSelf = ({ attribs, self }) => ({
    [uiRefs.tagInfoViewer]: [{ object: self }]
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
    if (defaultVal !== undefined) {
        try {
            defaultVal = JSON.parse(defaultVal);
        }
        catch (e) { }
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
export const linkMassagedProps = ({ properties, self }) => {
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
    self.massagedProps = properties;
};
export const triggerImportReferencedModule = ({ path, self }) => {
    if (path !== undefined) {
        self.importReferencedModule();
    }
};
const pdxEvent = 'event';
export const noPathFound$ = Symbol();
export const noPathFoundTemplate = 'noPathFoundTemplate';
export class SwagTagBase extends XtalFetchViewElement {
    constructor() {
        super(...arguments);
        this.noShadow = true;
        this.mainTemplate = mainTemplate;
        this.readyToRender = true;
        this.propActions = [
            linkWcInfo, linkMassagedProps, triggerImportReferencedModule
        ];
        this.initTransform = initTransform;
        this.updateTransforms = updateTransforms;
    }
    toggleForm(e) {
        const fieldset = e.target.closest('fieldset');
        const currentVal = fieldset.dataset.open;
        fieldset.dataset.open = currentVal === 'true' ? 'false' : 'true';
    }
    get [noPathFoundTemplate]() {
        return T(`<div>No path found.</div>`, SwagTagBase, noPathFound$);
    }
    importReferencedModule() {
        if (this.href.indexOf('//') > -1 && this.href.indexOf('//') < 7) {
            const selfResolvingModuleSplitPath = this.href.split('/');
            selfResolvingModuleSplitPath.pop();
            const selfResolvingModulePath = selfResolvingModuleSplitPath.join('/') + this.path.substring(1) + '?module';
            import(selfResolvingModulePath);
        }
        else {
            const splitPath = (location.origin + location.pathname).split('/');
            splitPath.pop();
            let path = this.path;
            while (path.startsWith('../')) {
                splitPath.pop();
                path = path.substr(3);
            }
            const importPath = splitPath.join('/') + '/' + path;
            import(importPath);
        }
    }
}
SwagTagBase.is = "swag-tag-base";
SwagTagBase.attributeProps = ({ tag, name, properties, path, events, slots, testCaseNames, attribs }) => {
    const ap = {
        str: [tag, name, path],
        obj: [properties, events, slots, testCaseNames, attribs],
        reflect: [tag]
    };
    return mergeProps(ap, XtalFetchViewElement.props);
};
define(SwagTagBase);
