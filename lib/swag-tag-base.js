import { xc } from 'xtal-element/lib/XtalCore.js';
import { xp } from 'xtal-element/lib/XtalPattern.js';
import { html } from 'xtal-element/lib/html.js';
import('xtal-fetch/xtal-fetch-get.js');
import('pass-prop/p-p.js');
import('pass-down/p-d.js');
import('aggregator-fn/ag-fn.js');
import('xtal-fragment/xtal-fragment.js');
const mainTemplate = html `
    <p-p from-host observe-prop=href to=[-href] m=1></p-p>
    <xtal-fetch-get fetch -href></xtal-fetch-get>
    <p-d vft=result to=[-pack] m=1></p-d>
    <ag-fn -pack><script nomodule>
        ({pack, host, self}) => {
            if(pack === undefined || host.tag === undefined) return;
            const mapping = host.getTagNameToDeclarationsMap(pack);

            return mapping[host.tag];
        }
    </script></ag-fn>
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
    getTagNameToDeclarationsMap(pack) {
        const tagNameToDeclaration = {};
        if (pack === undefined)
            tagNameToDeclaration;
        const mods = pack.modules;
        if (mods === undefined)
            tagNameToDeclaration;
        for (const mod of mods) {
            const declarations = mod.declarations;
            if (declarations === undefined)
                continue;
            const tagDeclarations = declarations.filter(x => x.tagName !== undefined);
            for (const declaration of tagDeclarations) {
                const ce = declaration;
                const tagName = ce.tagName;
                if (tagNameToDeclaration[tagName] !== undefined) {
                    if (countTypes(declaration) > countTypes(tagNameToDeclaration[tagName])) {
                        tagNameToDeclaration[tagName] = ce;
                    }
                }
                else {
                    tagNameToDeclaration[tagName] = ce;
                }
            }
        }
        return Object.values(tagNameToDeclaration);
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
