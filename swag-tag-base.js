import { symbolize } from 'xtal-element/symbolize.js';
import { createTemplate as T } from "trans-render/createTemplate.js";
import { XtalFetchViewElement, define, mergeProps } from "xtal-element/XtalFetchViewElement.js";
import { PD } from "p-et-alia/p-d.js";
import { SwagTagPrimitiveBase } from './swag-tag-primitive-base.js';
import { SwagTagObjectBase } from './swag-tag-object-base.js';
const mainTemplate = T(/* html */ `
<style id=collapsibleForm>
  legend{
    cursor: pointer;
  }
  fieldset[data-open="false"] ${SwagTagPrimitiveBase.is}, fieldset[data-open="false"] ${SwagTagObjectBase.is} {
    display: none;
  }
</style>
<header>
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
<dfn -text-content></dfn>
<json-viewer -data></json-viewer>
<main></main>
<footer></footer>
`);
const eventListener = T(/* html */ `
<p-d m=1 from=details to=json-viewer[-data] val=detail></p-d>
<p-d m=1 from=details to=dfn[-text-content] val=type></p-d>
`);
const symbolGen = ({ editName, fieldset, summary, xtalJsonEditor, var$, eventListeners$ }) => 0;
const uiRefs = symbolize(symbolGen);
const updateTransforms = [
    ({ name }) => ({
        [uiRefs.summary]: name,
        [uiRefs.editName]: name,
        [uiRefs.var$]: [name, 'afterBegin'],
    }),
    ({ events, name }) => ({
        [uiRefs.eventListeners$]: [events, eventListener, , {
                [PD.is]: ({ item }) => [{ observe: name, on: item.name }]
            }]
    }),
    ({ massagedProps, name }) => ({
        [uiRefs.fieldset]: [massagedProps, ({ item }) => item.editor, , {
                [SwagTagPrimitiveBase.is]: ({ item, target }) => {
                    Object.assign(target, item);
                },
                '"': ({ item }) => ([PD.is, 'afterEnd', [{ on: 'input', from: 'form', to: 'details', careOf: name, prop: item.name, val: 'target.value', m: 1 }]]),
                [SwagTagObjectBase.is]: ({ item, target }) => {
                    Object.assign(target, item);
                },
                '""': ({ item }) => ([PD.is, 'afterEnd', [{ on: 'parsed-object-changed', from: 'form', to: 'details', careOf: name, prop: item.name, val: 'target.parsedObject', m: 1 }]])
            }]
    })
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
export const linkMassagedProps = ({ properties, self }) => {
    if (properties === undefined || properties[massaged])
        return;
    properties.forEach(prop => {
        const anyProp = prop;
        prop.value = anyProp.default;
        switch (prop.type) {
            case 'string':
            case 'number':
            case 'boolean':
                anyProp.editor = SwagTagPrimitiveBase.is;
                break;
            default:
                anyProp.editor = SwagTagObjectBase.is;
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
export const propInfo$ = Symbol();
export const propBase$ = Symbol();
export const noPathFound$ = Symbol();
export const noPathFoundTemplate = 'noPathFoundTemplate';
export class SwagTagBase extends XtalFetchViewElement {
    constructor() {
        super();
        this.noShadow = true;
        this.mainTemplate = mainTemplate;
        this.readyToRender = true;
        this.propActions = [
            linkWcInfo, linkMassagedProps, triggerImportReferencedModule
        ];
        this.initTransform = {
            form: {
                fieldset: uiRefs.fieldset,
                '"': {
                    legend: [, { click: this.toggleForm }, , {
                            var: uiRefs.editName
                        }]
                },
            },
            details: {
                summary: uiRefs.summary,
                var: uiRefs.var$,
                '"': {
                    div: uiRefs.eventListeners$
                }
            },
        };
        this.updateTransforms = updateTransforms;
        import('@alenaksu/json-viewer/build/index.js');
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
        const selfResolvingModuleSplitPath = this.href?.split('/');
        selfResolvingModuleSplitPath?.pop();
        const selfResolvingModulePath = selfResolvingModuleSplitPath?.join('/') + this.path.substring(1) + '?module';
        import(selfResolvingModulePath);
    }
}
SwagTagBase.is = "swag-tag-base";
SwagTagBase.attributeProps = ({ tag, name, properties, path, events, slots, testCaseNames }) => {
    const ap = {
        str: [tag, name, path],
        obj: [properties, events, slots, testCaseNames],
        reflect: [tag]
    };
    return mergeProps(ap, XtalFetchViewElement.props);
};
define(SwagTagBase);
