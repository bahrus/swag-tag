import { html } from 'xtal-element/lib/html.js';
import { xc, PropAction, PropDefMap, PropDef } from 'xtal-element/lib/XtalCore.js';
import { xp, XtalPattern } from 'xtal-element/lib/XtalPattern.js';
import { RxSuppl } from 'xtal-element/lib/RxSuppl.js';
import { DOMKeyPEA } from 'xtal-element/lib/DOMKeyPEA.js';
import('ib-id/i-bid.js');
import('on-to-me/on-to-me.js');
import('./event-viewer.js');

const mainTemplate = html`
<section part=section>
  <h2></h2>
  <place-holder></place-holder>
  <i-bid>
    <on-to-me></on-to-me>
  </i-bid>
  <event-viewer -new-event></event-viewer>
</section>
`;
const refs = {h2Element:'', iBidElement:'', placeHolderElement:''};

const propActions = [
  xp.manageMainTemplate,
  ({domCache, name}: SwagTagInstance) => [
    {[refs.h2Element]: name}
  ],
  xp.createShadow,
  ({domCache, name}: SwagTagInstance) => [
    {[refs.placeHolderElement]: Symbol(name)}
  ],
  ({domCache, events}: SwagTagInstance) => [
    {[refs.iBidElement]: [{
      list: events,
      map: (event: IEvent) => ([,,{ on: event.name, to: '[-new-event]', me: '1', val: '.'}]),
    }]}
  ],
] as PropAction[];

interface IEvent {
  name: string,
  description?: string,
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
    async: true,
    dry: true
  },
  events:{
    type: Object,
    async: true,
    dry: true
  }
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(SwagTagInstance, slicedPropDefs.propDefs, 'onPropChange');
xc.define(SwagTagInstance);