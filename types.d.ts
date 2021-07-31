import {XtalPattern} from 'xtal-element/types.d.js';
import { ClassField, CustomElement } from './node_modules/custom-elements-manifest/schema.js';
export interface SwagTagBaseProps extends XtalPattern, HTMLElement {
    href: string | undefined;
    tag: string | undefined;
    // customElement: CustomElement | undefined;
    // editor: HTMLTemplateElement | undefined;
    // fields: EnhancedClassField[];
}
// export interface EnhancedClassField extends ClassField{
//     val: any;
// }