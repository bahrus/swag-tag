import { html } from 'xtal-element/lib/html.js';
import { xc, PropAction, PropDefMap, PropDef } from 'xtal-element/lib/XtalCore.js';
import { xp, XtalPattern } from 'xtal-element/lib/XtalPattern.js';
import { RxSuppl } from 'xtal-element/lib/RxSuppl.js';
import {DOMKeyPEA} from 'xtal-element/lib/DOMKeyPEA.js';
import('k-fetch/k-fetch.js');
import('@power-elements/json-viewer/json-viewer.js');
import('on-to-me/on-to-me.js');


const mainTemplate = html `
<k-fetch disabled as=json></k-fetch>
<on-to-me on=fetch-complete to=details care-of=[-object] val=target.value></on-to-me>

<details part=viewSchema>
  <summary>View Schema</summary>
  <json-viewer -object part=jsonViewer allowlist="name,properties,attributes,slots,events,tags,version"></json-viewer>
</details>
`;
const refs = {
  kFetchElement: ''
};

const propActions = [
  xp.manageMainTemplate,
  ({domCache, href}: SwagTag) => [
    {[refs.kFetchElement]: [,,{href: href}]},
  ],
  // ({domCache, href}: SwagTag) => {
  //   debugger;
  // },
  xp.createShadow
] as PropAction[];

export class SwagTag extends HTMLElement implements XtalPattern{
  static is = 'swag-tag';
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
    xc.hydrate<SwagTag>(this, slicedPropDefs);
  }
  onPropChange(n: string, prop: PropDef, nv: any){
    this.reactor.addToQueue(prop, nv);
  }
}

const propDefMap : PropDefMap<SwagTag> = {
  ...xp.props,
  href: {
    type: String,
    dry: true
  }
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(SwagTag, slicedPropDefs.propDefs, 'onPropChange');
xc.define(SwagTag);

