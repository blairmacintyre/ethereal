import { Matrix4 } from "three/src/math/Matrix4";
export declare function path(el: HTMLElement, rootNode?: HTMLElement): string;
export declare function hash(el: HTMLElement): void;
export declare function traverseChildElements(element: Element, each: (element: Element, level: number) => boolean, bind?: any, level?: number): void;
export declare function addCSSRule(sheet: any, selector: string, rules: string, index: number): void;
export declare class Bounds {
    left: number;
    top: number;
    width: number;
    height: number;
    copy(rect: Bounds): this;
}
export declare class Edges {
    left: number;
    top: number;
    right: number;
    bottom: number;
    copy(rect: Edges): this;
}
export declare function getBounds(element: Element, bounds?: Bounds, referenceElement?: Element): Bounds | undefined;
export declare function getMargin(element: Element, margin: Edges): void;
export declare function getBorder(element: Element, border: Edges): void;
export declare function getPadding(element: Element, padding: Edges): void;
export declare function getViewportBounds(bounds: Bounds): Bounds;
export declare function getDocumentBounds(document: Document, bounds: Bounds): Bounds;
export declare function toDOM(html: string): Element;
export declare const downloadBlob: (blob: Blob, filename: string) => void;
export declare function parseCSSTransform(computedStyle: CSSStyleDeclaration, width: number, height: number, pixelSize: number, out?: Matrix4): Matrix4 | null;
