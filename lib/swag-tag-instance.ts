import { html } from 'xtal-element/lib/html.js';
import { xc, PropAction, PropDefMap, PropDef } from 'xtal-element/lib/XtalCore.js';
import { xp, XtalPattern } from 'xtal-element/lib/XtalPattern.js';
import { RxSuppl } from 'xtal-element/lib/RxSuppl.js';
import { DOMKeyPEA } from 'xtal-element/lib/DOMKeyPEA.js';

const mainTemplate = html`
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
] as PropAction[];
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
  
  href: string | undefined;

  connectedCallback(){
    xc.hydrate<SwagTagInstance>(this, slicedPropDefs);
  }
  onPropChange(n: string, prop: PropDef, nv: any){
    this.reactor.addToQueue(prop, nv);
  }
}
const propDefMap : PropDefMap<SwagTagInstance> = {
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