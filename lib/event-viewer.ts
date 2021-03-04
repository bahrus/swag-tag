import { html } from 'xtal-element/lib/html.js';
import { xc, PropAction, PropDef, PropDefMap, ReactiveSurface } from 'xtal-element/lib/XtalCore.js';
import { xp, XtalPattern } from 'xtal-element/lib/XtalPattern.js';
import { RxSuppl } from 'xtal-element/lib/RxSuppl.js';
import { DOMKeyPEA } from 'xtal-element/lib/DOMKeyPEA.js';
import('@power-elements/json-viewer/json-viewer.js');

const mainTemplate = html`
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
const refs = {jsonViewerElement:'', detailsElement: ''};

export const bindNewEvent = ({domCache, eventArchive}: EventViewer) => [
    {[refs.jsonViewerElement]: [{object:eventArchive}]}
];
export const appendToEventArchive = ({newEvent, self}: EventViewer) => {
    console.log(newEvent);
    const aSelf = self as any;
    const safeEvent: any = {};
    allowList.forEach(prop => {
        safeEvent[prop] = (<any>newEvent)[prop];
    });
    if(self.eventArchive === undefined){
        self.eventArchive = {
            eventHistory: []
        };
    }
    self.eventArchive.eventHistory.unshift(safeEvent);
    self.eventArchive = self.eventArchive;
}


const propActions = [
    xp.manageMainTemplate,
    appendToEventArchive,
    bindNewEvent,
    xp.createShadow
] as PropAction[];
const allowList = ['detail', 'type', 'bubbles', 'cancelBubble', 'cancelable', 'composed', 'defaultPrevented', 'eventPhase', 'isTrusted', 'returnValue', 'timeStamp'];
/**
 * @element event-viewer
 */
export class EventViewer extends HTMLElement implements XtalPattern{
    static is = 'event-viewer';

    self = this;
    propActions = propActions;
    refs = refs;
    reactor = new RxSuppl(this, [
        {
            rhsType: Array,
            ctor: DOMKeyPEA,
        }
    ]);
    domCache: any;
    mainTemplate = mainTemplate;
    clonedTemplate: DocumentFragment | undefined;
    connectedCallback(){
        xc.hydrate<EventViewer>(this, slicedPropDefs);
    }
    onPropChange(n: string, prop: PropDef, nv: any){
        this.reactor.addToQueue(prop, nv);
    }

    newEvent: CustomEvent |  undefined;

    eventArchive: any;

}
const obj: PropDef = {
    type: Object, 
    dry: true,
    async: true,
    stopReactionsIfFalsy: true,
};

const propDefMap: PropDefMap<EventViewer> = {
    ...xp.props,
    newEvent: obj, eventArchive: obj,
}
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(EventViewer, slicedPropDefs.propDefs, 'onPropChange');
xc.define(EventViewer);