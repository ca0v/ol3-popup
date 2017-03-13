import ol = require("openlayers");
import { Paging } from "./paging";

const classNames = {
    prev: 'btn-prev',
    next: 'btn-next',
    hidden: 'hidden',
    active: 'active',
    inactive: 'inactive',
    pagenum: "page-num"
};

const eventNames = {
    show: "show",
    hide: "hide",
    prev: "prev",
    next: "next"
};

// ie11 compatible
function toggle(e: HTMLElement, className: string, toggle = false) {
    !toggle ? e.classList.remove(className) : e.classList.add(className);
}

/**
 * The prior + next paging buttons and current page indicator
 */
export default class PageNavigator extends ol.Observable {

    private domNode: HTMLElement;
    prevButton: HTMLButtonElement;
    nextButton: HTMLButtonElement;
    pageInfo: HTMLSpanElement;

    constructor(public options: { pages: Paging }) {
        super();
        let pages = options.pages;

        this.domNode = document.createElement("div");
        this.domNode.classList.add("pagination");
        this.domNode.innerHTML = this.template();

        this.prevButton = <HTMLButtonElement>this.domNode.getElementsByClassName(classNames.prev)[0];
        this.nextButton = <HTMLButtonElement>this.domNode.getElementsByClassName(classNames.next)[0];
        this.pageInfo = <HTMLSpanElement>this.domNode.getElementsByClassName(classNames.pagenum)[0];

        pages.options.popup.domNode.appendChild(this.domNode);
        this.prevButton.addEventListener('click', () => this.dispatchEvent(eventNames.prev));
        this.nextButton.addEventListener('click', () => this.dispatchEvent(eventNames.next));

        pages.on("goto", () => pages.count > 1 ? this.show() : this.hide());
        pages.on("clear", () => this.hide());

        pages.on("goto", () => {
            let index = pages.activeIndex;
            let count = pages.count;
            let canPrev = 0 < index;
            let canNext = count - 1 > index;
            toggle(this.prevButton, classNames.inactive, !canPrev);
            toggle(this.prevButton, classNames.active, canPrev);
            toggle(this.nextButton, classNames.inactive, !canNext);
            toggle(this.nextButton, classNames.active, canNext);
            this.prevButton.disabled = !canPrev;
            this.nextButton.disabled = !canNext;
            this.pageInfo.innerHTML = `${1 + index} of ${count}`;
        });
    }

    template() {
        return `<button class="arrow btn-prev"></button><span class="page-num">m of n</span><button class="arrow btn-next"></button>`;
    }

    hide() {
        this.domNode.classList.add(classNames.hidden);
        this.dispatchEvent(eventNames.hide);
    }

    show() {
        this.domNode.classList.remove(classNames.hidden);
        this.dispatchEvent(eventNames.show);
    }
}
