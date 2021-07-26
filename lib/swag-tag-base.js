import { xc } from 'xtal-element/lib/XtalCore.js';
import { xp } from 'xtal-element/lib/XtalPattern.js';
import { html } from 'xtal-element/lib/html.js';
import('wc-info/wc-info-fetch.js');
import('pass-prop/p-p.js');
import('pass-down/p-d.js');
import('xtal-fragment/xtal-fragment.js');
export { xp } from 'xtal-element/lib/XtalPattern.js';
export { xc } from 'xtal-element/lib/XtalCore.js';
export { html } from 'xtal-element/lib/html.js';
const mainTemplate = html `
    <p-p from-host observe-prop=href to=[-href] m=1></p-p>
    <p-p from-host observe-prop=tag to=[-tag] m=1></p-p>
    <wc-info-fetch -href -tag></wc-info-fetch>
    <template id=editor>
        <div>Create a template in super classes, and set the editor property equally to the template you want displayed</div>
    </template>
    <xtal-fragment copy from=editor></xtal-fragment>

`;
export class SwagTagBase extends HTMLElement {
    constructor() {
        super();
        this.self = this;
        this.propActions = propActions;
        this.reactor = new xp.RxSuppl(this, []);
        this.mainTemplate = mainTemplate;
        //this.attachShadow({mode: 'open'});
    }
    connectedCallback() {
        xc.mergeProps(this, slicedPropDefs);
    }
    onPropChange(n, prop, nv) {
        this.reactor.addToQueue(prop, nv);
    }
}
SwagTagBase.is = 'swag-tag-base';
const propActions = [
    xp.manageMainTemplate,
    xp.createShadow,
];
const baseProp = {
    dry: true,
    async: true,
};
const strProp1 = {
    ...baseProp,
    type: String,
};
const objProp1 = {
    ...baseProp,
    type: Object,
};
const propDefMap = {
    ...xp.props,
    href: strProp1,
    tag: strProp1,
    customElement: objProp1,
    fields: objProp1,
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(SwagTagBase, slicedPropDefs, 'onPropChange');
xc.define(SwagTagBase);
export function countTypes(declaration) {
    let count = 0;
    if (declaration.kind !== 'class')
        return count;
    const classDeclaration = declaration;
    if (classDeclaration.members === undefined)
        return count;
    for (const member of classDeclaration.members) {
        const classField = member;
        if (classField.type !== undefined)
            count++;
    }
    return count;
}
