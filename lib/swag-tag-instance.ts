import { html } from 'xtal-element/lib/html.js';
import { xc, PropAction, PropDefMap, PropDef } from 'xtal-element/lib/XtalCore.js';
import { xp, XtalPattern } from 'xtal-element/lib/XtalPattern.js';
import { RxSuppl } from 'xtal-element/lib/RxSuppl.js';
import { DOMKeyPEA } from 'xtal-element/lib/DOMKeyPEA.js';

const mainTemplate = html`
<section part=section>
  <place-holder></place-holder>
  <div part=component-holder>
    
    <div part=componentListeners>I am here</div>
  </div>
</section>
`;
const refs = {componentHolderPart:'',placeHolderElement:''};
const propActions = [
  xp.manageMainTemplate,
  ({domCache, name}: SwagTagInstance) => [
    {[refs.componentHolderPart]: name}
  ],
  xp.createShadow,
  ({domCache, name}: SwagTagInstance) => [
    {[refs.placeHolderElement]: Symbol(name)}
  ],
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
  
  name: string | undefined;

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
    //async: true,
    dry: true
  }
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(SwagTagInstance, slicedPropDefs.propDefs, 'onPropChange');
xc.define(SwagTagInstance);