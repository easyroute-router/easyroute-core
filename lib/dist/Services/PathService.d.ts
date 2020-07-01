import { Route } from '../Router/types';
export default class PathService<T> {
    private readonly pathToRegexp;
    private parsePaths;
    getPathInformation(routes: Route<T>[]): Route<T>[];
    static stripBase(url: string, base: string): string;
    static constructUrl(url: string, base: string): string;
}
