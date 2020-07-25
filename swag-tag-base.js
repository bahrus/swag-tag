import { symbolize } from 'xtal-element/symbolize.js';
import { createTemplate as T } from "trans-render/createTemplate.js";
import { XtalFetchViewElement, define, mergeProps } from "xtal-element/XtalFetchViewElement.js";
import { PD } from "p-et-alia/p-d.js";
import { SwagTagPrimitiveBase } from './swag-tag-primitive-base.js';
const mainTemplate = T(/* html */ `
<header>
</header>
<form>
  <fieldset>
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
const initTransform = {
    form: {
        fieldset: uiRefs.fieldset,
        '"': {
            legend: {
                var: uiRefs.editName,
            }
        },
    },
    details: {
        summary: uiRefs.summary,
        var: uiRefs.var$
    },
};
const updateTransforms = [
    ({ name }) => ({
        [uiRefs.summary]: name,
        [uiRefs.editName]: name,
        [uiRefs.var$]: [name]
    }),
    ({ massagedProps, name }) => ({
        [uiRefs.fieldset]: [massagedProps, SwagTagPrimitiveBase.is, , {
                [SwagTagPrimitiveBase.is]: ({ item, target }) => {
                    Object.assign(target, item);
                },
                '"': ({ item }) => ([PD.is, 'afterEnd', [{ on: 'input', from: 'form', to: 'details', careOf: name, prop: item.name, val: 'target.value', m: 1 }]])
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
    });
    properties[massaged] = true;
    self.massagedProps = properties;
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
            linkWcInfo, linkMassagedProps
        ];
        this.updateTransforms = updateTransforms;
        this.initTransform = initTransform;
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
