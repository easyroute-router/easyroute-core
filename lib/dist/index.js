function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function regexparam (str, loose) {
	if (str instanceof RegExp) return { keys:false, pattern:str };
	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
	arr[0] || arr.shift();

	while (tmp = arr.shift()) {
		c = tmp[0];
		if (c === '*') {
			keys.push('wild');
			pattern += '/(.*)';
		} else if (c === ':') {
			o = tmp.indexOf('?', 1);
			ext = tmp.indexOf('.', 1);
			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
		} else {
			pattern += '/' + tmp;
		}
	}

	return {
		keys: keys,
		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
	};
}

class PathService {
    parsePaths(routes) {
        const allRoutes = [];
        const recursive = (routesArray, parentPath = '', nestingDepth = 0, parentId = null) => {
            routesArray.forEach((el) => {
                if (parentPath.length) {
                    parentPath = parentPath.replace(/\*/g, '');
                    let elPath = el.path;
                    if (elPath != null && elPath[0] !== '/')
                        elPath = `/${elPath}`;
                    el.path =
                        (parentPath[parentPath.length - 1] !== '/' ? parentPath : '') +
                            elPath;
                    el.nestingDepth = nestingDepth;
                }
                else {
                    el.nestingDepth = nestingDepth;
                }
                el.parentId = parentId;
                el.id = generateId();
                allRoutes.push(el);
                if (el.children && el.children.length) {
                    recursive(el.children, el.path, nestingDepth + 1, el.id);
                }
            });
        };
        recursive(routes);
        return allRoutes;
    }
    getPathInformation(routes) {
        const allRoutes = this.parsePaths(routes);
        return allRoutes.map((route) => {
            const { pattern, keys } = regexparam(route.path);
            route.regexpPath = pattern;
            route.pathKeys = keys;
            return route;
        });
    }
    static stripBase(url, base) {
        if (!base)
            return url;
        return url.replace(`${base}/`, '');
    }
    static constructUrl(url, base) {
        if (!base || url.includes(base))
            return url;
        const strippedBase = base.charAt(base.length - 1) === '/' ? base.slice(0, -1) : base;
        const strippedUrl = url.charAt(0) === '/' ? url.slice(1, url.length) : url;
        return `/${strippedBase}/${strippedUrl}`;
    }
}

function getRoutesTreeChain(allRoutes, currentId) {
    const tree = [];
    let currentSeekingIds = currentId;
    const currentRoute = allRoutes.find((route) => route.id === currentSeekingIds);
    do {
        const currentRoute = allRoutes.find((route) => route.id === currentSeekingIds);
        if (currentRoute) {
            const seed = allRoutes.find((route) => route.id === currentRoute.parentId);
            if (seed) {
                tree.push(seed);
                currentSeekingIds = seed.id;
            }
            else {
                currentSeekingIds = null;
            }
        }
        else
            break;
    } while (currentSeekingIds);
    currentRoute && tree.push(currentRoute);
    return tree;
}

function uniqueByIdAndNestingDepth(routesArray) {
    const uniqueIds = [...new Set(routesArray.map((route) => route.id))];
    const uniqueDepths = [
        ...new Set(routesArray.map((route) => route.nestingDepth))
    ];
    const uniqueById = uniqueIds.map((id) => routesArray.find((route) => route.id === id));
    return uniqueDepths.map((depth) => uniqueById.find((route) => route.nestingDepth === depth));
}

class ParserService {
    constructor(routes) {
        this.routes = routes;
    }
    parse(url) {
        const matchedRoutes = this.routes.reduce((total, current) => {
            if (url.match(current.regexpPath))
                total.push(current);
            return total;
        }, []);
        let allMatched = [];
        matchedRoutes.forEach((route) => {
            allMatched = [
                ...allMatched,
                ...getRoutesTreeChain(this.routes, route.id)
            ];
        });
        const unique = uniqueByIdAndNestingDepth(allMatched);
        if (!unique) {
            throw new Error('[Easyroute] No routes matched');
        }
        return unique;
    }
}

class Observable {
    constructor(value) {
        this.value = value;
        this._subscribersQueue = {};
    }
    get getValue() {
        return this.value;
    }
    subscribe(listener) {
        const id = generateId();
        this._subscribersQueue[id] = listener;
        listener(this.getValue);
        return () => {
            delete this._subscribersQueue[id];
        };
    }
    setValue(newValue) {
        this.value = newValue;
        for (const key in this._subscribersQueue) {
            const subscriber = this._subscribersQueue[key];
            subscriber(this.value);
        }
    }
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var strictUriEncode = str => encodeURIComponent(str).replace(/[!'()*]/g, x => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);

var token = '%[a-f0-9]{2}';
var singleMatcher = new RegExp(token, 'gi');
var multiMatcher = new RegExp('(' + token + ')+', 'gi');

function decodeComponents(components, split) {
	try {
		// Try to decode the entire string first
		return decodeURIComponent(components.join(''));
	} catch (err) {
		// Do nothing
	}

	if (components.length === 1) {
		return components;
	}

	split = split || 1;

	// Split the array in 2 parts
	var left = components.slice(0, split);
	var right = components.slice(split);

	return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
}

function decode(input) {
	try {
		return decodeURIComponent(input);
	} catch (err) {
		var tokens = input.match(singleMatcher);

		for (var i = 1; i < tokens.length; i++) {
			input = decodeComponents(tokens, i).join('');

			tokens = input.match(singleMatcher);
		}

		return input;
	}
}

function customDecodeURIComponent(input) {
	// Keep track of all the replacements and prefill the map with the `BOM`
	var replaceMap = {
		'%FE%FF': '\uFFFD\uFFFD',
		'%FF%FE': '\uFFFD\uFFFD'
	};

	var match = multiMatcher.exec(input);
	while (match) {
		try {
			// Decode as big chunks as possible
			replaceMap[match[0]] = decodeURIComponent(match[0]);
		} catch (err) {
			var result = decode(match[0]);

			if (result !== match[0]) {
				replaceMap[match[0]] = result;
			}
		}

		match = multiMatcher.exec(input);
	}

	// Add `%C2` at the end of the map to make sure it does not replace the combinator before everything else
	replaceMap['%C2'] = '\uFFFD';

	var entries = Object.keys(replaceMap);

	for (var i = 0; i < entries.length; i++) {
		// Replace all decoded components
		var key = entries[i];
		input = input.replace(new RegExp(key, 'g'), replaceMap[key]);
	}

	return input;
}

var decodeUriComponent = function (encodedURI) {
	if (typeof encodedURI !== 'string') {
		throw new TypeError('Expected `encodedURI` to be of type `string`, got `' + typeof encodedURI + '`');
	}

	try {
		encodedURI = encodedURI.replace(/\+/g, ' ');

		// Try the built in decoder first
		return decodeURIComponent(encodedURI);
	} catch (err) {
		// Fallback to a more advanced decoder
		return customDecodeURIComponent(encodedURI);
	}
};

var splitOnFirst = (string, separator) => {
	if (!(typeof string === 'string' && typeof separator === 'string')) {
		throw new TypeError('Expected the arguments to be of type `string`');
	}

	if (separator === '') {
		return [string];
	}

	const separatorIndex = string.indexOf(separator);

	if (separatorIndex === -1) {
		return [string];
	}

	return [
		string.slice(0, separatorIndex),
		string.slice(separatorIndex + separator.length)
	];
};

var queryString = createCommonjsModule(function (module, exports) {




const isNullOrUndefined = value => value === null || value === undefined;

function encoderForArrayFormat(options) {
	switch (options.arrayFormat) {
		case 'index':
			return key => (result, value) => {
				const index = result.length;

				if (
					value === undefined ||
					(options.skipNull && value === null) ||
					(options.skipEmptyString && value === '')
				) {
					return result;
				}

				if (value === null) {
					return [...result, [encode(key, options), '[', index, ']'].join('')];
				}

				return [
					...result,
					[encode(key, options), '[', encode(index, options), ']=', encode(value, options)].join('')
				];
			};

		case 'bracket':
			return key => (result, value) => {
				if (
					value === undefined ||
					(options.skipNull && value === null) ||
					(options.skipEmptyString && value === '')
				) {
					return result;
				}

				if (value === null) {
					return [...result, [encode(key, options), '[]'].join('')];
				}

				return [...result, [encode(key, options), '[]=', encode(value, options)].join('')];
			};

		case 'comma':
		case 'separator':
			return key => (result, value) => {
				if (value === null || value === undefined || value.length === 0) {
					return result;
				}

				if (result.length === 0) {
					return [[encode(key, options), '=', encode(value, options)].join('')];
				}

				return [[result, encode(value, options)].join(options.arrayFormatSeparator)];
			};

		default:
			return key => (result, value) => {
				if (
					value === undefined ||
					(options.skipNull && value === null) ||
					(options.skipEmptyString && value === '')
				) {
					return result;
				}

				if (value === null) {
					return [...result, encode(key, options)];
				}

				return [...result, [encode(key, options), '=', encode(value, options)].join('')];
			};
	}
}

function parserForArrayFormat(options) {
	let result;

	switch (options.arrayFormat) {
		case 'index':
			return (key, value, accumulator) => {
				result = /\[(\d*)\]$/.exec(key);

				key = key.replace(/\[\d*\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				}

				if (accumulator[key] === undefined) {
					accumulator[key] = {};
				}

				accumulator[key][result[1]] = value;
			};

		case 'bracket':
			return (key, value, accumulator) => {
				result = /(\[\])$/.exec(key);
				key = key.replace(/\[\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				}

				if (accumulator[key] === undefined) {
					accumulator[key] = [value];
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};

		case 'comma':
		case 'separator':
			return (key, value, accumulator) => {
				const isArray = typeof value === 'string' && value.split('').indexOf(options.arrayFormatSeparator) > -1;
				const newValue = isArray ? value.split(options.arrayFormatSeparator).map(item => decode(item, options)) : value === null ? value : decode(value, options);
				accumulator[key] = newValue;
			};

		default:
			return (key, value, accumulator) => {
				if (accumulator[key] === undefined) {
					accumulator[key] = value;
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};
	}
}

function validateArrayFormatSeparator(value) {
	if (typeof value !== 'string' || value.length !== 1) {
		throw new TypeError('arrayFormatSeparator must be single character string');
	}
}

function encode(value, options) {
	if (options.encode) {
		return options.strict ? strictUriEncode(value) : encodeURIComponent(value);
	}

	return value;
}

function decode(value, options) {
	if (options.decode) {
		return decodeUriComponent(value);
	}

	return value;
}

function keysSorter(input) {
	if (Array.isArray(input)) {
		return input.sort();
	}

	if (typeof input === 'object') {
		return keysSorter(Object.keys(input))
			.sort((a, b) => Number(a) - Number(b))
			.map(key => input[key]);
	}

	return input;
}

function removeHash(input) {
	const hashStart = input.indexOf('#');
	if (hashStart !== -1) {
		input = input.slice(0, hashStart);
	}

	return input;
}

function getHash(url) {
	let hash = '';
	const hashStart = url.indexOf('#');
	if (hashStart !== -1) {
		hash = url.slice(hashStart);
	}

	return hash;
}

function extract(input) {
	input = removeHash(input);
	const queryStart = input.indexOf('?');
	if (queryStart === -1) {
		return '';
	}

	return input.slice(queryStart + 1);
}

function parseValue(value, options) {
	if (options.parseNumbers && !Number.isNaN(Number(value)) && (typeof value === 'string' && value.trim() !== '')) {
		value = Number(value);
	} else if (options.parseBooleans && value !== null && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) {
		value = value.toLowerCase() === 'true';
	}

	return value;
}

function parse(input, options) {
	options = Object.assign({
		decode: true,
		sort: true,
		arrayFormat: 'none',
		arrayFormatSeparator: ',',
		parseNumbers: false,
		parseBooleans: false
	}, options);

	validateArrayFormatSeparator(options.arrayFormatSeparator);

	const formatter = parserForArrayFormat(options);

	// Create an object with no prototype
	const ret = Object.create(null);

	if (typeof input !== 'string') {
		return ret;
	}

	input = input.trim().replace(/^[?#&]/, '');

	if (!input) {
		return ret;
	}

	for (const param of input.split('&')) {
		let [key, value] = splitOnFirst(options.decode ? param.replace(/\+/g, ' ') : param, '=');

		// Missing `=` should be `null`:
		// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
		value = value === undefined ? null : ['comma', 'separator'].includes(options.arrayFormat) ? value : decode(value, options);
		formatter(decode(key, options), value, ret);
	}

	for (const key of Object.keys(ret)) {
		const value = ret[key];
		if (typeof value === 'object' && value !== null) {
			for (const k of Object.keys(value)) {
				value[k] = parseValue(value[k], options);
			}
		} else {
			ret[key] = parseValue(value, options);
		}
	}

	if (options.sort === false) {
		return ret;
	}

	return (options.sort === true ? Object.keys(ret).sort() : Object.keys(ret).sort(options.sort)).reduce((result, key) => {
		const value = ret[key];
		if (Boolean(value) && typeof value === 'object' && !Array.isArray(value)) {
			// Sort object keys, not values
			result[key] = keysSorter(value);
		} else {
			result[key] = value;
		}

		return result;
	}, Object.create(null));
}

exports.extract = extract;
exports.parse = parse;

exports.stringify = (object, options) => {
	if (!object) {
		return '';
	}

	options = Object.assign({
		encode: true,
		strict: true,
		arrayFormat: 'none',
		arrayFormatSeparator: ','
	}, options);

	validateArrayFormatSeparator(options.arrayFormatSeparator);

	const shouldFilter = key => (
		(options.skipNull && isNullOrUndefined(object[key])) ||
		(options.skipEmptyString && object[key] === '')
	);

	const formatter = encoderForArrayFormat(options);

	const objectCopy = {};

	for (const key of Object.keys(object)) {
		if (!shouldFilter(key)) {
			objectCopy[key] = object[key];
		}
	}

	const keys = Object.keys(objectCopy);

	if (options.sort !== false) {
		keys.sort(options.sort);
	}

	return keys.map(key => {
		const value = object[key];

		if (value === undefined) {
			return '';
		}

		if (value === null) {
			return encode(key, options);
		}

		if (Array.isArray(value)) {
			return value
				.reduce(formatter(key), [])
				.join('&');
		}

		return encode(key, options) + '=' + encode(value, options);
	}).filter(x => x.length > 0).join('&');
};

exports.parseUrl = (input, options) => {
	options = Object.assign({
		decode: true
	}, options);

	const [url, hash] = splitOnFirst(input, '#');

	return Object.assign(
		{
			url: url.split('?')[0] || '',
			query: parse(extract(input), options)
		},
		options && options.parseFragmentIdentifier && hash ? {fragmentIdentifier: decode(hash, options)} : {}
	);
};

exports.stringifyUrl = (input, options) => {
	options = Object.assign({
		encode: true,
		strict: true
	}, options);

	const url = removeHash(input.url).split('?')[0] || '';
	const queryFromUrl = exports.extract(input.url);
	const parsedQueryFromUrl = exports.parse(queryFromUrl, {sort: false});

	const query = Object.assign(parsedQueryFromUrl, input.query);
	let queryString = exports.stringify(query, options);
	if (queryString) {
		queryString = `?${queryString}`;
	}

	let hash = getHash(input.url);
	if (input.fragmentIdentifier) {
		hash = `#${encode(input.fragmentIdentifier, options)}`;
	}

	return `${url}${queryString}${hash}`;
};
});
var queryString_1 = queryString.extract;
var queryString_2 = queryString.parse;
var queryString_3 = queryString.stringify;
var queryString_4 = queryString.parseUrl;
var queryString_5 = queryString.stringifyUrl;

class UrlParser {
    static getQueryParams(queryString$1) {
        return queryString.parse(queryString$1);
    }
    static getPathParams(matchedRoute, url) {
        let pathValues = matchedRoute.regexpPath.exec(url);
        pathValues = pathValues.slice(1, pathValues.length);
        const urlParams = {};
        for (let pathPart = 0; pathPart < pathValues.length; pathPart++) {
            const value = pathValues[pathPart];
            const key = matchedRoute.pathKeys[pathPart];
            urlParams[String(key)] = value;
        }
        return urlParams;
    }
    static createRouteObject(matchedRoutes, url) {
        var _a;
        const depths = matchedRoutes.map((route) => route.nestingDepth);
        const maxDepth = Math.max(...depths);
        const currentMatched = matchedRoutes.find((route) => route.nestingDepth === maxDepth);
        const [pathString, queryString] = url.split('?');
        if (currentMatched) {
            const pathParams = UrlParser.getPathParams(currentMatched, pathString);
            const queryParams = UrlParser.getQueryParams(queryString);
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
    }
}

class SilentModeService {
    constructor(firstRoute) {
        this.history = [];
        this.currentHistoryPosition = 0;
        this.appendHistory(firstRoute);
    }
    appendHistory(data) {
        if (Array.isArray(data)) {
            this.history.push(...data);
            this.currentHistoryPosition += data.length;
        }
        else {
            this.history.push(data);
            this.currentHistoryPosition++;
        }
    }
    back() {
        return this.go(-1);
    }
    go(howFar) {
        var _a, _b;
        const goResult = this.currentHistoryPosition + howFar;
        const previousObject = this.history[goResult];
        if (previousObject) {
            this.currentHistoryPosition = goResult;
            return (_a = previousObject === null || previousObject === void 0 ? void 0 : previousObject.fullPath) !== null && _a !== void 0 ? _a : '';
        }
        return (_b = this.history[0].fullPath) !== null && _b !== void 0 ? _b : '';
    }
}

function setHistoryMode() {
    this.parseRoute(`${window.location.pathname}${window.location.search}`, false);
    window.addEventListener('popstate', (ev) => {
        ev.state
            ? this.parseRoute(PathService.stripBase(ev.state.url, this.base), false)
            : this.parseRoute('/', false);
    });
}

function setHashMode() {
    this.parseRoute(PathService.stripBase(window.location.hash, this.base) || '/');
    window.addEventListener('hashchange', () => {
        if (this.ignoreEvents) {
            this.ignoreEvents = false;
            return;
        }
        this.parseRoute(PathService.stripBase(window.location.hash, this.base));
    });
}

async function checkAsyncAndDownload(component) {
    const isAsync = /(\.then)/i.test(component.toString());
    if (!isAsync)
        return component;
    else {
        try {
            const newComponent = await component();
            return newComponent.default;
        }
        catch (e) {
            console.warn(`[Easyroute] caught an error while trying to download async component: "${e.message}"`);
            return component;
        }
    }
}

async function downloadDynamicComponents(matchedRoutes) {
    const nonDynamic = matchedRoutes.map(async (route) => {
        if (route.component) {
            route.component = await checkAsyncAndDownload(route.component);
        }
        if (route.components) {
            for await (const component of Object.entries(route.components)) {
                const [key, value] = component;
                route.components[key] = await checkAsyncAndDownload(value);
            }
        }
        return route;
    });
    return await Promise.all(nonDynamic);
}

/**
 * @description Get durations of CSS transition (enter and leave)
 * @param {string} transitionName
 * @returns {{leavingDuration: number, enteringDuration: number}}
 */

/**
 * @description Is current environment - browser
 * @author flexdinesh/browser-or-node
 * @returns {boolean}
 */
function isBrowser() {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined'
}

const SSR = !isBrowser();
class Router {
    constructor(settings) {
        this.settings = settings;
        this.pathService = new PathService();
        this.routes = [];
        this.ignoreEvents = false;
        this.silentControl = null;
        this.beforeEach = null;
        this.afterEach = null;
        this.currentMatched = new Observable([]);
        this.currentRouteData = new Observable({
            params: {},
            query: {},
            name: ''
        });
        this.routes = this.pathService.getPathInformation(settings.routes);
        this.parser = new ParserService(this.routes);
        if (!SSR) {
            setTimeout(() => {
                this.setParser();
            }, 0);
        }
        else {
            if (this.mode !== 'history')
                throw new Error('[Easyroute] SSR only works with "history" router mode');
        }
    }
    setParser() {
        switch (this.mode) {
            case 'silent':
                this.parseRoute(`${window.location.pathname}${window.location.search}`);
                break;
            case 'history':
                setHistoryMode.apply(this);
                break;
            case 'hash':
            default:
                setHashMode.apply(this);
                break;
        }
    }
    getTo(matched, url) {
        const maxDepth = Math.max(...matched.map((route) => route.nestingDepth));
        const currentRoute = matched.find((route) => route.nestingDepth === maxDepth);
        if (!currentRoute)
            return {
                params: {},
                query: {}
            };
        return Object.freeze(UrlParser.createRouteObject([currentRoute], url));
    }
    getFrom() {
        if (!this.currentMatched.getValue)
            return {
                params: {},
                query: {}
            };
        const current = this.currentMatched.getValue;
        const maxDepth = Math.max(...current.map((route) => route.nestingDepth));
        const currentRoute = current.find((route) => route.nestingDepth === maxDepth);
        if (!currentRoute)
            return {
                params: {},
                query: {}
            };
        const url = this.currentRouteData.getValue.fullPath;
        return Object.freeze(UrlParser.createRouteObject([currentRoute], url));
    }
    changeUrl(url, doPushState = true) {
        if (this.mode === 'hash') {
            window.location.hash = url;
        }
        if (this.mode === 'history' && doPushState && !SSR) {
            window.history.pushState({
                url
            }, 'Test', url);
        }
    }
    async runAllIndividualHooks(matched, to, from) {
        for await (const component of matched) {
            const allow = await this.executeBeforeHook(to, from, component.beforeEnter);
            if (!allow) {
                return false;
            }
        }
        return true;
    }
    async parseRoute(url, doPushState = true) {
        if (this.mode === 'hash' && url.includes('#'))
            url = url.replace('#', '');
        if (this.mode === 'history' && url.includes('#'))
            url = url.replace('#', '');
        const matched = this.parser.parse(url.split('?')[0]);
        if (!matched)
            return;
        const to = this.getTo(matched, url);
        const from = this.getFrom();
        if (this.mode === 'silent' && !this.silentControl) {
            this.silentControl = new SilentModeService(to);
        }
        if (this.silentControl && doPushState) {
            this.silentControl.appendHistory(to);
        }
        const allowNextGlobal = await this.executeBeforeHook(to, from, this.beforeEach);
        const allowNextLocal = await this.runAllIndividualHooks(matched, to, from);
        const allowNext = allowNextGlobal && allowNextLocal;
        if (!allowNext)
            return;
        this.changeUrl(PathService.constructUrl(url, this.base), doPushState);
        this.currentRouteData.setValue(to);
        this.currentMatched.setValue(await downloadDynamicComponents(matched));
        this.afterHook(to, from);
    }
    async navigate(url) {
        this.ignoreEvents = true;
        await this.parseRoute(url);
    }
    async executeBeforeHook(to, from, hook) {
        return new Promise(async (resolve) => {
            const next = (command) => {
                if (command !== null && command !== undefined) {
                    if (command === false)
                        resolve(false);
                    if (typeof command === 'string') {
                        this.parseRoute(command);
                        resolve(false);
                    }
                }
                else {
                    resolve(true);
                }
            };
            if (!hook)
                resolve(true);
            else
                await hook(to, from, next);
        });
    }
    afterHook(to, from) {
        this.afterEach && this.afterEach(to, from);
    }
    async push(data) {
        await this.navigate(data);
    }
    go(howFar) {
        if (this.mode !== 'silent') {
            window.history.go(howFar);
        }
        else {
            this.parseRoute(this.silentControl.go(howFar), false);
        }
    }
    back() {
        this.go(-1);
    }
    get mode() {
        return this.settings.mode;
    }
    get base() {
        var _a;
        return (_a = this.settings.base) !== null && _a !== void 0 ? _a : '';
    }
    get currentRoute() {
        return this.currentRouteData.getValue;
    }
}

export default Router;
