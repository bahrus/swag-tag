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
  <fieldset data-open="true">
    <legend>✏️Edit <var></var>'s properties</legend>
  </fieldset>
</form>
<details open>
  <summary></summary>
  <var></var>
</details>
<h4>Live Events Fired</h4>
<json-viewer></json-viewer>
<main></main>
<footer></footer>
`);
const symbolGen = ({ editName, fieldset, summary, xtalJsonEditor, var$ }) => 0;
const uiRefs = symbolize(symbolGen);
const updateTransforms = [
    ({ name }) => ({
        [uiRefs.summary]: name,
        [uiRefs.editName]: name,
        [uiRefs.var$]: [name]
    }),
    ({ massagedProps, name }) => ({
        [uiRefs.fieldset]: [massagedProps, ({ item }) => item.isPrimitive ? SwagTagPrimitiveBase.is : SwagTagObjectBase.is, , {
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
        prop.value = prop.default;
        switch (prop.type) {
            case 'string':
            case 'number':
            case 'boolean':
                prop.isPrimitive = true;
                break;
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
        this.propActions = [
            linkWcInfo, linkMassagedProps, triggerImportReferencedModule
        ];
        this.initTransform = {
            form: {
                fieldset: uiRefs.fieldset,
                '"': {
                    legend: [, { click: this.toggleForm }, , {
                            var: uiRefs.editName,
                        }]
                },
            },
            details: {
                summary: uiRefs.summary,
                var: uiRefs.var$
            },
        };
        this.updateTransforms = updateTransforms;
        import('@alenaksu/json-viewer/build/index.js');
    }
    //#region Required Methods / Properties
    get readyToRender() {
        if (this.name === undefined)
            return false;
        if (this.path !== undefined) {
            this.importReferencedModule();
            return true;
        }
        return noPathFoundTemplate;
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
