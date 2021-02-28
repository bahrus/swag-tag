import { html } from 'xtal-element/lib/html.js';
import { xc } from 'xtal-element/lib/XtalCore.js';
import { xp } from 'xtal-element/lib/XtalPattern.js';
import { RxSuppl } from 'xtal-element/lib/RxSuppl.js';
import { DOMKeyPEA } from 'xtal-element/lib/DOMKeyPEA.js';
const mainTemplate = html `
<section part=section>
  <div part=componentHolder>
    <div part=componentListeners>I am here</div>
  </div>
</section>
`;
const refs = {};
const propActions = [
    xp.manageMainTemplate,
    xp.createShadow
];
/**
 * @element swag-tag-instance
 */
export class SwagTagInstance extends HTMLElement {
    constructor() {
        super(...arguments);
        this.self = this;
        this.refs = refs;
        this.propActions = propActions;
        this.reactor = new RxSuppl(this, [
            {
                rhsType: Array,
                ctor: DOMKeyPEA,
            }
        ]);
        this.mainTemplate = mainTemplate;
    }
    connectedCallback() {
        xc.hydrate(this, slicedPropDefs);
    }
    onPropChange(n, prop, nv) {
        this.reactor.addToQueue(prop, nv);
    }
}
SwagTagInstance.is = 'swag-tag-instance';
const propDefMap = {
    ...xp.props,
    href: {
        type: String,
        dry: true,
        async: true,
    }
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(SwagTagInstance, slicedPropDefs.propDefs, 'onPropChange');
xc.define(SwagTagInstance);
