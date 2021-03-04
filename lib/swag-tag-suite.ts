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
<k-fetch disabled=2 as=json></k-fetch>
<on-to-me on=fetch-complete to=details care-of=[-object] me=1 val=target.value></on-to-me>
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
        name: item.name,
        events: item.events,
      })
    }]}
  ],
  ({domCache, href, self}: SwagTagSuite) => [
    {[refs.kFetchElement]: [,{'fetch-complete': [self.importModules, 'value']},{href: href}]},
  ],
  xp.createShadow
] as PropAction[];

/**
 * @element swag-tag-suite
 */
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
  skipImports: boolean | undefined;

  importModules(wcInfo: any){
    if(this.skipImports) return;
    const tags = wcInfo.tags;
    for(const item of tags){
      const path = item.path;
      if(path !== undefined){
        const iPosOfDblSlash = this.href!.indexOf('//');
        if(iPosOfDblSlash > -1 && iPosOfDblSlash < 7){
          const selfResolvingModuleSplitPath = this.href!.split('/');
          selfResolvingModuleSplitPath.pop();
          const selfResolvingModulePath = selfResolvingModuleSplitPath.join('/') + path!.substring(1) + '?module';
          import(selfResolvingModulePath);
        }else{
          const splitPath = (location.origin + location.pathname).split('/');
          splitPath.pop();
          // let path = self.path!;
          // while(path.startsWith('../')){
          //   splitPath.pop();
          //   path = path.substr(3);
          // }
          const importPath = splitPath.join('/') + '/' + path;
          import(importPath);
        }
      }
    }
  }

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
  },
  skipImports: {
    type: Boolean,
    dry: true,
    async: true,
  }
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(SwagTagSuite, slicedPropDefs.propDefs, 'onPropChange');
xc.define(SwagTagSuite);

