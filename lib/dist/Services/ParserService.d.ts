import { Route } from '../types';
export default class ParserService {
    private routes;
    constructor(routes: Route[]);
    parse(url: string): Route[];
}
