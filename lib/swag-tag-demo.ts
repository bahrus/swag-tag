import {SwagTagBase, xc, html} from './swag-tag-base.js';

const altTemplate = html `
<div>I am here</div>I
`;

export class SwagTagDemo extends SwagTagBase{
    static is = 'swag-tag-demo';
    editor = altTemplate;
}
xc.define(SwagTagDemo);