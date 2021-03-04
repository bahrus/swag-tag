import { html } from 'xtal-element/lib/html.js';
import { xc } from 'xtal-element/lib/XtalCore.js';
import { xp } from 'xtal-element/lib/XtalPattern.js';
import { RxSuppl } from 'xtal-element/lib/RxSuppl.js';
import { DOMKeyPEA } from 'xtal-element/lib/DOMKeyPEA.js';
import('ib-id/i-bid.js');
import('on-to-me/on-to-me.js');
import('./event-viewer.js');
const mainTemplate = html `
<section part=section>
  <h2></h2>
  <place-holder></place-holder>
  <i-bid>
    <on-to-me></on-to-me>
  </i-bid>
  <event-viewer -new-event></event-viewer>
</section>
`;
const refs = { h2Element: '', iBidElement: '', placeHolderElement: '' };
const propActions = [
    xp.manageMainTemplate,
    ({ domCache, name }) => [
        { [refs.h2Element]: name }
    ],
    xp.createShadow,
    ({ domCache, name }) => [
        { [refs.placeHolderElement]: Symbol(name) }
    ],
    ({ domCache, events }) => [
        { [refs.iBidElement]: [{
                    map: (event) => ([, ,
                        {
                            on: event.name,
                            to: '[-new-event]',
                            me: '1',
                            val: '.'
                        }
                    ]),
                    list: events,
                }] }
    ],
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
    name: {
        type: String,
        async: true,
        dry: true
    },
    events: {
        type: Object,
        async: true,
        dry: true
    }
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(SwagTagInstance, slicedPropDefs.propDefs, 'onPropChange');
xc.define(SwagTagInstance);
