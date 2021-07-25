import {XtalPattern} from 'xtal-element/types.d.js';
export interface SwagTagBaseProps extends XtalPattern, HTMLElement {
    href: string | undefined;
    tag: string | undefined;
}