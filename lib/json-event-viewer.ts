import { XtalElement, define, PSettings, TransformValueOptions, AttributeProps, SelectiveUpdate } from 'xtal-element/XtalElement';
import {conditionalImport} from 'xtal-sip/conditionalImport.js';
//import('@power-elements/json-viewer/json-viewer.js');
import { createTemplate} from "trans-render/createTemplate.js";
const json_viewer = 'json-viewer';

const mainTemplate = createTemplate(/* html */`
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

const jsonViewer = Symbol(json_viewer);
const details = Symbol('details');
const initTransform = {
    details:{
        [json_viewer]: jsonViewer
    },
    '"': [{style:{display:'none'}},,,,details]
} as TransformValueOptions;
const allowList = ['detail', 'type', 'bubbles', 'cancelBubble', 'cancelable', 'composed', 'defaultPrevented', 'eventPhase', 'isTrusted', 'returnValue', 'timeStamp'];
export const appendToEventArchive = ({newEvent, self}: JsonEventViewer) =>{
    console.log(newEvent);
    const aSelf = self as any;
    conditionalImport(self.shadowRoot!, {
        [json_viewer]:[
            [
                '@power-elements/json-viewer/json-viewer.js',
                () => import('@power-elements/json-viewer/json-viewer.js'),
                ({path}) => `//unpkg.com/${path}?module`,,
            ]
        ]
    });

    if(newEvent === undefined) return;
    const safeEvent: any = {};
    allowList.forEach(prop => {
        safeEvent[prop] = (<any>newEvent)[prop];
    })
    if(self.eventArchive === undefined){
        self.eventArchive = {
            eventHistory: []
        };
    }
    self.eventArchive.eventHistory.unshift(safeEvent);
    self.eventArchive = self.eventArchive;
}

export const bindJsonViewer = ({eventArchive}: JsonEventViewer) => ({
     [jsonViewer]: [{object: eventArchive}] as PSettings<any>,
     [details]: [{style:{display:'block'}}]
} as TransformValueOptions);

export const updateTransforms = [bindJsonViewer] as SelectiveUpdate<any>[];

export class JsonEventViewer extends XtalElement{
    static is = 'json-event-viewer';

    static attributeProps = ({newEvent, eventArchive}: JsonEventViewer) =>({
        obj:[newEvent, eventArchive]
    } as AttributeProps);

    readyToInit = true;

    mainTemplate = mainTemplate;

    readyToRender = true;

    initTransform = initTransform;

    propActions = [appendToEventArchive];

    updateTransforms = updateTransforms;

    newEvent: CustomEvent | undefined;

    eventArchive: any;
}
define(JsonEventViewer);