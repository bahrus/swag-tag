import{c as createTemplate,s as symbolize,X as XtalElement,d as define,p,t as templStampSym}from"./swag-tag-5ddf449b.js";const mainTemplate=createTemplate('\n    <slot part=slotPart></slot>\n    <div class="remove" part=remove>Remove item by deleting a property name.\n    \n    </div>\n    <div data-type=string part=editor>\n        <div part=field class=field>\n            <button part=expander class="expander nonPrimitive">+</button><input part=key><input part=value class=value>\n            <div part=childInserters class="nonPrimitive childInserters" data-open=false>\n                <button part=objectAdder class=objectAdder>add object</button>\n                <button part=stringAdder class=stringAdder>add string</button>\n                <button part=boolAdder class=boolAdder>add bool</button>\n                <button part=numberAdder class=numberAdder>add number</button>\n                \n            </div>\n            <button class=copyBtn part=copyToClipboard><img class=copy alt="Copy to Clipboard" src="https://cdn.jsdelivr.net/npm/xtal-editor/src/copy.svg"></button>\n        </div>\n        <div part=childEditors class="nonPrimitive childEditors" data-open=false></div>\n        \n    </div>\n    <style>\n        :host{\n            display:block;\n        }\n        slot{\n            display: none;\n        }\n        .expander{\n            width: fit-content;\n            height: fit-content;\n            padding-left: 0px;\n            padding-right: 0px;\n            width:20px;\n        }\n        .copy{\n            height: 16px;\n        }\n        .copyBtn{\n            width: fit-content;\n            height: fit-content;\n            padding-left: 0px;\n            padding-right: 0px;\n            padding-top: 0px;\n            padding-bottom: 0px;\n            border: 0;\n        }\n        .objectAdder{\n            background-color: #E17000;\n        }\n        .stringAdder{\n            background-color: #009408;\n        }\n        .boolAdder{\n            background-color: #B1C639;\n        }\n        .numberAdder{\n            background-color: #497B8D;\n        }\n        .childInserters button{\n            color: white;\n            text-shadow:1px 1px 1px black;\n            border-radius: 5px;\n            padding: 2;\n            border: none;\n        }\n        .remove{\n            padding: 2px 4px;\n            -webkit-border-radius: 5px;\n            -moz-border-radius: 5px;\n            border-radius: 5px;\n            color: white;\n            font-weight: bold;\n            text-shadow: 1px 1px 1px black;\n            background-color: black;\n        }\n\n        .field{\n            display:flex;\n            flex-direction:row;\n            line-height: 20px;\n            margin-top: 2px;\n            align-items: center;\n        }\n        .childInserters{\n            display: flex;\n            justify-content: center;\n        }\n        .childEditors{\n            margin-left: 25px;\n        }\n        div[part="childEditors"][data-open="false"]{\n            display: none;\n        }\n        [data-type="object"] button.nonPrimitive{\n            display: inline;\n        }\n        [data-type="object"] div.nonPrimitive[data-open="true"]{\n            display: block;\n        }\n        [data-type="array"] button.nonPrimitive{\n            display: inline;\n        }\n        [data-type="array"] div.nonPrimitive[data-open="true"]{\n            display: block;\n        }\n        [data-type="string"] .nonPrimitive{\n            display: none;\n        }\n        [data-type="number"] .nonPrimitive{\n            display: none;\n        }\n        [data-type="boolean"] .nonPrimitive{\n            display: none;\n        }\n        [data-type="string"] [part="key"]{\n            background-color: rgb(0, 148, 8);\n        }\n        [data-type="boolean"] [part="key"]{\n            background-color: #B1C639;\n        }\n        [data-type="object"] [part="key"]{\n            background-color: rgb(225, 112, 0);\n        }\n        [data-type="number"] [part="key"]{\n            background-color: rgb(73, 123, 141);\n        }\n        [data-type="array"] [part="key"]{\n            background-color: rgb(45, 91, 137);\n        }\n        .value{\n            background-color: #ECF3C3;\n            flex-grow: 5;\n        }\n\n        input {\n            border: none;\n            -webkit-border-radius: 5px;\n            -moz-border-radius: 5px;\n            border-radius: 5px;\n            padding: 3px;\n            margin-right: 2px;\n        }\n\n    </style>\n'),refs={boolAdder:p,childEditors:p,copyToClipboard:p,editor:p,expander:p,key:p,objectAdder:p,slotPart:p,stringAdder:p,remove:p,numberAdder:p,value:p};symbolize(refs);const initTransform=({self:e,type:t,hasParent:n})=>({":host":[templStampSym,refs],[refs.expander]:[{},{click:e.toggle}],[refs.key]:[{},{change:[e.handleKeyChange,"value"]}],[refs.value]:[{},{change:[e.handleValueChange,"value"]}],[refs.objectAdder]:[{},{click:e.addObject}],[refs.stringAdder]:[{},{click:e.addString}],[refs.boolAdder]:[{},{click:e.addBool}],[refs.numberAdder]:[{},{click:e.addNumber}],[refs.remove]:!n,[refs.copyToClipboard]:[{},{click:e.copyToClipboard}],[refs.slotPart]:[{},{slotchange:e.handleSlotChange}]}),updateTransforms=[({type:e})=>({[refs.editor]:[{dataset:{type:e}}]}),({value:e})=>({[refs.value]:[{value:e}]}),({uiValue:e})=>({[refs.value]:[void 0===e?void 0:{value:e}]}),({key:e})=>({[refs.key]:[{value:e}]}),({childValues:e,type:t,self:n})=>({[refs.childEditors]:[e,XtalEditor.is,,({target:e,item:t,idx:r})=>{if(e){switch(typeof t){case"object":e.key=t.key,e.value=t.value;break;default:e.value=t,e.key=r.toString()}e.hasParent=!0,e.addEventListener("internal-update-count-changed",e=>{n.upwardDataFlowInProgress=!0})}}]}),({open:e})=>({[refs.expander]:e?"-":"+",[refs.childEditors]:[{dataset:{open:(!!e).toString()}}]})],linkTypeAndParsedObject=({value:e,self:t})=>{let n=e;if(void 0!==e)if("true"===e||"false"===e)t.type="boolean";else if(isNaN(e))try{n=JSON.parse(e),Array.isArray(n)?t.type="array":t.type="object"}catch(e){t.type="string"}else t.type="number";t.parsedObject=n},link_ParsedObject=({uiValue:e,self:t})=>{if(void 0!==e)switch(t.type){case"object":case"array":t._parsedObject=JSON.parse(e),t._value=e,t.dispatchEvent(new CustomEvent("parsed-object-changed",{detail:{value:t._parsedObject}}))}};function toString(e){switch(typeof e){case"string":return e;case"number":case"boolean":return e.toString();case"object":return JSON.stringify(e)}}const linkChildValues=({parsedObject:e,type:t,self:n})=>{if(void 0!==e)switch(t){case"array":n.childValues=e.map(e=>toString(e));break;case"object":const t=[];for(var r in e)t.push({key:r,value:toString(e[r])});return void(n.childValues=t)}else n.childValues=void 0},linkValueFromChildren=({upwardDataFlowInProgress:e,self:t,type:n})=>{if(!e)return;const r=Array.from(t.shadowRoot.querySelectorAll(XtalEditor.is));switch(n){case"object":{const e={};r.forEach(t=>{e[t.key]=t.parsedObject}),t.uiValue=JSON.stringify(e)}break;case"array":{const e=[];r.forEach(t=>{e.push(t.parsedObject)}),t.uiValue=JSON.stringify(e)}}t.incrementUpdateCount(),t.upwardDataFlowInProgress=!1},addObject=({objCounter:e,self:t})=>{if(void 0===e)return;t.open=!0;const n={...t.parsedObject};n["object"+e]={},t.value=JSON.stringify(n)},addString=({strCounter:e,self:t})=>{if(void 0===e)return;const n={...t.parsedObject};n["string"+e]="val"+e,t.value=JSON.stringify(n),t.open=!0},addBool=({boolCounter:e,self:t})=>{if(void 0===e)return;const n={...t.parsedObject};n["bool"+e]="false",t.value=JSON.stringify(n),t.open=!0},addNumber=({numberCounter:e,self:t})=>{if(void 0===e)return;const n={...t.parsedObject};n["number"+e]="0",t.value=JSON.stringify(n),t.open=!0},propActions=[linkTypeAndParsedObject,linkChildValues,linkValueFromChildren,addObject,addString,addBool,addNumber,link_ParsedObject];class XtalEditor extends XtalElement{constructor(){super(...arguments),this.readyToInit=!0,this.readyToRender=!0,this.mainTemplate=mainTemplate,this.initTransform=initTransform,this.updateTransforms=updateTransforms,this.propActions=propActions,this.actionCount=0}handleKeyChange(e){""===e&&this.remove(),this.value=e}handleValueChange(e){this.value=e,this.incrementUpdateCount()}incrementUpdateCount(){this.internalUpdateCount=void 0===this.internalUpdateCount?0:this.internalUpdateCount+1}copyToClipboard(){this[refs.value].select(),document.execCommand("copy")}toggle(){this.open=!this.open}propActionsHub(e){}transformHub(e){}addObject(){this.objCounter=void 0===this.objCounter?1:this.objCounter+1}addString(){this.strCounter=void 0===this.strCounter?1:this.strCounter+1}addBool(){this.boolCounter=void 0===this.boolCounter?1:this.boolCounter+1}addNumber(){this.numberCounter=void 0===this.numberCounter?1:this.numberCounter+1}handleSlotChange(e){e.target.assignedNodes().forEach(e=>{const t=e;void 0!==t.value&&(this.value=t.value)})}}XtalEditor.is="xtal-editor",XtalEditor.formAssociated=!0,XtalEditor.attributeProps=({value:e,uiValue:t,type:n,parsedObject:r,key:a,childValues:o,upwardDataFlowInProgress:i,internalUpdateCount:d,open:s,objCounter:l,strCounter:c,boolCounter:u,numberCounter:b,hasParent:h})=>({bool:[i,s,h],dry:[n,r,e,h],num:[d,l,c,u,b],str:[e,n,a,t],jsonProp:[e],obj:[r,o],notify:[d,r]}),define(XtalEditor);export{XtalEditor};