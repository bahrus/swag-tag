import { html } from 'xtal-element/lib/html.js';
import { xc } from 'xtal-element/lib/XtalCore.js';
import { xp } from 'xtal-element/lib/XtalPattern.js';
import { RxSuppl } from 'xtal-element/lib/RxSuppl.js';
import { DOMKeyPEA } from 'xtal-element/lib/DOMKeyPEA.js';
import('@power-elements/json-viewer/json-viewer.js');
const mainTemplate = html `
<style>
details{
    max-height: 300px;
    overflow-y:auto;
}
</style>
<details open>
    <summary>Event History</summary>
    <json-viewer -object></json-viewer>
</details>
`;
const refs = { jsonViewerElement: '', detailsElement: '' };
export const bindNewEvent = ({ domCache, eventArchive }) => [
    { [refs.jsonViewerElement]: [{ object: eventArchive }] }
];
export const appendToEventArchive = ({ newEvent, self }) => {
    console.log(newEvent);
    const aSelf = self;
    const safeEvent = {};
    allowList.forEach(prop => {
        safeEvent[prop] = newEvent[prop];
    });
    if (self.eventArchive === undefined) {
        self.eventArchive = {
            eventHistory: []
        };
    }
    self.eventArchive.eventHistory.unshift(safeEvent);
    self.eventArchive = self.eventArchive;
};
const propActions = [
    xp.manageMainTemplate,
    appendToEventArchive,
    bindNewEvent,
    xp.createShadow
];
const allowList = ['detail', 'type', 'bubbles', 'cancelBubble', 'cancelable', 'composed', 'defaultPrevented', 'eventPhase', 'isTrusted', 'returnValue', 'timeStamp'];
/**
 * @element event-viewer
 */
export class EventViewer extends HTMLElement {
    constructor() {
        super(...arguments);
        this.self = this;
        this.propActions = propActions;
        this.refs = refs;
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
EventViewer.is = 'event-viewer';
const obj = {
    type: Object,
    async: true,
    stopReactionsIfFalsy: true,
};
const propDefMap = {
    ...xp.props,
    newEvent: obj, eventArchive: obj,
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(EventViewer, slicedPropDefs.propDefs, 'onPropChange');
xc.define(EventViewer);
