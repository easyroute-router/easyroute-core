"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var query_string_1 = __importDefault(require("query-string"));
var UrlParametersParser = /** @class */ (function () {
    function UrlParametersParser() {
    }
    UrlParametersParser.getQueryParams = function (queryString) {
        return query_string_1.default.parse(queryString);
    };
    UrlParametersParser.getPathParams = function (matchedRoute, url) {
        var pathValues = matchedRoute.regexpPath.exec(url);
        pathValues = pathValues.slice(1, pathValues.length);
        var urlParams = {};
        for (var pathPart in pathValues) {
            var value = pathValues[pathPart];
            var key = matchedRoute.pathKeys[pathPart].name;
            if (typeof key !== 'number')
                urlParams[key] = value;
        }
        return urlParams;
    };
    UrlParametersParser.createRouteObject = function (matchedRoutes, url) {
        var _a;
        var depths = matchedRoutes.map(function (route) { return route.nestingDepth; });
        var maxDepth = Math.max.apply(Math, depths);
        var currentMatched = matchedRoutes.find(function (route) { return route.nestingDepth === maxDepth; });
        var _b = url.split('?'), pathString = _b[0], queryString = _b[1];
        if (currentMatched) {
            var pathParams = UrlParametersParser.getPathParams(currentMatched, pathString);
            var queryParams = UrlParametersParser.getQueryParams(queryString);
            return {
                params: pathParams,
                query: queryParams,
                name: currentMatched.name,
                fullPath: url,
                meta: (_a = currentMatched.meta) !== null && _a !== void 0 ? _a : {}
            };
        }
        return {
            params: {},
            query: {}
        };
    };
    return UrlParametersParser;
}());
exports.default = UrlParametersParser;
