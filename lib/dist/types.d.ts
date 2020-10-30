import { Key } from 'path-to-regexp';
import { ParsedQuery } from 'query-string';
export declare type RouteComponent = any;
export declare type NamedComponentsSet = {
    [key: string]: RouteComponent;
};
export interface Route {
    path?: string;
    component?: RouteComponent;
    components?: NamedComponentsSet;
    name?: string;
    regexpPath?: RegExp;
    pathKeys?: Key[] | string[];
    children?: Route[];
    nestingDepth?: number;
    id?: string;
    parentId?: string | null;
    meta?: any;
    beforeEnter?: RouterHook;
}
export interface RouteObject {
    params: {
        [key: string]: string;
    };
    query: ParsedQuery<string>;
    name?: string;
    fullPath?: string;
    meta?: any;
}
export interface RouterSettings {
    mode: string;
    base?: string;
    routes: Route[];
}
export declare type HookCommand = string | false | true;
export declare type Callback = (...args: any[]) => void;
export declare type RouterHook = (to: Route, from: Route, next: (command?: HookCommand) => void) => void;
