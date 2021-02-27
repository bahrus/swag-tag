import { html } from 'xtal-element/lib/html.js';
import { xc } from 'xtal-element/lib/XtalCore.js';
import { xp } from 'xtal-element/lib/XtalPattern.js';
import { RxSuppl } from 'xtal-element/lib/RxSuppl.js';
import { DOMKeyPEA } from 'xtal-element/lib/DOMKeyPEA.js';
import('k-fetch/k-fetch.js');
import('@power-elements/json-viewer/json-viewer.js');
const mainTemplate = html `
<k-fetch as=json></k-fetch>
<on-to-me on=fetch-complete></on-to-me>

<details part=viewSchema>
  <summary>View Schema</summary>
  <json-viewer -data part=jsonViewer allowlist="name,properties,attributes,slots,events"></json-viewer>
</details>
`;
const refs = {
    kFetchElement: ''
};
const propActions = [
    xp.manageMainTemplate,
    ({ domCache, href }) => [
        { [refs.kFetchElement]: [, , { href: href }] },
    ],
    // ({domCache, href}: SwagTag) => {
    //   debugger;
    // },
    xp.createShadow
];
export class SwagTag extends HTMLElement {
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
SwagTag.is = 'swag-tag';
const propDefMap = {
    ...xp.props,
    href: {
        type: String,
        dry: true
    }
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(SwagTag, slicedPropDefs.propDefs, 'onPropChange');
xc.define(SwagTag);
