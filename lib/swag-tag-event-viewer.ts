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
@media (prefers-color-scheme: dark) {
    summary{
        color: white;
    }
}
</style>
<details open>
    <summary>Event History</summary>
    <json-viewer></json-viewer>
</details>
`;
const refs = {jsonViewerElement:'', detailsElement: ''};

export const bindNewEvent = ({domCache, eventArchive}: SwagTagEventViewer) => [
    {[refs.jsonViewerElement]: [{object:eventArchive}]}
];
export const appendToEventArchive = ({newEvent, self}: SwagTagEventViewer) => {
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
export class SwagTagEventViewer extends HTMLElement implements XtalPattern{
    static is = 'swag-tag-event-viewer';

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
        xc.hydrate<SwagTagEventViewer>(this, slicedPropDefs);
    }
    onPropChange(n: string, prop: PropDef, nv: any){
        this.reactor.addToQueue(prop, nv);
    }

    newEvent: CustomEvent |  undefined;

    eventArchive: any;

}
const obj: PropDef = {
    type: Object, 
    async: true,
    stopReactionsIfFalsy: true,
};

const propDefMap: PropDefMap<SwagTagEventViewer> = {
    ...xp.props,
    newEvent: obj, eventArchive: obj,
}
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(SwagTagEventViewer, slicedPropDefs, 'onPropChange');
xc.define(SwagTagEventViewer);