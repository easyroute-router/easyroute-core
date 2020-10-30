import { Route } from '../types';
export default class PathService {
    private parsePaths;
    getPathInformation(routes: Route[]): Route[];
    static stripBase(url: string, base: string): string;
    static constructUrl(url: string, base: string): string;
}
