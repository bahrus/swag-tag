import { html } from 'xtal-element/lib/html.js';
import { xc, PropAction, PropDefMap, PropDef } from 'xtal-element/lib/XtalCore.js';
import { xp, XtalPattern } from 'xtal-element/lib/XtalPattern.js';
import { RxSuppl } from 'xtal-element/lib/RxSuppl.js';
import { DOMKeyPEA, PEASettings as Tag } from 'xtal-element/lib/DOMKeyPEA.js';
import {OnToMeProps} from 'on-to-me/types.d.js';
import('ib-id/i-bid.js');
import('on-to-me/on-to-me.js');
import('./swag-tag-event-viewer.js');

const mainTemplate = html`
<section part=section>
  <h2></h2>
  <place-holder></place-holder>
  <i-bid id=prop-editor>
  </i-bid>
  <i-bid id=repeat-listeners>
    <on-to-me></on-to-me>
  </i-bid>
  <swag-tag-event-viewer -new-event></swag-tag-event-viewer>
</section>
`;
const refs = {h2Element:'', repeatListenersId:'', placeHolderElement:''};

const propActions = [
  xp.manageMainTemplate,
  ({domCache, name}: SwagTagInstance) => [
    {[refs.h2Element]: name}
  ],
  xp.createShadow,
  ({domCache, name}: SwagTagInstance) => [
    {[refs.placeHolderElement]: [{localName: name}]},
  ],
  ({domCache, events, name}: SwagTagInstance) => [
    {[refs.repeatListenersId]: [{
      list: events,
      map: (event: IEvent) => (<Tag<OnToMeProps>>[,,{ observe:name, on: event.name, to: '[-new-event]', me: '1', val: '.'}]),
    }]}
  ],
  ({domCache, properties}: SwagTagInstance) => {
    for(const prop of properties!){
      if(prop.default!== undefined){
        try{
          const parsedProp = JSON.parse(prop.default);
          domCache[refs.placeHolderElement][prop.name] = parsedProp;
        }catch(e){
          console.error(e);
        }
      }
    }
    console.log(properties);
  },
] as PropAction[];

interface IEvent {
  name: string,
  description?: string,
}
interface IProperty{
  name: string,
  type: string,
  default: string,
}
/**
 * @element swag-tag-instance
 */
export class SwagTagInstance extends HTMLElement implements XtalPattern{
  static is='swag-tag-instance';
  self = this;
  refs = refs;
  propActions = propActions;
  reactor = new RxSuppl(this, [
    {
      rhsType: Array,
      ctor: DOMKeyPEA,
    }
  ]);
  domCache: any;
  mainTemplate = mainTemplate;
  clonedTemplate: DocumentFragment | undefined;
  
  name: string | undefined;
  events: IEvent[] | undefined;
  properties: IProperty[] | undefined;

  connectedCallback(){
    xc.hydrate<SwagTagInstance>(this, slicedPropDefs);
  }
  onPropChange(n: string, prop: PropDef, nv: any){
    this.reactor.addToQueue(prop, nv);
  }
}
const propDefMap : PropDefMap<SwagTagInstance> = {
  ...xp.props,
  name:{
    type: String,
    dry: true
  },
  properties:{
    type: Object,
    dry: true,
    stopReactionsIfFalsy: true
  },
  events:{
    type: Object,
    async: true,
    dry: true,
    stopReactionsIfFalsy: true
  }
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(SwagTagInstance, slicedPropDefs, 'onPropChange');
xc.define(SwagTagInstance);