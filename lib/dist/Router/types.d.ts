import { Key } from 'path-to-regexp';
import { ParsedQuery } from 'query-string';
export interface Route {
    path: string;
    component: any;
    name?: string;
    regexpPath: RegExp;
    pathKeys: Key[];
    children: Route[];
    nestingDepth: number;
    id: string;
    parentId: string | null;
    meta?: any;
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
