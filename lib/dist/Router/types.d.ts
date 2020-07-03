import { Key } from 'path-to-regexp';
import { ParsedQuery } from 'query-string';
export interface RouteSettingsObject {
    path: string;
    component: any;
    name?: string;
    children?: RouteSettingsObject[];
    meta?: any;
}
export interface Route extends RouteSettingsObject {
    regexpPath: RegExp;
    pathKeys: Key[];
    nestingDepth: number;
    id: string;
    parentId: string | null;
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
    routes: RouteSettingsObject[];
}
export declare type HookCommand = string | false | true;
export declare type Callback = (...args: any[]) => void;
