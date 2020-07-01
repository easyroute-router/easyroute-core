import { Route } from '../Router/types';
export default class HashBasedRouting<T> {
    private routes;
    constructor(routes: Route<T>[]);
    parse(url: string): Route<T>[];
}
