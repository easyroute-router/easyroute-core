/**
 * Data to define route
 */
export interface RouteDefineData {
  path: string;
  component?: RouteComponent;
  components?: { [key: string]: RouteComponent };
  name?: string;
  meta?: any;
  beforeEnter?: RouterHook;
  children?: RouteDefineData;
}

/**
 * Parsed route data
 */
export interface RouteMatchData extends RouteDefineData {
  nestingDepth: number;
  id: string;
  parentId: string;
  regexpPath: RegExp;
  pathKeys: string[];
}

/**
 * Data to send into currentRoute and hooks
 */
export interface RouteInfoData {
  fullPath: string;
  params: { [key: string]: string };
  query: ParsedQueryObject;
  name?: string;
  meta?: string;
}

/**
 * Misc declarations
 */

export type RouteComponent = any;

export type NextCallback = (arg?: boolean | string) => void;

export type ParsedQueryObject = {
  [key: string]: string | string[] | null;
};

export type RouterMode = 'hash' | 'history' | 'silent';

export type RouterSettings = {
  mode: RouterMode;
  routes: RouteDefineData[];
  base?: string;
  omitTrailingSlash?: boolean;
};

export type RouterHook = (
  to: RouteInfoData,
  from: RouteInfoData | null,
  next?: NextCallback
) => void | Promise<void>;

export type HookCommand = boolean | string;

export type ObservableListener<T> = (value: T) => void;
