import {WCInfo} from 'wc-info/wc-info.js';
import {define} from 'trans-render/define.js';

export class SwagTag extends WCInfo{
    static get is(){return 'swag-tag';}
}
define(SwagTag);