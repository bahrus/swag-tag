import {html} from 'xtal-element/lib/html.js';
import {SwagTagBaseProps} from '../types.d.js';
import('wc-info/wc-info-fetch.js');
import('pass-prop/p-p.js');
import('pass-down/p-d.js');
import('xtal-fragment/xtal-fragment.js');
export {xc} from 'xtal-element/lib/XtalCore.js';
export {html} from 'xtal-element/lib/html.js';
import {def} from 'd-fine/def.js';

const mainTemplate = html`
    <wc-info-fetch href={{href}} tag={{tag}}></wc-info-fetch>
    <template id=editor>
        <div>Create a template in sub-classes, and <a href=https://github.com/bahrus/swag-tag/blob/baseline/lib/swag-tag-demo.js>set the "editor" property</a> equal to the template you want displayed.</div>
    </template>
    <xtal-fragment copy from=editor></xtal-fragment>
    <!-- <a href= -->
`;

export const SwagTagBase = def(mainTemplate, {
    as:'swag-tag-base',
    sp:['tag', 'href'],
});
export interface SwagTagBase extends SwagTagBaseProps{};



