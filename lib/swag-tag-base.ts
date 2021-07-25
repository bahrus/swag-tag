import {xc, IReactor, PropAction, PropDef, PropDefMap, ReactiveSurface} from 'xtal-element/lib/XtalCore.js';
import {xp, XtalPattern} from 'xtal-element/lib/XtalPattern.js';
import {html} from 'xtal-element/lib/html.js';
import {Package, Declaration, ClassDeclaration, ClassField, CustomElement} from '../node_modules/custom-elements-manifest/schema.d.js';
import {SwagTagBaseProps} from '../types.d.js';
import('xtal-fetch/xtal-fetch-get.js');
import('pass-prop/p-p.js');
import('pass-down/p-d.js');
import('aggregator-fn/ag-fn.js');
import('xtal-fragment/xtal-fragment.js');
export {xp} from 'xtal-element/lib/XtalPattern.js';
export {xc} from 'xtal-element/lib/XtalCore.js';
export {html} from 'xtal-element/lib/html.js';

const mainTemplate = html`
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

export class SwagTagBase extends HTMLElement implements ReactiveSurface, XtalPattern{
    static is='swag-tag-base';
    constructor(){
        super();
        //this.attachShadow({mode: 'open'});
    }
    self = this;
    propActions = propActions;
    reactor: IReactor = new xp.RxSuppl(this, [

    ]);
    mainTemplate = mainTemplate;

    connectedCallback(){
        xc.mergeProps(this, slicedPropDefs);
    }

    onPropChange(n: string, prop: PropDef, nv: any){
        this.reactor.addToQueue(prop, nv);
    }
    
    getTagNameToDeclarationsMap(pack: Package){
        const tagNameToDeclaration: {[key: string]: CustomElement} = {};
        if(pack === undefined) tagNameToDeclaration;
        const mods = pack.modules;
        if(mods === undefined) tagNameToDeclaration;
        
        for(const mod of mods){
            const declarations = mod.declarations;
            if(declarations === undefined) continue;
            const tagDeclarations = declarations.filter(x => (x as CustomElement).tagName !== undefined);
            
            for(const declaration of tagDeclarations){
                const ce = declaration as CustomElement;
                const tagName = ce.tagName!;
                if(tagNameToDeclaration[tagName] !== undefined){
                    if(countTypes(declaration) >  countTypes(tagNameToDeclaration[tagName] as Declaration)){
                        tagNameToDeclaration[tagName] = ce;
                    }
                }else{
                    tagNameToDeclaration[tagName] = ce;
                }
            }
        }

        return Object.values(tagNameToDeclaration);
    }
}
export interface SwagTagBase extends SwagTagBaseProps{}

type S = SwagTagBase;
const propActions = [
    xp.manageMainTemplate,
    xp.createShadow,
    
] as PropAction[];
const baseProp: PropDef = {
    dry: true,
    async: true,
};
const strProp1: PropDef = {
    ...baseProp,
    type: String,
}
const objProp1: PropDef = {
    ...baseProp,
    type: Object,
};
const propDefMap: PropDefMap<S> = {
    ...xp.props,
    href: strProp1,
    tag: strProp1,
    customElement: objProp1,
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(SwagTagBase, slicedPropDefs, 'onPropChange');
xc.define(SwagTagBase);

export function countTypes(declaration: Declaration){
    let count = 0;
    if(declaration.kind !== 'class') return count;
    const classDeclaration = declaration as ClassDeclaration;
    if(classDeclaration.members === undefined) return count;
    for(const member of classDeclaration.members){
        const classField = member as ClassField;
        if(classField.type !== undefined) count++;
    }
    return count;
}

