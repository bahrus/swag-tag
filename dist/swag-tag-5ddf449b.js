const SkipSibs=Symbol(),NextMatch=Symbol(),more=Symbol.for("e35fe6cb-78d4-48fe-90f8-bf9da743d532");function transform(t,e,s=t){e.ctx=e;const i=isTemplate(t),n=i?t.content.cloneNode(!0):t;processFragment(n,e);let o="appendChild";const r=e.options;if(void 0!==r){r.prepend&&(o="prepend");const t=r.initializedCallback;void 0!==t&&t(e,n,r)}return i&&s&&s[o](n),e.mode="update",e}function isTemplate(t){return void 0!==t&&"template"===t.localName&&t.content&&"function"==typeof t.content.cloneNode}function copyCtx(t){return Object.assign({},t)}function restoreCtx(t,e){return Object.assign(t,e)}function processFragment(t,e){const s=e.Transform;if(void 0===s)return;const i=Array.isArray(s)?s:[s],n=void 0===e.mode;i.forEach(s=>{const i={level:0,idx:0};n&&(i.mode="init"),Object.assign(e,i),e.target=t.firstElementChild,e.Transform=s,processEl(e),processSymbols(e)})}function processSymbols(t){const e=t.Transform;for(const s of Object.getOwnPropertySymbols(e)){let i=e[s];s===more&&(t.Transform=i,processSymbols(t),t.Transform=e);const n=t[s]||t.host[s];if(void 0!==n){for(t.target=n;"function"==typeof i;)i=i(t);switch(typeof i){case"string":n.textContent=i;break;case"object":t.customObjProcessor("",i,t);break;case"boolean":!1===i&&n.remove()}}}}function processEl(t){const e=t.target;if(null==e||void 0===t.Transform)return!0;e.hasAttribute("debug");const s=Object.keys(t.Transform);if(0===s.length)return!0;const i=s[0][0];"SNTM".indexOf(i)>-1&&(doNextStepSelect(t),doNextStepSibling(t));let n=e;const o=t.Transform;let r=!1;for(;null!==n;){void 0!==t.itemTagger&&t.itemTagger(n);let e=!1;for(let i=0,a=s.length;i<a;i++){const a=s[i];if("debug"===a)continue;if(a.startsWith('"')){if(!r)continue}else{let e=a;if(":host"===a)n!==t.host&&(r=!1);else if(a.startsWith(":has(>")){const t=a.substring(6,a.length-1);let e=!1;for(let s=0,i=n.children.length;s<i;s++){if(n.children[s].matches(t)){e=!0;break}}if(!e){r=!1;continue}}else if(a.endsWith("Part")&&(e=`[part="${a.substring(0,a.length-4)}"]`),!n.matches(e)){r=!1;continue}}r=!0,t.target=n;const c=getRHS(o[a],t);if(a.endsWith("]")){const t=a.lastIndexOf("[");if(t>-1&&"-"===a[t+1]){n[lispToCamel(a.substring(t+2,a.length-1))]=c;continue}}switch(typeof c){case"string":n.textContent=c;break;case"boolean":!1===c&&(e=!0);break;case"object":if(null===c)continue;t.customObjProcessor(a,c,t);break;case"symbol":(t.host||t)[c]=n;case"undefined":continue}}const i=e||"true"===n.dataset.deleteMe?n:void 0,a=n[NextMatch],c=n;n=c[SkipSibs]?null:void 0!==a?closestNextSib(n,a):n.nextElementSibling,c[SkipSibs]=!1,c[NextMatch]=void 0,void 0!==i&&i.remove()}return!0}const stcRe=/(\-\w)/g;function lispToCamel(t){return t.replace(stcRe,(function(t){return t[1].toUpperCase()}))}function getProp(t,e){let s=t;for(const t of e)if(s=s[t],void 0===s)break;return s}function closestNextSib(t,e){let s=t.nextElementSibling;for(;null!==s;){if(s.matches(e))return s;s=s.nextElementSibling}return null}function doNextStepSelect(t){const e=t.Transform;if(void 0===e.Select)return;let s=t.target.querySelector(e.Select);if(null===s)return;const i=!!e.MergeTransforms;let n=e.Transform||t.previousTransform;if(i&&e.Transform){const s=e.Transform;n=Object.assign({},s),void 0!==t.previousTransform&&i&&Object.assign(n,t.previousTransform)}const o=copyCtx(t);t.Transform=n,t.target=s,processEl(t),restoreCtx(t,o)}function doNextStepSibling(t){const e=t.Transform,s=t.target;s[SkipSibs]=e.SkipSibs||s[SkipSibs],s[NextMatch]=void 0===s[NextMatch]?e.NextMatch:s[NextMatch]+", "+e.NextMatch}function getRHS(t,e){switch(typeof t){case"undefined":case"string":case"symbol":case"boolean":return t;case"function":return getRHS(t(e),e);case"object":if(null===t)return t;if(!Array.isArray(t)||0===t.length)return t;const s=t[0];switch(typeof s){case"object":case"undefined":case"string":return t;case"function":return getRHS([t[0](e),...t.slice(1)],e);case"boolean":return isTemplate(t[1])?t:getRHS(s?t[1]:t[2],e);case"symbol":return e[s].fn(e,t)}case"number":return t.toString()}}function stamp(t,e,s,i){const n=i.host||i.cache;Array.from(t.getRootNode().querySelectorAll(`[${e}]`)).forEach(t=>{const i=t.getAttribute(e),o=s[i];void 0!==o&&(n[o]=t)})}function fromTuple(t,e){stamp(t.target,"id",e[1],t),stamp(t.target,"part",e[1],t)}const templStampSym=Symbol.for("Dd5nJwRNaEiFtfam5oaSkg"),plugin={fn:fromTuple,sym:templStampSym};function createTemplate(t,e,s){const i=void 0!==e&&void 0!==s,n=void 0!==e?e.cache?e.cache:e:void 0;if(i&&void 0!==n[s])return n[s];const o=document.createElement("template");return o.innerHTML=t,i&&(n[s]=o),o}const debounce=(t,e)=>{let s;return function(){const functionCall=()=>t.apply(this,arguments);clearTimeout(s),s=setTimeout(functionCall,e)}};function hydrate(t){return class extends t{constructor(){super(...arguments),this.__conn=!1}attr(t,e,s){if(void 0===e)return this.getAttribute(t);if(!this.__conn)return void 0===this.__attribQueue&&(this.__attribQueue=[]),void this.__attribQueue.push({name:t,val:e,trueVal:s});this[(e?"set":"remove")+"Attribute"](t,s||e)}__propUp(t){const e=this.constructor.defaultValues;t.forEach(t=>{let s=this[t];void 0===s&&void 0!==e&&(s=e[t]),this.hasOwnProperty(t)&&delete this[t],void 0!==s&&(this[t]=s)})}connectedCallback(){this.__conn=!0;const t=this.constructor.props;this.__propUp([...t.bool,...t.str,...t.num,...t.obj]),void 0!==this.__attribQueue&&(this.__attribQueue.forEach(t=>{this.attr(t.name,t.val,t.trueVal)}),this.__attribQueue=void 0)}}}function XtallatX(t){var e;return(e=class extends t{constructor(){super(...arguments),this.__evCount={},this.self=this,this._xlConnected=!1,this.__propActionQueue=new Set}static get evalPath(){return lispToCamel$1(this.is)}static get observedAttributes(){const t=this.props;return[...t.bool,...t.num,...t.str,...t.jsonProp].map(t=>camelToLisp(t))}static get props(){if(void 0===this.is)return{};if(void 0===this[this.evalPath]){const t=deconstruct(this.attributeProps),e={};t.forEach(t=>{e[t]=t}),this[this.evalPath]=this.attributeProps(e);const s=this[this.evalPath];propCategories.forEach(t=>{s[t]=s[t]||[]})}let t=this[this.evalPath];const e=Object.getPrototypeOf(this).props;return void 0!==e&&(t=mergeProps(t,e)),t}__to$(t){const e=t%2;return(t-e)/2+"-"+e}__incAttr(t){const e=this.__evCount;t in e?e[t]++:e[t]=0,this.attr("data-"+t,this.__to$(e[t]))}onPropsChange(t){let e=!1;const s=this.constructor[propInfoSym];if(Array.isArray(t))t.forEach(t=>{this.__propActionQueue.add(t);const i=s[t];void 0!==i&&i.async&&(e=!0)});else{this.__propActionQueue.add(t);const i=s[t];void 0!==i&&i.async&&(e=!0)}!this.disabled&&this._xlConnected&&(this.disabled||(e?this.__processActionDebouncer():this.__processActionQueue()))}attributeChangedCallback(t,e,s){this[atrInit]=!0;const i=this[ignoreAttrKey];if(void 0!==i&&!0===i[t])return void delete i[t];const n=lispToCamel$1(t),o="_"+n,r=this,a=this.constructor.props;if(a.str.includes(n))r[o]=s;else if(a.bool.includes(n))r[o]=null!==s;else if(a.num.includes(n))r[o]=parseFloat(s);else if(a.jsonProp.includes(n))try{r[o]=JSON.parse(s)}catch(t){r[o]=s}this.onPropsChange(n)}connectedCallback(){super.connectedCallback(),this._xlConnected=!0,this.__processActionDebouncer(),this.onPropsChange("")}[de](t,e,s=!1){if(this.disabled)return;const i=t+(s?"":"-changed");let n=!1,o=!1,r=!1;if(void 0!==this.eventScopes){const t=this.eventScopes.find(t=>void 0===t[0]||t[0].startsWith(i));void 0!==t&&(n="bubbles"===t[1],r="cancelable"===t[2],o="composed"===t[3])}const a=new CustomEvent(i,{detail:e,bubbles:n,composed:o,cancelable:r});return this.dispatchEvent(a),this.__incAttr(i),a}get __processActionDebouncer(){return void 0===this.___processActionDebouncer&&(this.___processActionDebouncer=debounce((t=!1)=>{this.__processActionQueue()},16)),this.___processActionDebouncer}propActionsHub(t){}__processActionQueue(){if(void 0===this.propActions)return;const t=this.__propActionQueue;this.__propActionQueue=new Set,this.propActions.forEach(e=>{const s=deconstruct(e),i=new Set(s);intersection(t,i).size>0&&(this.propActionsHub(e),e(this))})}}).attributeProps=({disabled:t})=>({bool:[t]}),e}const ignoreAttrKey=Symbol(),propInfoSym=Symbol("propInfo"),atrInit=Symbol("atrInit");function define(t){const e=t.is;let s=0,i=!1,n=!1,o=e;do{s>0&&(o=`${e}-${s}`);const r=customElements.get(o);void 0!==r?r===t&&(i=!0,t.isReally=o):(n=!0,t.isReally=o,i=!0),s++}while(!i);if(!n)return;const r=t.props,a=t.prototype,c=[...r.bool,...r.num,...r.str,...r.obj],l=Object.getOwnPropertyNames(a);t[propInfoSym]={},c.forEach(e=>{if(l.includes(e))return;const s="_"+e,i={};propCategories.forEach(t=>{i[t]=r[t].includes(e)}),t[propInfoSym][e]=i,Object.defineProperty(a,e,{get(){return this[s]},set(i){const n=t[propInfoSym][e];if(n.dry&&i===this[s])return;const o=camelToLisp(e);if(n.reflect){if(void 0===this[atrInit]&&this.hasAttribute(o))return;void 0===this[ignoreAttrKey]&&(this[ignoreAttrKey]={}),this[ignoreAttrKey][o]=!0,n.bool?i&&!this.hasAttribute(o)||!1===i?this.attr(o,i,""):this[ignoreAttrKey][o]=!1:n.str?this.attr(o,i):n.num?this.attr(o,i.toString()):n.obj&&this.attr(o,JSON.stringify(i))}this[s]=i,n.log&&console.log(n,i),n.debug,this.onPropsChange(e),n.notify&&this[de](o,{value:i})},enumerable:!0,configurable:!0})}),customElements.define(o,t)}const de=Symbol.for("1f462044-3fe5-4fa8-9d26-c4165be15551");function mergeProps(t,e){const s={};return propCategories.forEach(i=>{s[i]=(t[i]||[]).concat(e[i]||[])}),s}function intersection(t,e){let s=new Set;for(let i of e)t.has(i)&&s.add(i);return s}const ltcRe=/(\-\w)/g;function lispToCamel$1(t){return t.replace(ltcRe,(function(t){return t[1].toUpperCase()}))}const ctlRe=/[\w]([A-Z])/g;function camelToLisp(t){return t.replace(ctlRe,(function(t){return t[0]+"-"+t[1]})).toLowerCase()}const p=Symbol("placeholder");function symbolize(t){for(var e in t)t[e]=Symbol(e)}const propCategories=["bool","str","num","reflect","notify","obj","jsonProp","dry","log","debug","async"],argList=Symbol("argList");function substrBefore(t,e){let s=t.trim(),i=s.indexOf(e);return i>-1?s.substr(0,i):s}function deconstruct(t){if(void 0===t[argList]){const e=t.toString().trim();if(e.startsWith("({")){const s=e.indexOf("})",2);t[argList]=e.substring(2,s).split(",").map(t=>substrBefore(t,":"))}else t[argList]=[]}return t[argList]}const _transformDebouncer=Symbol(),transformDebouncer=Symbol();class XtalElement extends(XtallatX(hydrate(HTMLElement))){constructor(){super(...arguments),this.noShadow=!1,this._renderOptions={},this._mainTemplateProp="mainTemplate",this.__initRCIP=!1,this._propChangeQueue=new Set}get renderOptions(){return this._renderOptions}initRenderCallback(t,e){}get root(){return this.noShadow?this:(null==this.shadowRoot&&this.attachShadow({mode:"open"}),this.shadowRoot)}afterInitRenderCallback(t,e,s){}afterUpdateRenderCallback(t,e,s){}async initRenderContext(){const t=await this.plugins();this.transformHub(this.initTransform);const e="function"==typeof this.initTransform;e&&void 0===this.__initTransformArgs&&(this.__initTransformArgs=new Set(deconstruct(this.initTransform)));const s={Transform:e?this.initTransform(this):this.initTransform,host:this,cache:this.constructor,mode:"init"};return Object.assign(s,t),s.ctx=s,s}async plugins(){const{doObjectMatch:t,repeateth:e,interpolateSym:s,interpolatePlugin:i,templStampSym:n,templStampPlugin:o}=await import("./standardPlugins-81bb50b0.js");return{customObjProcessor:t,repeatProcessor:e,[s]:i,[n]:o}}get[transformDebouncer](){return void 0===this[_transformDebouncer]&&(this[_transformDebouncer]=debounce((t=!1)=>{this.transform()},16)),this[_transformDebouncer]}transformHub(t){}async transform(){if(this.__initRCIP)return;const t=this.readyToRender;let e=!1;if(!1===t)return;"string"==typeof t&&t!==this._mainTemplateProp&&(this.root.innerHTML="",this._renderContext=void 0),void 0===this.updateTransforms?this.root.innerHTML="":this.__initTransformArgs&&intersection(this._propChangeQueue,this.__initTransformArgs).size>0&&(this.root.innerHTML="",delete this._renderContext,e=!0);let s,i=this._renderContext,n=!0;if(void 0===i?(this.dataset.upgraded="true",this.__initRCIP=!0,i=this._renderContext=await this.initRenderContext(),i.options={initializedCallback:this.afterInitRenderCallback.bind(this)},s=this[this._mainTemplateProp].content.cloneNode(!0),await transform(s,i),delete i.options.initializedCallback,this.__initRCIP=!1):(s=this.root,n=!1),void 0!==this.updateTransforms){const t=this._propChangeQueue;this._propChangeQueue=new Set,this.updateTransforms.forEach(async n=>{const o=deconstruct(n),r=new Set(o);(e||intersection(t,r).size>0)&&(this._renderOptions.updatedCallback=this.afterUpdateRenderCallback.bind(this),this.transformHub(n),i.Transform=n(this),await transform(s,i))})}n&&this.root.appendChild(s)}async onPropsChange(t,e=!1){super.onPropsChange(t),this._propChangeQueue.add(t),!this.disabled&&this._xlConnected&&this.readyToInit&&(e||await this.transform())}}class XtalRoomWithAView extends XtalElement{constructor(){super(),this._state="constructed",this.__controller=new AbortController,this.__signal=this.__controller.signal}get viewModel(){return this._viewModel}set viewModel(t){this._viewModel=t,this[de]("view-model",{value:t}),this.onPropsChange("viewModel")}async onPropsChange(t,e=!1){if(await super.onPropsChange(t,void 0===this.viewModel),!super.disabled&&this._xlConnected&&this.readyToInit)switch(this._state){case"constructed":return this._state="initializing",void this.initViewModel(this).then(t=>{this._state="initialized",this.viewModel=t});case"initializing":break;case"initialized":this.refreshViewModel&&deconstruct(this.refreshViewModel).includes(t)?(this._state="refreshing",this.refreshViewModel(this).then(t=>{this._state="refreshed",this.viewModel=t})):deconstruct(this.initViewModel).includes(t)&&(this._state="refreshing",this.initViewModel(this).then(t=>{this._state="refreshed",this.viewModel=t}))}}}function getFullURL(t,e){let s=e;const i=t.baseLinkId;if(void 0!==i){const t=self[i];t&&(s=t.href+s)}return s}class XtalFetchViewElement extends XtalRoomWithAView{constructor(){super(...arguments),this.as="json",this.initViewModel=({href:t,reqInit:e})=>new Promise(s=>{fetch(getFullURL(this,t),e).then(t=>t[this.as]().then(t=>{s(this.filterInitData(t))}))})}filterInitData(t){return t}filterUpdateData(t){return t}get readyToInit(){return!(this.disabled||void 0===this.href||this.reqInitRequired&&void 0===this.reqInit)}}XtalFetchViewElement.is="xtal-fetch-view-element",XtalFetchViewElement.attributeProps=({href:t,reqInit:e,reqInitRequired:s,baseLinkId:i,viewModel:n})=>({str:[t,i],obj:[e,n],jsonProp:[e],bool:[s],reflect:[t,s]});const debounce$1=(t,e)=>{let s;return function(){const functionCall=()=>t.apply(this,arguments);clearTimeout(s),s=setTimeout(functionCall,e)}};function XtallatX$1(t){var e;return(e=class extends t{constructor(){super(...arguments),this.__evCount={},this.self=this,this._xlConnected=!1,this.__propActionQueue=new Set}static get evalPath(){return lispToCamel$2(this.is)}static get observedAttributes(){const t=this.props;return[...t.bool,...t.num,...t.str,...t.jsonProp].map(t=>camelToLisp$1(t))}static get props(){if(void 0===this.is)return{};if(void 0===this[this.evalPath]){const t=deconstruct$1(this.attributeProps),e={};t.forEach(t=>{e[t]=t}),this[this.evalPath]=this.attributeProps(e);const s=this[this.evalPath];propCategories$1.forEach(t=>{s[t]=s[t]||[]})}let t=this[this.evalPath];const e=Object.getPrototypeOf(this).props;return void 0!==e&&(t=mergeProps$1(t,e)),t}__to$(t){const e=t%2;return(t-e)/2+"-"+e}__incAttr(t){const e=this.__evCount;t in e?e[t]++:e[t]=0,this.attr("data-"+t,this.__to$(e[t]))}onPropsChange(t){let e=!1;const s=this.constructor[propInfoSym$1];if(Array.isArray(t))t.forEach(t=>{this.__propActionQueue.add(t);const i=s[t];void 0!==i&&i.async&&(e=!0)});else{this.__propActionQueue.add(t);const i=s[t];void 0!==i&&i.async&&(e=!0)}!this.disabled&&this._xlConnected&&(this.disabled||(e?this.__processActionDebouncer():this.__processActionQueue()))}attributeChangedCallback(t,e,s){this[atrInit$1]=!0;const i=this[ignoreAttrKey$1];if(void 0!==i&&!0===i[t])return void delete i[t];const n=lispToCamel$2(t),o="_"+n,r=this,a=this.constructor.props;if(a.str.includes(n))r[o]=s;else if(a.bool.includes(n))r[o]=null!==s;else if(a.num.includes(n))r[o]=parseFloat(s);else if(a.jsonProp.includes(n))try{r[o]=JSON.parse(s)}catch(t){r[o]=s}this.onPropsChange(n)}connectedCallback(){super.connectedCallback(),this._xlConnected=!0,this.__processActionDebouncer(),this.onPropsChange("")}[de$1](t,e,s=!1){if(this.disabled)return;const i=t+(s?"":"-changed");let n=!1,o=!1,r=!1;if(void 0!==this.eventScopes){const t=this.eventScopes.find(t=>void 0===t[0]||t[0].startsWith(i));void 0!==t&&(n="bubbles"===t[1],r="cancelable"===t[2],o="composed"===t[3])}const a=new CustomEvent(i,{detail:e,bubbles:n,composed:o,cancelable:r});return this.dispatchEvent(a),this.__incAttr(i),a}get __processActionDebouncer(){return void 0===this.___processActionDebouncer&&(this.___processActionDebouncer=debounce$1((t=!1)=>{this.__processActionQueue()},16)),this.___processActionDebouncer}__processActionQueue(){if(void 0===this.propActions)return;const t=this.__propActionQueue;this.__propActionQueue=new Set,this.propActions.forEach(e=>{const s=deconstruct$1(e),i=new Set(s);intersection$1(t,i).size>0&&e(this)})}}).attributeProps=({disabled:t})=>({bool:[t]}),e}const ignoreAttrKey$1=Symbol(),propInfoSym$1=Symbol("propInfo"),atrInit$1=Symbol("atrInit");function define$1(t){const e=t.is;let s=0,i=!1,n=!1,o=e;do{s>0&&(o=`${e}-${s}`);const r=customElements.get(o);void 0!==r?r===t&&(i=!0,t.isReally=o):(n=!0,t.isReally=o,i=!0),s++}while(!i);if(!n)return;const r=t.props,a=t.prototype,c=[...r.bool,...r.num,...r.str,...r.obj],l=Object.getOwnPropertyNames(a);t[propInfoSym$1]={},c.forEach(e=>{if(l.includes(e))return;const s="_"+e,i={};propCategories$1.forEach(t=>{i[t]=r[t].includes(e)}),t[propInfoSym$1][e]=i,Object.defineProperty(a,e,{get(){return this[s]},set(i){const n=t[propInfoSym$1][e];if(n.dry&&i===this[s])return;const o=camelToLisp$1(e);if(n.reflect){if(void 0===this[atrInit$1]&&this.hasAttribute(o))return;void 0===this[ignoreAttrKey$1]&&(this[ignoreAttrKey$1]={}),this[ignoreAttrKey$1][o]=!0,n.bool?i&&!this.hasAttribute(o)||!1===i?this.attr(o,i,""):this[ignoreAttrKey$1][o]=!1:n.str?this.attr(o,i):n.num?this.attr(o,i.toString()):n.obj&&this.attr(o,JSON.stringify(i))}this[s]=i,n.log&&console.log(n,i),n.debug,this.onPropsChange(e),n.notify&&this[de$1](o,{value:i})},enumerable:!0,configurable:!0})}),customElements.define(o,t)}const de$1=Symbol.for("1f462044-3fe5-4fa8-9d26-c4165be15551");function mergeProps$1(t,e){const s={};return propCategories$1.forEach(i=>{s[i]=(t[i]||[]).concat(e[i]||[])}),s}function intersection$1(t,e){let s=new Set;for(let i of e)t.has(i)&&s.add(i);return s}const ltcRe$1=/(\-\w)/g;function lispToCamel$2(t){return t.replace(ltcRe$1,(function(t){return t[1].toUpperCase()}))}const ctlRe$1=/[\w]([A-Z])/g;function camelToLisp$1(t){return t.replace(ctlRe$1,(function(t){return t[0]+"-"+t[1]})).toLowerCase()}const propCategories$1=["bool","str","num","reflect","notify","obj","jsonProp","dry","log","debug","async"],argList$1=Symbol("argList");function deconstruct$1(t){if(void 0===t[argList$1]){const e=t.toString().trim();if(e.startsWith("({")){const s=e.indexOf("})",2);t[argList$1]=e.substring(2,s).split(",").map(t=>t.trim())}else t[argList$1]=[]}return t[argList$1]}function hydrate$1(t){return class extends t{constructor(){super(...arguments),this.__conn=!1}attr(t,e,s){if(void 0===e)return this.getAttribute(t);if(!this.__conn)return void 0===this.__attribQueue&&(this.__attribQueue=[]),void this.__attribQueue.push({name:t,val:e,trueVal:s});this[(e?"set":"remove")+"Attribute"](t,s||e)}__propUp(t){const e=this.constructor.defaultValues;t.forEach(t=>{let s=this[t];void 0===s&&void 0!==e&&(s=e[t]),this.hasOwnProperty(t)&&delete this[t],void 0!==s&&(this[t]=s)})}connectedCallback(){this.__conn=!0;const t=this.constructor.props;this.__propUp([...t.bool,...t.str,...t.num,...t.obj]),void 0!==this.__attribQueue&&(this.__attribQueue.forEach(t=>{this.attr(t.name,t.val,t.trueVal)}),this.__attribQueue=void 0)}}}function createNestedProp(t,e,s,i){const n=e.shift(),o=t[n],r={[n]:o||{}};let a=r[n];const c=e.pop();if(e.forEach(t=>{let e=a[t];e||(e=a[t]={}),a=e}),a[c]&&"object"==typeof s?Object.assign(a[c],s):void 0===c?r[n]=s:a[c]=s,i)try{Object.assign(t,r)}catch(t){}}function WithPath(t){return class extends t{wrap(t,e={}){return this.withPath?(createNestedProp(e,this.withPath.split("."),t,!0),e):t}}}function getProp$1(t,e,s){let i=t,n=!0;return e.forEach(t=>{if(i&&""!==t){if(n&&"target"===t&&null===i.target)i=s._trigger;else switch(typeof t){case"string":i=i[t];break;default:i=i[t[0]].apply(i,t[1])}n=!1}}),i}class P extends(WithPath(XtallatX$1(hydrate$1(HTMLElement)))){constructor(){super(...arguments),this._s=null,this.propActions=[({val:t,self:e})=>{null!==t&&(e._s=e.getSplit(t))}],this._lastEvent=null}getSplit(t){return"."===t?[]:t.split(".")}getPreviousSib(){const t=this.observe;let e=this;for(;e&&(null!=t&&!e.matches(t)||e.hasAttribute("on"));)e=e.previousElementSibling,null===e&&(e=this.parentElement);return e}connectedCallback(){this.style.display="none",super.connectedCallback()}init(){this.attchEvListnrs(),this.doFake()}nudge(t){const e=t.getAttribute("disabled");null!==e&&(0===e.length||"1"===e?t.removeAttribute("disabled"):t.setAttribute("disabled",(parseInt(e)-1).toString()))}attchEvListnrs(){if(this._bndHndlEv)return;this._bndHndlEv=this._hndEv.bind(this);const t=void 0===this._trigger?this.getPreviousSib():this._trigger;t&&(this._trigger=t,t.addEventListener(this.on,this._bndHndlEv,{capture:this.capture}),t===this.parentElement&&this.ifTargetMatches?t.querySelectorAll(this.ifTargetMatches).forEach(t=>{this.nudge(t)}):this.nudge(t))}doFake(){if(!this.ifTargetMatches&&!this.skipInit){let t=this._lastEvent;t||(t={target:this.getPreviousSib(),isFake:!0}),this._hndEv&&this._hndEv(t)}}filterEvent(t){return void 0===this.ifTargetMatches||t.target.matches(this.ifTargetMatches)}_hndEv(t){this.log&&console.log("handlingEvent",this,t),this.debug,t&&this.filterEvent(t)&&(t.stopPropagation&&!this.noblock&&t.stopPropagation(),this._lastEvent=t,this.async?setTimeout(()=>{Object.assign(t,{isFake:!0,target:this.getPreviousSib()}),this.pass(t)}):this.pass(t))}valFromEvent(t){let e=null!==this._s?getProp$1(t,this._s,this):getProp$1(t,["target","value"],this);switch(void 0===e&&"string"==typeof this.val&&t.target.hasAttribute(this.val)&&(e=t.target.getAttribute(this.val)),this.parseValAs){case"bool":e="true"===e;break;case"int":e=parseInt(e);break;case"float":e=parseFloat(e);break;case"date":e=new Date(e);break;case"truthy":e=!!e;break;case"falsy":e=!e}return e}injectVal(t,e){this.commit(e,this.valFromEvent(t),t)}setVal(t,e,s,i){switch(typeof i){case"symbol":this.setProp(t,i,e);break;default:if(i.startsWith(".")){const s=i.substr(1),n=void 0===e&&null===e?"remove":"add";t.classList[n](s)}else if(void 0!==this.withPath){const s=t[i],n=this.wrap(e,{});t[i]="object"==typeof s&&null!==s?{...s,...n}:n}else void 0!==s&&this.hasAttribute("as-attr")?this.setAttr(t,s,e):this.setProp(t,i,e)}}setAttr(t,e,s){t.setAttribute(e,s.toString())}setProp(t,e,s){t[e]=s}commit(t,e,s){if(void 0===e)return;let i,n=this.prop;if(void 0===n)if(void 0!==this.propFromEvent)n=getProp$1(s,this.propFromEvent.split("."),t);else{const t=(this.careOf||this.to).split("["),e=t.length;if(e>1){const s=t[e-1].replace("]","");(s.startsWith("-")||s.startsWith("data-"))&&(i=s.split("-").slice(1).join("-"),n=lispToCamel$2(i))}}void 0!==t.hasAttribute&&t.hasAttribute("debug");let o=t;if(this.proxyId){const t=Symbol.for(this.proxyId);void 0===o[t]&&(o[t]={}),o=o[t]}this.setVal(o,e,i,n),this.fireEvent&&t.dispatchEvent(new CustomEvent(this.fireEvent,{detail:this.getDetail(e),bubbles:!0}))}getDetail(t){return{value:t}}detach(t){t.removeEventListener(this.on,this._bndHndlEv)}disconnectedCallback(){const t=this.getPreviousSib();t&&this._bndHndlEv&&this.detach(t)}}class NavDown{constructor(t,e,s,i,n,o=null,r=50){this.seed=t,this.match=e,this.careOf=s,this.notify=i,this.max=n,this.ignore=o,this.mutDebounce=r,this._inMutLoop=!1}init(){this.addMutObs(this.seed.parentElement),this.sync(),this.notify(this)}addMutObs(t){if(null===t)return;const e=[];this._mutObs=new MutationObserver(t=>{this._inMutLoop=!0,t.forEach(t=>{t.addedNodes.forEach(t=>{if(1===t.nodeType){const s=t;s.dataset.__pdWIP="1",e.push(s)}})}),e.forEach(t=>delete t.dataset.__pdWIP),this.sync(),this._inMutLoop=!1,this.notify(this)}),this._mutObs.observe(t,{childList:!0})}sibCheck(t,e){}sync(t=0){const e="function"==typeof this.match;this.matches=[];let s=this._sis?this.seed:this.seed.nextElementSibling;for(;null!==s;){if(null===this.ignore||!s.matches(this.ignore)){if(e?this.match(s):s.matches(this.match)){const e=void 0!==this.careOf?Array.from(s.querySelectorAll(this.careOf)):[s];if(null!==e&&(this.matches=this.matches.concat(e),++t>=this.max))return}this.sibCheck(s,t)}s=s.nextElementSibling}}disconnect(){this._mutObs.disconnect()}}class PD extends P{constructor(){super(...arguments),this._pdNavDown=null,this._iIP=!1}pass(t){this._lastEvent=t,this.attr("pds","🌩️");this.applyProps(this._pdNavDown);this.attr("pds","👂")}getMatches(t){return t.matches}applyProps(t){if(this._iIP)return 0;if(null===this._lastEvent)return;const e=this.getMatches(t);e.forEach(e=>{t._inMutLoop&&"1"!==e.dataset.__pdWIP||this.injectVal(this._lastEvent,e)});const s=e.length;return this.attr("mtch",s.toString()),s}newNavDown(){const t=this.applyProps.bind(this);let e=this._trigger||this;if(void 0!==this.from&&(e=e.closest(this.from),null===e))throw this.from+" not found.";return new NavDown(e,this.to,this.careOf,t,this.m)}connectedCallback(t){this._trigger=t,super.connectedCallback(),this.attr("pds","📞"),this.to||(this.to="*",this.m=1);const e=this.newNavDown();this._iIP=!0,e.init(),this._iIP=!1,this._pdNavDown=e,this.init()}}PD.is="p-d",PD.attributeProps=({disabled:t,on:e,to:s,careOf:i,noblock:n,val:o,prop:r,ifTargetMatches:a,m:c,from:l,observe:d,fireEvent:h,skipInit:u,debug:f,log:m,withPath:b,async:g,propFromEvent:v,capture:y,parseValAs:_,proxyId:w})=>{const S=[t,n,u,f,m,g,y],T=[c],E=[e,s,i,o,r,a,l,d,h,b,v,_,w];return{bool:S,num:T,str:E,reflect:[...S,...T,...E]}},define$1(PD);const mainTemplate=createTemplate("\n  <style>\n      :host{\n          display:block;\n      }\n      label{\n          display:block;\n      }\n  </style>\n  <label for=myInput part=label></label>\n  <input id=myInput part=input>\n"),[label$,input$]=[Symbol("label"),Symbol("input")],initTransform=({self:t})=>({label:label$,input:[{},{input:t.handleInput},,,input$]}),updateLabel=({name:t})=>({[label$]:t+":"}),updateInput=({readOnly:t,inputType:e,disabled:s,value:i})=>({[input$]:[{},,{readonly:t,type:e,disabled:s,value:i}]}),updateTransforms=[updateLabel,updateInput],linkInputType=({type:t,self:e})=>{switch(t){case"boolean":e.inputType="checkbox";break;case"number":e.inputType="number";break;case"string":e.inputType="text"}},linkEditedValue=({value:t,self:e})=>{e.editedValue=t};class SwagTagPrimitiveBase extends XtalElement{constructor(){super(),this.readyToInit=!0,this.mainTemplate=mainTemplate,this.readyToRender=!0,this.initTransform=initTransform,this.propActions=[linkInputType,linkEditedValue],this.updateTransforms=updateTransforms,this.eventScopes=[[,"bubbles"]]}handleInput(t){this.editedValue=t.target.value}}async function preemptiveImport(t){const e=t[3]||{};t[3]=e;let s=t[0];if(void 0!==s){"function"==typeof s&&(s=s(e)),e.path=s;const i=self[s];if(void 0===i){if("loading"===document.readyState)return void document.addEventListener("DOMContentLoaded",e=>{preemptiveImport(t)})}else if("link"===i.localName){if("true"===i.dataset.loaded)return;switch(i.rel){case"modulelazyload":case"modulepreload":{const t=document.createElement("script");return t.type="module",t.integrity=i.integrity,t.src=i.href,t.crossOrigin=i.crossOrigin,document.head.appendChild(t),void(i.dataset.loaded="true")}case"lazyload":case"preload":switch(i.as){case"script":{const t=document.createElement("script");return t.integrity=i.integrity,t.crossOrigin=i.crossOrigin,t.src=i.href,document.head.appendChild(t),void(i.dataset.loaded="true")}case"style":{const t=document.createElement("link");return t.rel="stylesheet",t.integrity=i.integrity,t.crossOrigin=i.crossOrigin,t.href=i.href,void document.head.appendChild(t)}}}}}const i=t[1];switch(typeof i){case"function":try{const t=await i(e);return void("string"==typeof t&&await import(t))}catch(t){}}let n=t[2];const o=t[4]||{cssScope:"na"};if(void 0===n)throw`Unable to resolve ${s} and ${i.toString()}`;if("function"==typeof n&&(n=n(e)),void 0!==o&&"na"!==o.cssScope){const t=o.cssScope;if(void 0!==t){const e=document.createElement("link");switch(e.rel="stylesheet",e.href=n,t){case"global":document.head.appendChild(e);break;case"shadow":o.host.appendChild(e)}}else import(n)}else import(n)}SwagTagPrimitiveBase.is="swag-tag-primitive-base",SwagTagPrimitiveBase.attributeProps=({readOnly:t,type:e,testValues:s,value:i,disabled:n,eventScopes:o,name:r,description:a,inputType:c,editedValue:l})=>({bool:[t,n],async:[t,c,n,i],str:[e,i,r,a,c,l],notify:[l],obj:["default",s,o],jsonProp:[o],reflect:[t,e,n,r,c]}),define(SwagTagPrimitiveBase);const loadedTags=new Set;let addedCssObserveImport=!1;function conditionalImport(t,e){doManualCheck(t,e),"loading"===document.readyState&&document.addEventListener("DOMContentLoaded",s=>{doManualCheck(t,e)});const s=[];for(const t in e)loadedTags.has(t)||s.push(t);if(0===s.length)return;const i=s.join(","),n=document.createElement("css-observe");n.observe=!0,n.selector=i,n.addEventListener("latest-match-changed",t=>{const s=t.detail.value;e[s.localName].forEach(t=>{preemptiveImport(t)})}),9===t.nodeType?t.appendChild(n):t.insertAdjacentElement("afterend",n),addedCssObserveImport||(addedCssObserveImport=!0,preemptiveImport(["css-observe/css-observe.js",()=>import("./css-observe-2befc5fc.js"),({path:t})=>`//unpkg.com/${t}?module`,,]))}function doManualCheck(t,e){let s=11===t.nodeType?t:t.getRootNode();9===s.nodeType&&(s=document.firstElementChild);for(const t in e){const i=e[t],n=parseTag(t);for(const t of n)loadedTags.has(t)||null!==s.querySelector(t)&&(loadedTags.add(t),i.forEach(t=>{preemptiveImport(t)}))}}const re=/\{([^)]+)\}/g;function parseTag(t){const e=t.split(re);if(1===e.length)return[t];if(3===e.length){return e[1].split("|").map(t=>`${e[0]}${t}${e[2]}`)}console.error(e)}const json_viewer="json-viewer",mainTemplate$1=createTemplate("\n<style>\ndetails{\n    max-height: 300px;\n    overflow-y:auto;\n}\n</style>\n<details open>\n    <summary>Event History</summary>\n    <json-viewer -object></json-viewer>\n</details>\n"),jsonViewer=Symbol(json_viewer),details=Symbol("details"),initTransform$1={details:{[json_viewer]:jsonViewer},'"':[{style:{display:"none"}},,,,details]},allowList=["detail","type","bubbles","cancelBubble","cancelable","composed","defaultPrevented","eventPhase","isTruted","returnValue","timeStamp"],appendToEventArchive=({newEvent:t,self:e})=>{if(console.log(t),conditionalImport(e.shadowRoot,{[json_viewer]:[["@power-elements/json-viewer/json-viewer.js",()=>import("./json-viewer-89013c5c.js"),({path:t})=>`//unpkg.com/${t}?module`,,]]}),void 0===t)return;const s={};allowList.forEach(e=>{s[e]=t[e]}),void 0===e.eventArchive&&(e.eventArchive={eventHistory:[]}),e.eventArchive.eventHistory.unshift(s),e.eventArchive=e.eventArchive},bindJsonViewer=({eventArchive:t})=>({[jsonViewer]:[{object:t}],[details]:[{style:{display:"block"}}]}),updateTransforms$1=[bindJsonViewer];class JsonEventViewer extends XtalElement{constructor(){super(...arguments),this.readyToInit=!0,this.mainTemplate=mainTemplate$1,this.readyToRender=!0,this.initTransform=initTransform$1,this.propActions=[appendToEventArchive],this.updateTransforms=updateTransforms$1}}JsonEventViewer.is="json-event-viewer",JsonEventViewer.attributeProps=({newEvent:t,eventArchive:e})=>({obj:[t,e]}),define(JsonEventViewer);const mainTemplate$2=createTemplate("\n  <style>\n      :host{\n          display:block;\n      }\n      label{\n          display:block\n      }\n  </style>\n  <main>\n    <label for=myInput part=label></label>\n    <xtal-editor key=root part=xtalEditor></xtal-editor>\n  </main>\n"),uiRefs={label:Symbol("label"),xtalEditor:Symbol("xtalEditor")},initTransform$2=({self:t,handleChange:e})=>({":host":[templStampSym,uiRefs],'"':({target:t})=>{conditionalImport(t,{"xtal-editor":[["xtal-editor/src/xtal-editor.js",()=>import("./xtal-editor-0ffa33a3.js"),({path:t})=>`//unpkg.com/${t}?module`,,]]})},[uiRefs.xtalEditor]:[{},{"parsed-object-changed":e}]}),updateLabel$1=({name:t})=>({[uiRefs.label]:[{textContent:t+":"}]}),updateJsonEditor=({value:t,name:e})=>({[uiRefs.xtalEditor]:[{value:t}]}),linkParsedObject=({value:t,self:e})=>{try{const s=JSON.parse(t);e.parsedObject=s}catch(t){}},propActions=[linkParsedObject,linkInputType];class SwagTagJsonEditor extends SwagTagPrimitiveBase{constructor(){super(...arguments),this.propActions=propActions,this.mainTemplate=mainTemplate$2,this.initTransform=initTransform$2,this.updateTransforms=[updateLabel$1,updateJsonEditor]}handleChange(t){this.parsedObject=t.target.parsedObject}}SwagTagJsonEditor.is="swag-tag-json-editor",SwagTagJsonEditor.attributeProps=({parsedObject:t})=>({obj:[t],notify:[t]}),define(SwagTagJsonEditor);const mainTemplate$3=createTemplate('\n<style id=0f0d62e5-0d00-4e70-ad90-277fcd94c963>\n  fieldset[data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963"]>legend{\n    cursor: pointer;\n  }\n  fieldset[data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963"][data-open="false"]>[part="scrollableArea"]{\n    display: none;\n  }\n  fieldset[data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963"][data-open="true"]>[part="scrollableArea"]{\n    max-height: 500px;\n    overflow-y:auto;\n    display:flex;\n    flex-direction: column;\n  }\n</style>\n<main>\n\x3c!-- pass down edited values / parsed objects to demo component --\x3e\n<p-d on=edited-value-changed to=section -care-of val=target.editedValue prop-from-event=target.name m=1 skip-init></p-d>\n<p-d on=parsed-object-changed to=section -care-of val=target.parsedObject prop-from-event=target.name m=1 skip-init></p-d>\n<header part=header>\n</header>\n<section part=section>\n  <div part=componentHolder>\n    <div part=componentListeners></div>\n  </div>\n</section>\n<json-event-viewer -new-event part=jsonEventViewer></json-event-viewer>\n<form part=propsEditor>\n  <fieldset data-open="true" data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963" part=fieldset>\n    <legend part=legend><span part=action>Edit</span> <var part=componentName></var>\'s properties</legend>\n    <div part=scrollableArea>\n    </div>\n  </fieldset>\n</form>\n\n<details part=viewSchema>\n  <summary>View Schema</summary>\n  <json-viewer part=jsonViewer allowlist="name,properties,attributes,slots,events"></json-viewer>\n</details>\n\n</main>\n'),eventListenerForJsonViewer=createTemplate(`\n<p-d from=section to=${JsonEventViewer.is}[-new-event] val=. skip-init m=1></p-d>\n`),uiRefs$1={componentName:p,header:p,componentHolder:p,componentListeners:p,jsonViewer:p,fieldset:p,scrollableArea:p,legend:p};symbolize(uiRefs$1);const initTransform$3=({self:t,tag:e})=>({":host":[templStampSym,uiRefs$1],[uiRefs$1.legend]:[{},{click:t.toggleForm}],main:{"[-care-of]":e}}),bindName=({name:t,innerTemplate:e})=>({[uiRefs$1.header]:`<${t}>`,[uiRefs$1.componentName]:t,[uiRefs$1.componentHolder]:[t,"afterBegin"],[more]:{[uiRefs$1.componentHolder]:{[t]:({target:t})=>{void 0!==e&&t.appendChild(e.content.cloneNode(!0))}}}}),addEventListeners=({events:t,name:e})=>({[uiRefs$1.componentListeners]:[t||[],eventListenerForJsonViewer,,{[PD.is]:({item:t})=>[{observe:e,on:t.name}]}]}),copyPropInfoIntoEditor=({item:t,target:e})=>{Object.assign(e,t),e.setAttribute("role","textbox")},copyPropInfoIntoEditors={[`${SwagTagPrimitiveBase.is},${SwagTagJsonEditor.is}`]:copyPropInfoIntoEditor},addEditors=({massagedProps:t,name:e})=>({[uiRefs$1.scrollableArea]:[t||[],({item:t})=>t.editor,,copyPropInfoIntoEditors]}),bindSelf=({attribs:t,self:e})=>({[uiRefs$1.jsonViewer]:[{object:e}]}),updateTransforms$2=[bindName,addEventListeners,addEditors,bindSelf],linkWcInfo=({viewModel:t,tag:e,self:s})=>{if(void 0===e||void 0===t)return;conditionalImport(s,{"json-viewer":[["@power-elements/json-viewer/json-viewer.js",()=>import("./json-viewer-89013c5c.js"),({path:t})=>`//unpkg.com/${t}?module`,,]]});const i=t.tags.find(t=>t.name===e);i.attribs=i.attributes,delete i.attributes,Object.assign(s,i)};function adjustValueAndType(t){let e=t.default,s=void 0;if(void 0!==e){try{e=JSON.parse(e),s=JSON.parse("["+t.type.replace(/\|/g,",")+"]")}catch(t){}if(Array.isArray(s))return t.value=e,t.type="stringArray",void(t.options=s);switch(typeof e){case"object":t.value=t.default,t.type="object";break;case"string":t.value=e,t.type="string";break;case"number":t.value=e,t.type="number";break;case"boolean":t.value=e,t.type="boolean";break;default:t.value=t.default,t.type="object"}}else switch(t.type){case"string":case"boolean":case"number":break;default:t.type="object"}}const massaged=Symbol(),linkMassagedProps=({properties:t,self:e,block:s})=>{void 0===t||t[massaged]||(t.forEach(t=>{adjustValueAndType(t);const e=t;switch(t.type){case"string":case"number":case"boolean":e.editor=SwagTagPrimitiveBase.is;break;case"object":e.editor=SwagTagJsonEditor.is;break;default:throw"not implemented"}}),t[massaged]=!0,e.massagedProps=void 0!==s?t.filter(t=>!s.includes(t.name)):t)},linkInnerTemplate=({useInnerTemplate:t,self:e})=>{if(!t)return;const s=e.querySelector("template");null!==s?e.innerTemplate=s:setTimeout(()=>{linkInnerTemplate(e)},50)},triggerImportReferencedModule=({path:t,self:e,skipImports:s})=>{if(void 0!==t&&!s)if(e.href.indexOf("//")>-1&&e.href.indexOf("//")<7){const t=e.href.split("/");t.pop();const s=t.join("/")+e.path.substring(1)+"?module";import(s)}else{const t=(location.origin+location.pathname).split("/");t.pop();let s=e.path;for(;s.startsWith("../");)t.pop(),s=s.substr(3);const i=t.join("/")+"/"+s;import(i)}},showHideEditor=({editOpen:t,self:e})=>{e[uiRefs$1.fieldset].dataset.open=(t||!1).toString()};class SwagTag extends XtalFetchViewElement{constructor(){super(...arguments),this.noShadow=!0,this.mainTemplate=mainTemplate$3,this.readyToRender=!0,this.propActions=[linkWcInfo,linkMassagedProps,triggerImportReferencedModule,showHideEditor,linkInnerTemplate],this.initTransform=initTransform$3,this.updateTransforms=updateTransforms$2,this.skipImports=!1}toggleForm(t){this.editOpen=!this.editOpen}}SwagTag.is="swag-tag",SwagTag.attributeProps=({tag:t,name:e,properties:s,path:i,events:n,slots:o,testCaseNames:r,attribs:a,editOpen:c,block:l,useInnerTemplate:d,innerTemplate:h,skipImports:u})=>mergeProps({str:[t,e,i],bool:[c,d,u],obj:[s,n,o,r,a,l,h],jsonProp:[l],reflect:[t,c]},XtalFetchViewElement.props),define(SwagTag);export{showHideEditor as A,SwagTag as S,XtalElement as X,copyCtx as a,doNextStepSelect as b,createTemplate as c,define as d,doNextStepSibling as e,processEl as f,getProp as g,processSymbols as h,isTemplate as i,transform as j,plugin as k,bindName as l,addEventListeners as m,copyPropInfoIntoEditor as n,addEditors as o,p,bindSelf as q,restoreCtx as r,symbolize as s,templStampSym as t,uiRefs$1 as u,linkWcInfo as v,adjustValueAndType as w,linkMassagedProps as x,linkInnerTemplate as y,triggerImportReferencedModule as z};