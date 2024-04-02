export as namespace bootstrap;

import Alert from "./types/alert";
import Button from "./types/button";
import Carousel from "./types/carousel";
import Collapse from "./types/collapse";
import Dropdown from "./types/dropdown";
import Modal from "./types/modal";
import Offcanvas from "./types/offcanvas";
import Popover from "./types/popover";
import ScrollSpy from "./types/scrollspy";
import Tab from "./types/tab";
import Toast from "./types/toast";
import Tooltip from "./types/tooltip";

declare global {
    interface JQuery {
        alert: Alert.jQueryInterface;
        button: Button.jQueryInterface;
        carousel: Carousel.jQueryInterface;
        collapse: Collapse.jQueryInterface;
        dropdown: Dropdown.jQueryInterface;
        tab: Tab.jQueryInterface;
        modal: Modal.jQueryInterface;
        offcanvas: Offcanvas.jQueryInterface;
        [Popover.NAME]: Popover.jQueryInterface;
        scrollspy: ScrollSpy.jQueryInterface;
        toast: Toast.jQueryInterface;
        [Tooltip.NAME]: Tooltip.jQueryInterface;
    }

    interface Element {
        addEventListener(
            type: Carousel.Events | "slide.bs.carousel" | "slid.bs.carousel",
            listener: (this: Element, ev: Carousel.Event) => any,
            options?: boolean | AddEventListenerOptions,
        ): void;

        addEventListener(
            type:
                | Modal.Events
                | "show.bs.modal"
                | "shown.bs.modal"
                | "hide.bs.modal"
                | "hidden.bs.modal"
                | "hidePrevented.bs.modal",
            listener: (this: Element, ev: Modal.Event) => any,
            options?: boolean | AddEventListenerOptions,
        ): void;
    }
}

export { Alert, Button, Carousel, Collapse, Dropdown, Modal, Offcanvas, Popover, ScrollSpy, Tab, Toast, Tooltip };
