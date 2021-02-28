import { html } from 'xtal-element/lib/html.js';
import { xc, PropAction, PropDefMap, PropDef } from 'xtal-element/lib/XtalCore.js';
import { xp, XtalPattern } from 'xtal-element/lib/XtalPattern.js';
import { RxSuppl } from 'xtal-element/lib/RxSuppl.js';
import { DOMKeyPEA } from 'xtal-element/lib/DOMKeyPEA.js';
import('k-fetch/k-fetch.js');
import('@power-elements/json-viewer/json-viewer.js');
import('on-to-me/on-to-me.js');
import('ib-id/i-bid.js');
import('./swag-tag-instance.js');

const mainTemplate = html `
<k-fetch disabled as=json></k-fetch>
<on-to-me on=fetch-complete to=details me=1 care-of=[-object] val=target.value></on-to-me>
<on-to-me on=fetch-complete to=[-list] me=1 val=target.value.tags></on-to-me>
<json-event-viewer -new-event part=jsonEventViewer></json-event-viewer>
<i-bid -list>
  <swag-tag-instance></swag-tag-instance>
</i-bid>
<details part=viewSchema>
  <summary>View Schema</summary>
  <json-viewer -object part=jsonViewer allowlist="name,properties,attributes,slots,events,tags,version"></json-viewer>
</details>
`;
const refs = {
  kFetchElement: '',
  iBidElement: '',
};

const propActions = [
  xp.manageMainTemplate,
  ({domCache}: SwagTagSuite) => [
    {[refs.iBidElement]: [{
      map: (item: any, idx: number) => ({
        attrs: item.attributes,
        name: item.name
      })
    }]}
  ],
  ({domCache, href}: SwagTagSuite) => [
    {[refs.kFetchElement]: [,,{href: href}]},
  ],
  xp.createShadow
] as PropAction[];

export class SwagTagSuite extends HTMLElement implements XtalPattern{
  static is = 'swag-tag-suite';
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
    xc.hydrate<SwagTagSuite>(this, slicedPropDefs);
  }
  onPropChange(n: string, prop: PropDef, nv: any){
    this.reactor.addToQueue(prop, nv);
  }
}

const propDefMap : PropDefMap<SwagTagSuite> = {
  ...xp.props,
  href: {
    type: String,
    dry: true,
    async: true,
  }
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(SwagTagSuite, slicedPropDefs.propDefs, 'onPropChange');
xc.define(SwagTagSuite);

