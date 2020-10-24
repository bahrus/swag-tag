import { XtalElement, define } from 'xtal-element/XtalElement';
import { preemptiveImport } from 'xtal-sip/preemptiveImport.js';
//import('@power-elements/json-viewer/json-viewer.js');
import { createTemplate } from "trans-render/createTemplate.js";
preemptiveImport([
    '@power-elements/json-viewer/json-viewer.js',
    () => import('@power-elements/json-viewer/json-viewer.js'),
    ({ path }) => `//unpkg.com/${path}?module`, ,
]);
const mainTemplate = createTemplate(/* html */ `
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
`);
const jsonViewer = Symbol('json-viewer');
const details = Symbol('details');
const initTransform = {
    details: {
        'json-viewer': jsonViewer
    },
    '"': [{ style: { display: 'none' } }, , , , details]
};
const allowList = ['detail', 'type', 'bubbles', 'cancelBubble', 'cancelable', 'composed', 'defaultPrevented', 'eventPhase', 'isTruted', 'returnValue', 'timeStamp'];
export const appendToEventArchive = ({ newEvent, self }) => {
    if (newEvent === undefined)
        return;
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
export const bindJsonViewer = ({ eventArchive }) => ({
    [jsonViewer]: [{ object: eventArchive }],
    [details]: [{ style: { display: 'block' } }]
});
export const updateTransforms = [bindJsonViewer];
export class JsonEventViewer extends XtalElement {
    constructor() {
        super(...arguments);
        this.readyToInit = true;
        this.mainTemplate = mainTemplate;
        this.readyToRender = true;
        this.initTransform = initTransform;
        this.propActions = [appendToEventArchive];
        this.updateTransforms = updateTransforms;
    }
}
JsonEventViewer.is = 'json-event-viewer';
JsonEventViewer.attributeProps = ({ newEvent, eventArchive }) => ({
    obj: [newEvent, eventArchive]
});
define(JsonEventViewer);
