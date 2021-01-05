### v1.3.2
* Fallback to "hash" mode by default;
* fixed dependabot alert.

### v1.3.1
* Base url feature fixed;
* path sanitizing for routes;
* a bit of refactoring (size reducing and speed up).

### v1.3.0
* Size reduced from ~26kb raw to ~16kb raw;
* types are in root dedicated file now;
* some services are replaced with functions;
* multiple code optimize; 
* fixed problem with route base url in history mode.

### v1.2.1
* Detecting enviroment (for SSR reasons);
* typed `utils` module.

### v1.2.0
* Removed `url-join` module;
* `path-to-regexp` replaced with `regexparam`;
* `tsconfig.json`: target changed do "es2018", module chaged to "es2015";
* lib file size reduced from 69.7kb to 26.4kb (x2.6)

### v1.1.0
* `beforeEnter` hook for each route - individual hooks yeah!
* named routes support via `components` key in route object;
* methods for dynamic routes downloading are now in separated modules;
* implemented `lint-staged`.

### v1.0.2
* Core is now downloading dynamic modules by itself, without bindings outlets;
* fixed premature after hook trigger when dynamic component is downloading;
* initializers for router modes are now in separated modules;
* reorganized file system.

### v1.0.1
* Separated file for utils methods for better module system.

### v1.0.0
* Launched separated module;
* component type inherits any for different libs compatibility.