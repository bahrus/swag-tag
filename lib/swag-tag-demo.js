import { SwagTagBase, xc, html } from './swag-tag-base.js';
const altTemplate = html `
<div>I am here</div>I
`;
export class SwagTagDemo extends SwagTagBase {
    constructor() {
        super(...arguments);
        this.editor = altTemplate;
    }
}
SwagTagDemo.is = 'swag-tag-demo';
xc.define(SwagTagDemo);
