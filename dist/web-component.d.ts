import { L as Language } from './types-D09QxsWl.js';

declare class KhAddressInput extends HTMLElement {
    private input;
    private dropdown;
    private results;
    private activeIndex;
    private debounceTimer?;
    static get observedAttributes(): string[];
    get language(): Language;
    get maxResults(): number;
    get value(): string;
    set value(v: string);
    connectedCallback(): void;
    attributeChangedCallback(name: string, _old: string, val: string): void;
    private onInput;
    private onKeyDown;
    private selectItem;
    private buildSelection;
    private renderResults;
    private openDropdown;
    private closeDropdown;
}
declare function register(tagName?: string): void;

export { KhAddressInput, register };
