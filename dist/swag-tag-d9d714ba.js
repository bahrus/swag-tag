const SkipSibs = Symbol();
const NextMatch = Symbol();
const more = Symbol.for('e35fe6cb-78d4-48fe-90f8-bf9da743d532');
function transform(sourceOrTemplate, ctx, target = sourceOrTemplate) {
    ctx.ctx = ctx;
    const isATemplate = isTemplate(sourceOrTemplate);
    const source = isATemplate
        ? sourceOrTemplate.content.cloneNode(true)
        : sourceOrTemplate;
    processFragment(source, ctx);
    let verb = "appendChild";
    const options = ctx.options;
    if (options !== undefined) {
        if (options.prepend)
            verb = "prepend";
        const callback = options.initializedCallback;
        if (callback !== undefined)
            callback(ctx, source, options);
    }
    if (isATemplate && target) {
        target[verb](source);
    }
    ctx.mode = 'update';
    return ctx;
}
function isTemplate(test) {
    return test !== undefined && test.localName === 'template' && test.content && (typeof test.content.cloneNode === 'function');
}
function copyCtx(ctx) {
    return Object.assign({}, ctx);
}
function restoreCtx(ctx, originalCtx) {
    return (Object.assign(ctx, originalCtx));
}
function processFragment(source, ctx) {
    const transf = ctx.Transform;
    if (transf === undefined)
        return;
    const transforms = Array.isArray(transf) ? transf : [transf];
    const isInit = ctx.mode === undefined;
    transforms.forEach(transform => {
        const start = { level: 0, idx: 0 };
        if (isInit) {
            start.mode = 'init';
        }
        Object.assign(ctx, start);
        ctx.target = source.firstElementChild;
        ctx.Transform = transform;
        processEl(ctx);
        processSymbols(ctx);
    });
}
function processSymbols(ctx) {
    const transf = ctx.Transform;
    for (const sym of Object.getOwnPropertySymbols(transf)) {
        let transformTemplateVal = transf[sym];
        if (sym === more) {
            ctx.Transform = transformTemplateVal;
            processSymbols(ctx);
            ctx.Transform = transf;
        }
        const newTarget = (ctx[sym] || ctx.host[sym]);
        if (newTarget === undefined)
            continue;
        ctx.target = newTarget;
        while (typeof transformTemplateVal === 'function') {
            transformTemplateVal = transformTemplateVal(ctx);
        }
        switch (typeof (transformTemplateVal)) {
            case 'string':
                newTarget.textContent = transformTemplateVal;
                break;
            case 'object':
                ctx.customObjProcessor('', transformTemplateVal, ctx);
                break;
            case 'boolean':
                if (transformTemplateVal === false)
                    newTarget.remove();
        }
    }
}
function processEl(ctx) {
    const target = ctx.target;
    if (target == null || ctx.Transform === undefined)
        return true;
    if (target.hasAttribute('debug'))
        debugger;
    const keys = Object.keys(ctx.Transform);
    if (keys.length === 0)
        return true;
    const firstCharOfFirstProp = keys[0][0];
    let isNextStep = "SNTM".indexOf(firstCharOfFirstProp) > -1;
    if (isNextStep) {
        doNextStepSelect(ctx);
        doNextStepSibling(ctx);
    }
    let nextElementSibling = target;
    const tm = ctx.Transform;
    let matched = false;
    while (nextElementSibling !== null) {
        if (ctx.itemTagger !== undefined)
            ctx.itemTagger(nextElementSibling);
        let removeNextElementSibling = false;
        for (let i = 0, ii = keys.length; i < ii; i++) {
            const key = keys[i];
            if (key === 'debug') {
                debugger;
                continue;
            }
            if (key.startsWith('"')) {
                if (!matched)
                    continue;
            }
            else {
                let modifiedSelector = key;
                if (key === ':host') {
                    if (nextElementSibling !== ctx.host) {
                        matched = false;
                    }
                }
                else if (key.startsWith(':has(>')) {
                    const query = key.substring(6, key.length - 1);
                    let foundMatch = false;
                    for (let i = 0, ii = nextElementSibling.children.length; i < ii; i++) {
                        const el = nextElementSibling.children[i];
                        if (el.matches(query)) {
                            foundMatch = true;
                            break;
                        }
                    }
                    if (!foundMatch) {
                        matched = false;
                        continue;
                    }
                }
                else {
                    if (key.endsWith('Part')) {
                        modifiedSelector = `[part="${key.substring(0, key.length - 4)}"]`;
                    }
                    if (!nextElementSibling.matches(modifiedSelector)) {
                        matched = false;
                        continue;
                    }
                }
            }
            matched = true;
            ctx.target = nextElementSibling;
            const tvo = getRHS(tm[key], ctx);
            if (key.endsWith(']')) {
                //TODO use named capture group reg expression
                const pos = key.lastIndexOf('[');
                if (pos > -1 && key[pos + 1] === '-') {
                    const propName = lispToCamel(key.substring(pos + 2, key.length - 1));
                    nextElementSibling[propName] = tvo;
                    continue;
                }
            }
            switch (typeof tvo) {
                case 'string':
                    nextElementSibling.textContent = tvo;
                    break;
                case 'boolean':
                    if (tvo === false)
                        removeNextElementSibling = true;
                    break;
                case 'object':
                    if (tvo === null)
                        continue;
                    ctx.customObjProcessor(key, tvo, ctx);
                    break;
                case 'symbol':
                    const cache = ctx.host || ctx;
                    cache[tvo] = nextElementSibling;
                case 'undefined':
                    continue;
            }
        }
        const elementToRemove = (removeNextElementSibling || nextElementSibling.dataset.deleteMe === 'true') ?
            nextElementSibling : undefined;
        const nextMatch = nextElementSibling[NextMatch];
        const prevEl = nextElementSibling;
        if (prevEl[SkipSibs]) {
            nextElementSibling = null;
        }
        else if (nextMatch !== undefined) {
            nextElementSibling = closestNextSib(nextElementSibling, nextMatch);
        }
        else {
            nextElementSibling = nextElementSibling.nextElementSibling;
        }
        prevEl[SkipSibs] = false;
        prevEl[NextMatch] = undefined;
        if (elementToRemove !== undefined)
            elementToRemove.remove();
    }
    return true;
}
const stcRe = /(\-\w)/g;
function lispToCamel(s) {
    return s.replace(stcRe, function (m) { return m[1].toUpperCase(); });
}
function getProp(val, pathTokens) {
    let context = val;
    for (const token of pathTokens) {
        context = context[token];
        if (context === undefined)
            break;
    }
    return context;
}
function closestNextSib(target, match) {
    let nextElementSibling = target.nextElementSibling;
    while (nextElementSibling !== null) {
        if (nextElementSibling.matches(match))
            return nextElementSibling;
        nextElementSibling = nextElementSibling.nextElementSibling;
    }
    return null;
}
function doNextStepSelect(ctx) {
    const nextStep = ctx.Transform;
    if (nextStep.Select === undefined)
        return;
    let nextEl = ctx.target.querySelector(nextStep.Select);
    if (nextEl === null)
        return;
    const inherit = !!nextStep.MergeTransforms;
    let mergedTransform = nextStep.Transform || ctx.previousTransform;
    if (inherit && nextStep.Transform) {
        const newTransform = nextStep.Transform;
        mergedTransform = Object.assign({}, newTransform);
        if (ctx.previousTransform !== undefined && inherit) {
            Object.assign(mergedTransform, ctx.previousTransform);
        }
    }
    const copy = copyCtx(ctx);
    ctx.Transform = mergedTransform;
    ctx.target = nextEl;
    processEl(ctx);
    restoreCtx(ctx, copy);
}
function doNextStepSibling(ctx) {
    const nextStep = ctx.Transform;
    const aTarget = ctx.target;
    (aTarget)[SkipSibs] = nextStep.SkipSibs || (aTarget)[SkipSibs];
    aTarget[NextMatch] = (aTarget[NextMatch] === undefined) ? nextStep.NextMatch : aTarget[NextMatch] + ', ' + nextStep.NextMatch;
}
function getRHS(expr, ctx) {
    switch (typeof expr) {
        case 'undefined':
        case 'string':
        case 'symbol':
        case 'boolean':
            return expr;
        case 'function':
            return getRHS(expr(ctx), ctx);
        case 'object':
            if (expr === null)
                return expr;
            if (!Array.isArray(expr) || expr.length === 0)
                return expr;
            const pivot = expr[0];
            switch (typeof pivot) {
                case 'object':
                case 'undefined':
                case 'string':
                    return expr;
                case 'function':
                    const val = expr[0](ctx);
                    return getRHS([val, ...expr.slice(1)], ctx);
                case 'boolean':
                    if (isTemplate(expr[1]))
                        return expr;
                    return getRHS(pivot ? expr[1] : expr[2], ctx);
                case 'symbol':
                    return ctx[pivot].fn(ctx, expr);
            }
        case 'number':
            return expr.toString();
    }
}

function stamp(fragment, attr, refs, ctx) {
    const target = ctx.host || ctx.cache;
    Array.from(fragment.getRootNode().querySelectorAll(`[${attr}]`)).forEach(el => {
        const val = el.getAttribute(attr);
        const sym = refs[val];
        if (sym !== undefined) {
            target[sym] = el;
        }
    });
}
function fromTuple(ctx, pia) {
    stamp(ctx.target, 'id', pia[1], ctx);
    stamp(ctx.target, 'part', pia[1], ctx);
}
const templStampSym = Symbol.for('Dd5nJwRNaEiFtfam5oaSkg');
const plugin = {
    fn: fromTuple,
    sym: templStampSym
};

function createTemplate(html, context, symbol) {
    const useCache = (context !== undefined) && (symbol !== undefined);
    const cache = context !== undefined ? (context.cache ? context.cache : context) : undefined;
    if (useCache) {
        if (cache[symbol] !== undefined)
            return cache[symbol];
    }
    const template = document.createElement("template");
    template.innerHTML = html;
    if (useCache) {
        cache[symbol] = template;
    }
    return template;
}

const debounce = (fn, time) => {
    let timeout;
    return function () {
        const functionCall = () => fn.apply(this, arguments);
        clearTimeout(timeout);
        timeout = setTimeout(functionCall, time);
    };
};

//export const propUp: unique symbol = Symbol.for('8646ccd5-3ffd-447a-a4df-0022ca3a8155');
//export const attribQueue: unique symbol = Symbol.for('02ca2c80-68e0-488f-b4b4-6859284848fb');
/**
 * Base mixin for many xtal- components
 * @param superClass
 */
function hydrate(superClass) {
    return class extends superClass {
        constructor() {
            super(...arguments);
            this.__conn = false;
        }
        /**
         * Set attribute value.
         * @param name
         * @param val
         * @param trueVal String to set attribute if true.
         */
        attr(name, val, trueVal) {
            if (val === undefined)
                return this.getAttribute(name);
            if (!this.__conn) {
                if (this.__attribQueue === undefined)
                    this.__attribQueue = [];
                this.__attribQueue.push({
                    name, val, trueVal
                });
                return;
            }
            const v = val ? 'set' : 'remove'; //verb
            this[v + 'Attribute'](name, trueVal || val);
        }
        /**
         * Needed for asynchronous loading
         * @param props Array of property names to "upgrade", without losing value set while element was Unknown
         * @private
         */
        __propUp(props) {
            const defaultValues = this.constructor['defaultValues'];
            props.forEach(prop => {
                let value = this[prop];
                if (value === undefined && defaultValues !== undefined) {
                    value = defaultValues[prop];
                }
                if (this.hasOwnProperty(prop)) {
                    delete this[prop];
                }
                if (value !== undefined)
                    this[prop] = value;
            });
        }
        connectedCallback() {
            this.__conn = true;
            const ep = this.constructor.props;
            this.__propUp([...ep.bool, ...ep.str, ...ep.num, ...ep.obj]);
            if (this.__attribQueue !== undefined) {
                this.__attribQueue.forEach(attribQItem => {
                    this.attr(attribQItem.name, attribQItem.val, attribQItem.trueVal);
                });
                this.__attribQueue = undefined;
            }
        }
    };
}

/**
 * Base class for many xtal- components
 * @param superClass
 */
function XtallatX(superClass) {
    var _a;
    return _a = class extends superClass {
            constructor() {
                super(...arguments);
                /**
                 * Tracks how many times each event type was called.
                 */
                this.__evCount = {};
                /**
                 * @private
                 */
                this.self = this;
                this._xlConnected = false;
                this.__propActionQueue = new Set();
            }
            /**
             * @private
             */
            static get evalPath() {
                return lispToCamel$1(this.is);
            }
            /**
             * @private
             */
            static get observedAttributes() {
                const props = this.props;
                return [...props.bool, ...props.num, ...props.str, ...props.jsonProp].map(s => camelToLisp(s));
            }
            static get props() {
                if (this.is === undefined)
                    return {};
                if (this[this.evalPath] === undefined) {
                    const args = deconstruct(this.attributeProps);
                    const arg = {};
                    args.forEach(token => {
                        arg[token] = token;
                    });
                    this[this.evalPath] = this.attributeProps(arg);
                    const ep = this[this.evalPath];
                    propCategories.forEach(propCat => {
                        ep[propCat] = ep[propCat] || [];
                    });
                }
                let props = this[this.evalPath];
                const superProps = Object.getPrototypeOf(this).props;
                if (superProps !== undefined)
                    props = mergeProps(props, superProps);
                return props;
            }
            /**
             * Turn number into string with even and odd values easy to query via css.
             * @param n
             */
            __to$(n) {
                const mod = n % 2;
                return (n - mod) / 2 + '-' + mod;
            }
            /**
             * Increment event count
             * @param name
             */
            __incAttr(name) {
                const ec = this.__evCount;
                if (name in ec) {
                    ec[name]++;
                }
                else {
                    ec[name] = 0;
                }
                this.attr('data-' + name, this.__to$(ec[name]));
            }
            onPropsChange(name) {
                let isAsync = false;
                const propInfoLookup = this.constructor[propInfoSym];
                if (Array.isArray(name)) {
                    name.forEach(subName => {
                        this.__propActionQueue.add(subName);
                        const propInfo = propInfoLookup[subName];
                        if (propInfo !== undefined && propInfo.async)
                            isAsync = true;
                    });
                }
                else {
                    this.__propActionQueue.add(name);
                    const propInfo = propInfoLookup[name];
                    if (propInfo !== undefined && propInfo.async)
                        isAsync = true;
                }
                if (this.disabled || !this._xlConnected) {
                    return;
                }
                if (!this.disabled) {
                    if (isAsync) {
                        this.__processActionDebouncer();
                    }
                    else {
                        this.__processActionQueue();
                    }
                }
            }
            attributeChangedCallback(n, ov, nv) {
                this[atrInit] = true; // track each attribute?
                const ik = this[ignoreAttrKey];
                if (ik !== undefined && ik[n] === true) {
                    delete ik[n];
                    return;
                }
                const propName = lispToCamel$1(n);
                const privatePropName = '_' + propName;
                //TODO:  Do we need this?
                // if((<any>this)[ignorePropKey] === undefined) (<any>this)[ignorePropKey] = {};
                // (<any>this)[ignorePropKey][propName] = true;
                const anyT = this;
                const ep = this.constructor.props;
                if (ep.str.includes(propName)) {
                    anyT[privatePropName] = nv;
                }
                else if (ep.bool.includes(propName)) {
                    anyT[privatePropName] = nv !== null;
                }
                else if (ep.num.includes(propName)) {
                    anyT[privatePropName] = parseFloat(nv);
                }
                else if (ep.jsonProp.includes(propName)) {
                    try {
                        anyT[privatePropName] = JSON.parse(nv);
                    }
                    catch (e) {
                        anyT[privatePropName] = nv;
                    }
                }
                this.onPropsChange(propName);
            }
            connectedCallback() {
                super.connectedCallback();
                this._xlConnected = true;
                this.__processActionDebouncer();
                this.onPropsChange('');
            }
            /**
             * Dispatch Custom Event
             * @param name Name of event to dispatch ("-changed" will be appended if asIs is false)
             * @param detail Information to be passed with the event
             * @param asIs If true, don't append event name with '-changed'
             * @private
             */
            [de](name, detail, asIs = false) {
                if (this.disabled)
                    return;
                const eventName = name + (asIs ? '' : '-changed');
                let bubbles = false;
                let composed = false;
                let cancelable = false;
                if (this.eventScopes !== undefined) {
                    const eventScope = this.eventScopes.find(x => (x[0] === undefined) || x[0].startsWith(eventName));
                    if (eventScope !== undefined) {
                        bubbles = eventScope[1] === 'bubbles';
                        cancelable = eventScope[2] === 'cancelable';
                        composed = eventScope[3] === 'composed';
                    }
                }
                const newEvent = new CustomEvent(eventName, {
                    detail: detail,
                    bubbles: bubbles,
                    composed: composed,
                    cancelable: cancelable,
                });
                this.dispatchEvent(newEvent);
                this.__incAttr(eventName);
                return newEvent;
            }
            get __processActionDebouncer() {
                if (this.___processActionDebouncer === undefined) {
                    this.___processActionDebouncer = debounce((getNew = false) => {
                        this.__processActionQueue();
                    }, 16);
                }
                return this.___processActionDebouncer;
            }
            propActionsHub(propAction) { }
            __processActionQueue() {
                if (this.propActions === undefined)
                    return;
                const queue = this.__propActionQueue;
                this.__propActionQueue = new Set();
                this.propActions.forEach(propAction => {
                    const dependencies = deconstruct(propAction);
                    const dependencySet = new Set(dependencies);
                    if (intersection(queue, dependencySet).size > 0) {
                        this.propActionsHub(propAction);
                        propAction(this);
                    }
                });
            }
        },
        /**
         * @private
         * @param param0
         */
        _a.attributeProps = ({ disabled }) => ({
            bool: [disabled],
        }),
        _a;
}
//utility fns
//const ignorePropKey = Symbol();
const ignoreAttrKey = Symbol();
const propInfoSym = Symbol('propInfo');
const atrInit = Symbol('atrInit');
function define(MyElementClass) {
    const tagName = MyElementClass.is;
    let n = 0;
    let foundIt = false;
    let isNew = false;
    let name = tagName;
    do {
        if (n > 0)
            name = `${tagName}-${n}`;
        const test = customElements.get(name);
        if (test !== undefined) {
            if (test === MyElementClass) {
                foundIt = true; //all good;
                MyElementClass.isReally = name;
            }
        }
        else {
            isNew = true;
            MyElementClass.isReally = name;
            foundIt = true;
        }
        n++;
    } while (!foundIt);
    if (!isNew)
        return;
    const props = MyElementClass.props;
    const proto = MyElementClass.prototype;
    const flatProps = [...props.bool, ...props.num, ...props.str, ...props.obj];
    const existingProps = Object.getOwnPropertyNames(proto);
    MyElementClass[propInfoSym] = {};
    flatProps.forEach(prop => {
        if (existingProps.includes(prop))
            return;
        const privateKey = '_' + prop;
        const propInfo = {};
        propCategories.forEach(cat => {
            propInfo[cat] = props[cat].includes(prop);
        });
        MyElementClass[propInfoSym][prop] = propInfo;
        //TODO:  make this a bound function?
        Object.defineProperty(proto, prop, {
            get() {
                return this[privateKey];
            },
            set(nv) {
                const propInfo = MyElementClass[propInfoSym][prop];
                if (propInfo.dry) {
                    if (nv === this[privateKey])
                        return;
                }
                const c2l = camelToLisp(prop);
                if (propInfo.reflect) {
                    //experimental line -- we want the attribute to take precedence over default value.
                    if (this[atrInit] === undefined && this.hasAttribute(c2l))
                        return;
                    if (this[ignoreAttrKey] === undefined)
                        this[ignoreAttrKey] = {};
                    this[ignoreAttrKey][c2l] = true;
                    if (propInfo.bool) {
                        if ((nv && !this.hasAttribute(c2l)) || nv === false) {
                            this.attr(c2l, nv, '');
                        }
                        else {
                            this[ignoreAttrKey][c2l] = false;
                        }
                    }
                    else if (propInfo.str) {
                        this.attr(c2l, nv);
                    }
                    else if (propInfo.num) {
                        this.attr(c2l, nv.toString());
                    }
                    else if (propInfo.obj) {
                        this.attr(c2l, JSON.stringify(nv));
                    }
                }
                this[privateKey] = nv;
                if (propInfo.log) {
                    console.log(propInfo, nv);
                }
                if (propInfo.debug)
                    debugger;
                this.onPropsChange(prop);
                if (propInfo.notify) {
                    this[de](c2l, { value: nv });
                }
            },
            enumerable: true,
            configurable: true
        });
    });
    customElements.define(name, MyElementClass);
}
const de = Symbol.for('1f462044-3fe5-4fa8-9d26-c4165be15551');
function mergeProps(props1, props2) {
    const returnObj = {};
    propCategories.forEach(propCat => {
        returnObj[propCat] = (props1[propCat] || []).concat(props2[propCat] || []);
    });
    return returnObj;
}
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
function intersection(setA, setB) {
    let _intersection = new Set();
    for (let elem of setB) {
        if (setA.has(elem)) {
            _intersection.add(elem);
        }
    }
    return _intersection;
}
const ltcRe = /(\-\w)/g;
function lispToCamel$1(s) {
    return s.replace(ltcRe, function (m) { return m[1].toUpperCase(); });
}
const ctlRe = /[\w]([A-Z])/g;
function camelToLisp(s) {
    return s.replace(ctlRe, function (m) {
        return m[0] + "-" + m[1];
    }).toLowerCase();
}
const p = Symbol('placeholder');
function symbolize(obj) {
    for (var key in obj) {
        obj[key] = Symbol(key);
    }
}
const propCategories = ['bool', 'str', 'num', 'reflect', 'notify', 'obj', 'jsonProp', 'dry', 'log', 'debug', 'async'];
const argList = Symbol('argList');
function substrBefore(s, search) {
    let returnS = s.trim();
    let iPosOfColon = returnS.indexOf(search);
    if (iPosOfColon > -1)
        return returnS.substr(0, iPosOfColon);
    return returnS;
}
function deconstruct(fn) {
    if (fn[argList] === undefined) {
        const fnString = fn.toString().trim();
        if (fnString.startsWith('({')) {
            const iPos = fnString.indexOf('})', 2);
            fn[argList] = fnString.substring(2, iPos).split(',').map(s => substrBefore(s, ':'));
        }
        else {
            fn[argList] = [];
        }
    }
    return fn[argList];
}

const _transformDebouncer = Symbol();
const transformDebouncer = Symbol();
class XtalElement extends XtallatX(hydrate(HTMLElement)) {
    constructor() {
        super(...arguments);
        /**
         * @private
         */
        this.noShadow = false;
        this._renderOptions = {};
        this._mainTemplateProp = 'mainTemplate';
        this.__initRCIP = false;
        this._propChangeQueue = new Set();
    }
    get renderOptions() {
        return this._renderOptions;
    }
    initRenderCallback(ctx, target) { }
    /**
     * @private
     */
    get root() {
        if (this.noShadow)
            return this;
        if (this.shadowRoot == null) {
            this.attachShadow({ mode: 'open' });
        }
        return this.shadowRoot;
    }
    afterInitRenderCallback(ctx, target, renderOptions) { }
    afterUpdateRenderCallback(ctx, target, renderOptions) { }
    async initRenderContext() {
        const plugins = await this.plugins();
        this.transformHub(this.initTransform);
        const isInitTransformAFunction = typeof this.initTransform === 'function';
        if (isInitTransformAFunction && this.__initTransformArgs === undefined) {
            this.__initTransformArgs = new Set(deconstruct(this.initTransform));
        }
        const ctx = {
            Transform: isInitTransformAFunction ? this.initTransform(this) : this.initTransform,
            host: this,
            cache: this.constructor,
            mode: 'init',
        };
        Object.assign(ctx, plugins);
        ctx.ctx = ctx;
        return ctx;
    }
    async plugins() {
        const { doObjectMatch, repeateth, interpolateSym, interpolatePlugin, templStampSym, templStampPlugin } = await import('./standardPlugins-32de4021.js');
        return {
            customObjProcessor: doObjectMatch,
            repeatProcessor: repeateth,
            [interpolateSym]: interpolatePlugin,
            [templStampSym]: templStampPlugin
        };
    }
    get [transformDebouncer]() {
        if (this[_transformDebouncer] === undefined) {
            this[_transformDebouncer] = debounce((getNew = false) => {
                this.transform();
            }, 16);
        }
        return this[_transformDebouncer];
    }
    transformHub(transform) {
    }
    async transform() {
        if (this.__initRCIP)
            return;
        const readyToRender = this.readyToRender;
        let evaluateAllUpdateTransforms = false;
        if (readyToRender === false)
            return;
        if (typeof (readyToRender) === 'string') {
            if (readyToRender !== this._mainTemplateProp) {
                this.root.innerHTML = '';
                this._renderContext = undefined;
            }
        }
        if (this.updateTransforms === undefined) {
            //Since there's no delicate update transform,
            //assumption is that if data changes, just redraw based on init
            this.root.innerHTML = '';
        }
        else {
            if (this.__initTransformArgs && intersection(this._propChangeQueue, this.__initTransformArgs).size > 0) {
                //we need to restart the ui initialization, since the initialization depended on some properties that have since changed.
                //reset the UI
                this.root.innerHTML = '';
                delete this._renderContext;
                evaluateAllUpdateTransforms = true;
            }
        }
        let rc = this._renderContext;
        let target;
        let isFirst = true;
        if (rc === undefined) {
            this.dataset.upgraded = 'true';
            this.__initRCIP = true;
            rc = this._renderContext = await this.initRenderContext();
            rc.options = {
                initializedCallback: this.afterInitRenderCallback.bind(this),
            };
            target = this[this._mainTemplateProp].content.cloneNode(true);
            await transform(target, rc);
            delete rc.options.initializedCallback;
            this.__initRCIP = false;
        }
        else {
            target = this.root;
            isFirst = false;
        }
        if (this.updateTransforms !== undefined) {
            const propChangeQueue = this._propChangeQueue;
            this._propChangeQueue = new Set();
            this.updateTransforms.forEach(async (selectiveUpdateTransform) => {
                const dependencies = deconstruct(selectiveUpdateTransform);
                const dependencySet = new Set(dependencies);
                if (evaluateAllUpdateTransforms || intersection(propChangeQueue, dependencySet).size > 0) {
                    this._renderOptions.updatedCallback = this.afterUpdateRenderCallback.bind(this);
                    this.transformHub(selectiveUpdateTransform);
                    rc.Transform = selectiveUpdateTransform(this);
                    await transform(target, rc);
                    //rc!.update!(rc!, this.root);
                }
            });
        }
        if (isFirst) {
            this.root.appendChild(target);
        }
    }
    async onPropsChange(name, skipTransform = false) {
        super.onPropsChange(name);
        this._propChangeQueue.add(name);
        if (this.disabled || !this._xlConnected || !this.readyToInit) {
            return;
        }
        if (!skipTransform) {
            await this.transform();
        }
    }
}

class XtalRoomWithAView extends XtalElement {
    constructor() {
        super();
        this._state = 'constructed';
        this.__controller = new AbortController();
        this.__signal = this.__controller.signal;
    }
    get viewModel() {
        return this._viewModel;
    }
    /**
     * @private
     */
    set viewModel(nv) {
        this._viewModel = nv;
        this[de]('view-model', {
            value: nv
        });
        this.onPropsChange('viewModel');
    }
    async onPropsChange(name, skipTransform = false) {
        await super.onPropsChange(name, this.viewModel === undefined);
        if (super.disabled || !this._xlConnected || !this.readyToInit)
            return;
        switch (this._state) {
            case 'constructed':
                this._state = 'initializing';
                this.initViewModel(this).then(model => {
                    this._state = 'initialized';
                    this.viewModel = model;
                });
                return;
            case 'initializing':
                break;
            case 'initialized':
                if (this.refreshViewModel && deconstruct(this.refreshViewModel).includes(name)) {
                    this._state = 'refreshing';
                    this.refreshViewModel(this).then(model => {
                        this._state = 'refreshed';
                        this.viewModel = model;
                    });
                }
                else if (deconstruct(this.initViewModel).includes(name)) {
                    this._state = 'refreshing';
                    this.initViewModel(this).then(model => {
                        this._state = 'refreshed';
                        this.viewModel = model;
                    });
                }
                break;
        }
    }
}

function getFullURL(baseLinkContainer, tail) {
    let r = tail;
    const baseLinkId = baseLinkContainer.baseLinkId;
    if (baseLinkId !== undefined) {
        const link = self[baseLinkId];
        if (link)
            r = link.href + r;
    }
    return r;
}

class XtalFetchViewElement extends XtalRoomWithAView {
    constructor() {
        super(...arguments);
        this.as = 'json';
        /**
         * @private
         * @param param0
         */
        this.initViewModel = ({ href, reqInit }) => new Promise(resolve => {
            fetch(getFullURL(this, href), reqInit).then(resp => resp[this.as]().then(data => {
                resolve(this.filterInitData(data));
            }));
        });
    }
    filterInitData(data) {
        return data;
    }
    filterUpdateData(data) {
        return data;
    }
    /**
     * @private
     */
    get readyToInit() { return !this.disabled && this.href !== undefined && (!this.reqInitRequired || this.reqInit !== undefined); }
}
XtalFetchViewElement.is = 'xtal-fetch-view-element';
/**
 * @private
 *
 */
XtalFetchViewElement.attributeProps = ({ href, reqInit, reqInitRequired, baseLinkId, viewModel }) => ({
    str: [href, baseLinkId],
    obj: [reqInit, viewModel],
    jsonProp: [reqInit],
    bool: [reqInitRequired],
    reflect: [href, reqInitRequired]
});

const debounce$1 = (fn, time) => {
    let timeout;
    return function () {
        const functionCall = () => fn.apply(this, arguments);
        clearTimeout(timeout);
        timeout = setTimeout(functionCall, time);
    };
};

//export const propUp: unique symbol = Symbol.for('8646ccd5-3ffd-447a-a4df-0022ca3a8155');
//export const attribQueue: unique symbol = Symbol.for('02ca2c80-68e0-488f-b4b4-6859284848fb');
/**
 * Base mixin for many xtal- components
 * @param superClass
 */
function hydrate$1(superClass) {
    return class extends superClass {
        constructor() {
            super(...arguments);
            this.__conn = false;
        }
        /**
         * Set attribute value.
         * @param name
         * @param val
         * @param trueVal String to set attribute if true.
         */
        attr(name, val, trueVal) {
            if (val === undefined)
                return this.getAttribute(name);
            if (!this.__conn) {
                if (this.__attribQueue === undefined)
                    this.__attribQueue = [];
                this.__attribQueue.push({
                    name, val, trueVal
                });
                return;
            }
            const v = val ? 'set' : 'remove'; //verb
            this[v + 'Attribute'](name, trueVal || val);
        }
        /**
         * Needed for asynchronous loading
         * @param props Array of property names to "upgrade", without losing value set while element was Unknown
         * @private
         */
        __propUp(props) {
            const defaultValues = this.constructor['defaultValues'];
            props.forEach(prop => {
                let value = this[prop];
                if (value === undefined && defaultValues !== undefined) {
                    value = defaultValues[prop];
                }
                if (this.hasOwnProperty(prop)) {
                    delete this[prop];
                }
                if (value !== undefined)
                    this[prop] = value;
            });
        }
        connectedCallback() {
            this.__conn = true;
            const ep = this.constructor.props;
            this.__propUp([...ep.bool, ...ep.str, ...ep.num, ...ep.obj]);
            if (this.__attribQueue !== undefined) {
                this.__attribQueue.forEach(attribQItem => {
                    this.attr(attribQItem.name, attribQItem.val, attribQItem.trueVal);
                });
                this.__attribQueue = undefined;
            }
        }
    };
}

/**
 * Base class for many xtal- components
 * @param superClass
 */
function XtallatX$1(superClass) {
    var _a;
    return _a = class extends superClass {
            constructor() {
                super(...arguments);
                /**
                 * Tracks how many times each event type was called.
                 */
                this.__evCount = {};
                /**
                 * @private
                 */
                this.self = this;
                this._xlConnected = false;
                this.__propActionQueue = new Set();
            }
            /**
             * @private
             */
            static get evalPath() {
                return lispToCamel$2(this.is);
            }
            /**
             * @private
             */
            static get observedAttributes() {
                const props = this.props;
                return [...props.bool, ...props.num, ...props.str, ...props.jsonProp].map(s => camelToLisp$1(s));
            }
            static get props() {
                if (this.is === undefined)
                    return {};
                if (this[this.evalPath] === undefined) {
                    const args = deconstruct$1(this.attributeProps);
                    const arg = {};
                    args.forEach(token => {
                        arg[token] = token;
                    });
                    this[this.evalPath] = this.attributeProps(arg);
                    const ep = this[this.evalPath];
                    propCategories$1.forEach(propCat => {
                        ep[propCat] = ep[propCat] || [];
                    });
                }
                let props = this[this.evalPath];
                const superProps = Object.getPrototypeOf(this).props;
                if (superProps !== undefined)
                    props = mergeProps$1(props, superProps);
                return props;
            }
            /**
             * Turn number into string with even and odd values easy to query via css.
             * @param n
             */
            __to$(n) {
                const mod = n % 2;
                return (n - mod) / 2 + '-' + mod;
            }
            /**
             * Increment event count
             * @param name
             */
            __incAttr(name) {
                const ec = this.__evCount;
                if (name in ec) {
                    ec[name]++;
                }
                else {
                    ec[name] = 0;
                }
                this.attr('data-' + name, this.__to$(ec[name]));
            }
            onPropsChange(name) {
                let isAsync = false;
                const propInfoLookup = this.constructor[propInfoSym$1];
                if (Array.isArray(name)) {
                    name.forEach(subName => {
                        this.__propActionQueue.add(subName);
                        const propInfo = propInfoLookup[subName];
                        if (propInfo !== undefined && propInfo.async)
                            isAsync = true;
                    });
                }
                else {
                    this.__propActionQueue.add(name);
                    const propInfo = propInfoLookup[name];
                    if (propInfo !== undefined && propInfo.async)
                        isAsync = true;
                }
                if (this.disabled || !this._xlConnected) {
                    return;
                }
                if (!this.disabled) {
                    if (isAsync) {
                        this.__processActionDebouncer();
                    }
                    else {
                        this.__processActionQueue();
                    }
                }
            }
            attributeChangedCallback(n, ov, nv) {
                this[atrInit$1] = true; // track each attribute?
                const ik = this[ignoreAttrKey$1];
                if (ik !== undefined && ik[n] === true) {
                    delete ik[n];
                    return;
                }
                const propName = lispToCamel$2(n);
                const privatePropName = '_' + propName;
                //TODO:  Do we need this?
                // if((<any>this)[ignorePropKey] === undefined) (<any>this)[ignorePropKey] = {};
                // (<any>this)[ignorePropKey][propName] = true;
                const anyT = this;
                const ep = this.constructor.props;
                if (ep.str.includes(propName)) {
                    anyT[privatePropName] = nv;
                }
                else if (ep.bool.includes(propName)) {
                    anyT[privatePropName] = nv !== null;
                }
                else if (ep.num.includes(propName)) {
                    anyT[privatePropName] = parseFloat(nv);
                }
                else if (ep.jsonProp.includes(propName)) {
                    try {
                        anyT[privatePropName] = JSON.parse(nv);
                    }
                    catch (e) {
                        anyT[privatePropName] = nv;
                    }
                }
                this.onPropsChange(propName);
            }
            connectedCallback() {
                super.connectedCallback();
                this._xlConnected = true;
                this.__processActionDebouncer();
                this.onPropsChange('');
            }
            /**
             * Dispatch Custom Event
             * @param name Name of event to dispatch ("-changed" will be appended if asIs is false)
             * @param detail Information to be passed with the event
             * @param asIs If true, don't append event name with '-changed'
             * @private
             */
            [de$1](name, detail, asIs = false) {
                if (this.disabled)
                    return;
                const eventName = name + (asIs ? '' : '-changed');
                let bubbles = false;
                let composed = false;
                let cancelable = false;
                if (this.eventScopes !== undefined) {
                    const eventScope = this.eventScopes.find(x => (x[0] === undefined) || x[0].startsWith(eventName));
                    if (eventScope !== undefined) {
                        bubbles = eventScope[1] === 'bubbles';
                        cancelable = eventScope[2] === 'cancelable';
                        composed = eventScope[3] === 'composed';
                    }
                }
                const newEvent = new CustomEvent(eventName, {
                    detail: detail,
                    bubbles: bubbles,
                    composed: composed,
                    cancelable: cancelable,
                });
                this.dispatchEvent(newEvent);
                this.__incAttr(eventName);
                return newEvent;
            }
            get __processActionDebouncer() {
                if (this.___processActionDebouncer === undefined) {
                    this.___processActionDebouncer = debounce$1((getNew = false) => {
                        this.__processActionQueue();
                    }, 16);
                }
                return this.___processActionDebouncer;
            }
            __processActionQueue() {
                if (this.propActions === undefined)
                    return;
                const queue = this.__propActionQueue;
                this.__propActionQueue = new Set();
                this.propActions.forEach(propAction => {
                    const dependencies = deconstruct$1(propAction);
                    const dependencySet = new Set(dependencies);
                    if (intersection$1(queue, dependencySet).size > 0) {
                        propAction(this);
                    }
                });
            }
        },
        /**
         * @private
         * @param param0
         */
        _a.attributeProps = ({ disabled }) => ({
            bool: [disabled],
        }),
        _a;
}
//utility fns
//const ignorePropKey = Symbol();
const ignoreAttrKey$1 = Symbol();
const propInfoSym$1 = Symbol('propInfo');
const atrInit$1 = Symbol('atrInit');
function define$1(MyElementClass) {
    const tagName = MyElementClass.is;
    let n = 0;
    let foundIt = false;
    let isNew = false;
    let name = tagName;
    do {
        if (n > 0)
            name = `${tagName}-${n}`;
        const test = customElements.get(name);
        if (test !== undefined) {
            if (test === MyElementClass) {
                foundIt = true; //all good;
                MyElementClass.isReally = name;
            }
        }
        else {
            isNew = true;
            MyElementClass.isReally = name;
            foundIt = true;
        }
        n++;
    } while (!foundIt);
    if (!isNew)
        return;
    const props = MyElementClass.props;
    const proto = MyElementClass.prototype;
    const flatProps = [...props.bool, ...props.num, ...props.str, ...props.obj];
    const existingProps = Object.getOwnPropertyNames(proto);
    MyElementClass[propInfoSym$1] = {};
    flatProps.forEach(prop => {
        if (existingProps.includes(prop))
            return;
        const privateKey = '_' + prop;
        const propInfo = {};
        propCategories$1.forEach(cat => {
            propInfo[cat] = props[cat].includes(prop);
        });
        MyElementClass[propInfoSym$1][prop] = propInfo;
        //TODO:  make this a bound function?
        Object.defineProperty(proto, prop, {
            get() {
                return this[privateKey];
            },
            set(nv) {
                const propInfo = MyElementClass[propInfoSym$1][prop];
                if (propInfo.dry) {
                    if (nv === this[privateKey])
                        return;
                }
                const c2l = camelToLisp$1(prop);
                if (propInfo.reflect) {
                    //experimental line -- we want the attribute to take precedence over default value.
                    if (this[atrInit$1] === undefined && this.hasAttribute(c2l))
                        return;
                    if (this[ignoreAttrKey$1] === undefined)
                        this[ignoreAttrKey$1] = {};
                    this[ignoreAttrKey$1][c2l] = true;
                    if (propInfo.bool) {
                        this.attr(c2l, nv, '');
                    }
                    else if (propInfo.str) {
                        this.attr(c2l, nv);
                    }
                    else if (propInfo.num) {
                        this.attr(c2l, nv.toString());
                    }
                    else if (propInfo.obj) {
                        this.attr(c2l, JSON.stringify(nv));
                    }
                }
                this[privateKey] = nv;
                if (propInfo.log) {
                    console.log(propInfo, nv);
                }
                if (propInfo.debug)
                    debugger;
                this.onPropsChange(prop);
                if (propInfo.notify) {
                    this[de$1](c2l, { value: nv });
                }
            },
            enumerable: true,
            configurable: true
        });
    });
    customElements.define(name, MyElementClass);
}
const de$1 = Symbol.for('1f462044-3fe5-4fa8-9d26-c4165be15551');
function mergeProps$1(props1, props2) {
    const returnObj = {};
    propCategories$1.forEach(propCat => {
        returnObj[propCat] = (props1[propCat] || []).concat(props2[propCat] || []);
    });
    return returnObj;
}
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
function intersection$1(setA, setB) {
    let _intersection = new Set();
    for (let elem of setB) {
        if (setA.has(elem)) {
            _intersection.add(elem);
        }
    }
    return _intersection;
}
const ltcRe$1 = /(\-\w)/g;
function lispToCamel$2(s) {
    return s.replace(ltcRe$1, function (m) { return m[1].toUpperCase(); });
}
const ctlRe$1 = /[\w]([A-Z])/g;
function camelToLisp$1(s) {
    return s.replace(ctlRe$1, function (m) {
        return m[0] + "-" + m[1];
    }).toLowerCase();
}
const propCategories$1 = ['bool', 'str', 'num', 'reflect', 'notify', 'obj', 'jsonProp', 'dry', 'log', 'debug', 'async'];
const argList$1 = Symbol('argList');
function deconstruct$1(fn) {
    if (fn[argList$1] === undefined) {
        const fnString = fn.toString().trim();
        if (fnString.startsWith('({')) {
            const iPos = fnString.indexOf('})', 2);
            fn[argList$1] = fnString.substring(2, iPos).split(',').map(s => s.trim());
        }
        else {
            fn[argList$1] = [];
        }
    }
    return fn[argList$1];
}

function createNestedProp(target, pathTokens, val, clone) {
    const firstToken = pathTokens.shift();
    const tft = target[firstToken];
    const returnObj = { [firstToken]: tft ? tft : {} };
    let tc = returnObj[firstToken]; //targetContext
    const lastToken = pathTokens.pop();
    pathTokens.forEach(token => {
        let newContext = tc[token];
        if (!newContext) {
            newContext = tc[token] = {};
        }
        tc = newContext;
    });
    if (tc[lastToken] && typeof (val) === 'object') {
        Object.assign(tc[lastToken], val);
    }
    else {
        if (lastToken === undefined) {
            returnObj[firstToken] = val;
        }
        else {
            tc[lastToken] = val;
        }
    }
    //this controversial line is to force the target to see new properties, even though we are updating nested properties.
    //In some scenarios, this will fail (like if updating element.dataset), but hopefully it's okay to ignore such failures 
    if (clone)
        try {
            Object.assign(target, returnObj);
        }
        catch (e) { }
}

/**
 * Custom Element mixin that allows a property to be namespaced
 * @param superClass
 */
function WithPath(superClass) {
    return class extends superClass {
        wrap(obj, target = {}) {
            if (this.withPath) {
                createNestedProp(target, this.withPath.split('.'), obj, true);
                return target;
            }
            else {
                return obj;
            }
        }
    };
}

function getProp$1(val, pathTokens, src) {
    let context = val;
    let first = true;
    pathTokens.forEach(token => {
        if (context && token !== '') {
            if (first && token === 'target' && context['target'] === null) {
                context = src._trigger;
            }
            else {
                switch (typeof token) {
                    case 'string':
                        context = context[token];
                        break;
                    default:
                        context = context[token[0]].apply(context, token[1]);
                }
            }
            first = false;
        }
    });
    return context;
}
class P extends WithPath(XtallatX$1(hydrate$1(HTMLElement))) {
    constructor() {
        super(...arguments);
        this._s = null; // split prop using '.' as delimiter
        this.propActions = [
            ({ val, self }) => {
                if (val !== null) {
                    self._s = self.getSplit(val);
                }
            }
        ];
        this._lastEvent = null;
    }
    getSplit(newVal) {
        if (newVal === '.') {
            return [];
        }
        else {
            return newVal.split('.');
        }
    }
    /**
     * get previous sibling
     */
    getPreviousSib() {
        const obs = this.observe;
        let prevSib = this;
        while (prevSib && ((obs != undefined && !prevSib.matches(obs)) || prevSib.hasAttribute('on'))) {
            prevSib = prevSib.previousElementSibling;
            if (prevSib === null) {
                prevSib = this.parentElement;
            }
        }
        return prevSib;
    }
    connectedCallback() {
        this.style.display = 'none';
        super.connectedCallback();
    }
    init() {
        this.attchEvListnrs();
        this.doFake();
    }
    ;
    nudge(prevSib) {
        const da = prevSib.getAttribute('disabled');
        if (da !== null) {
            if (da.length === 0 || da === "1") {
                prevSib.removeAttribute('disabled');
            }
            else {
                prevSib.setAttribute('disabled', (parseInt(da) - 1).toString());
            }
        }
    }
    attchEvListnrs() {
        if (this._bndHndlEv) {
            return;
        }
        else {
            this._bndHndlEv = this._hndEv.bind(this);
        }
        const prevSib = this._trigger === undefined ? this.getPreviousSib() : this._trigger;
        if (!prevSib)
            return;
        this._trigger = prevSib;
        prevSib.addEventListener(this.on, this._bndHndlEv, { capture: this.capture });
        if (prevSib === this.parentElement && this.ifTargetMatches) {
            prevSib.querySelectorAll(this.ifTargetMatches).forEach(publisher => {
                this.nudge(publisher);
            });
        }
        else {
            this.nudge(prevSib);
        }
    }
    doFake() {
        if (!this.ifTargetMatches && !this.skipInit) {
            let lastEvent = this._lastEvent;
            if (!lastEvent) {
                lastEvent = {
                    target: this.getPreviousSib(),
                    isFake: true
                };
            }
            if (this._hndEv)
                this._hndEv(lastEvent);
        }
    }
    filterEvent(e) {
        if (this.ifTargetMatches === undefined)
            return true;
        return e.target.matches(this.ifTargetMatches);
    }
    _hndEv(e) {
        if (this.log) {
            console.log('handlingEvent', this, e);
        }
        if (this.debug)
            debugger;
        if (!e)
            return;
        if (!this.filterEvent(e))
            return;
        if (e.stopPropagation && !this.noblock)
            e.stopPropagation();
        this._lastEvent = e;
        if (this.async) {
            setTimeout(() => {
                Object.assign(e, { isFake: true, target: this.getPreviousSib() });
                this.pass(e);
            });
        }
        else {
            this.pass(e);
        }
    }
    valFromEvent(e) {
        let val = this._s !== null ? getProp$1(e, this._s, this) : getProp$1(e, ['target', 'value'], this);
        if (val === undefined && (typeof (this.val) === 'string') && e.target.hasAttribute(this.val)) {
            val = e.target.getAttribute(this.val);
        }
        switch (this.parseValAs) {
            case 'bool':
                val = val === 'true';
                break;
            case 'int':
                val = parseInt(val);
                break;
            case 'float':
                val = parseFloat(val);
                break;
            case 'date':
                val = new Date(val);
                break;
            case 'truthy':
                val = !!val;
                break;
            case 'falsy':
                val = !val;
                break;
        }
        return val;
    }
    injectVal(e, target) {
        this.commit(target, this.valFromEvent(e), e);
    }
    setVal(target, valx, attr, prop) {
        switch (typeof prop) {
            case 'symbol':
                this.setProp(target, prop, valx);
                break;
            default:
                if (prop.startsWith('.')) {
                    const cssClass = prop.substr(1);
                    const method = (valx === undefined && valx === null) ? 'remove' : 'add';
                    target.classList[method](cssClass);
                }
                else if (this.withPath !== undefined) {
                    const currentVal = target[prop];
                    const wrappedVal = this.wrap(valx, {});
                    target[prop] = (typeof (currentVal) === 'object' && currentVal !== null) ? { ...currentVal, ...wrappedVal } : wrappedVal;
                }
                else if (attr !== undefined && this.hasAttribute('as-attr')) {
                    this.setAttr(target, attr, valx);
                }
                else {
                    this.setProp(target, prop, valx);
                }
        }
    }
    setAttr(target, attr, valx) {
        target.setAttribute(attr, valx.toString());
    }
    setProp(target, prop, valx) {
        target[prop] = valx;
    }
    commit(target, valx, e) {
        if (valx === undefined)
            return;
        let prop = this.prop;
        let attr;
        if (prop === undefined) {
            //TODO:  optimize (cache, etc)
            if (this.propFromEvent !== undefined) {
                prop = getProp$1(e, this.propFromEvent.split('.'), target);
            }
            else {
                const thingToSplit = this.careOf || this.to;
                const toSplit = thingToSplit.split('[');
                const len = toSplit.length;
                if (len > 1) {
                    const last = toSplit[len - 1].replace(']', '');
                    if (last.startsWith('-') || last.startsWith('data-')) {
                        attr = last.split('-').slice(1).join('-');
                        prop = lispToCamel$2(attr);
                    }
                }
            }
        }
        if (target.hasAttribute !== undefined && target.hasAttribute('debug'))
            debugger;
        let realTarget = target;
        if (this.proxyId) {
            const sym = Symbol.for(this.proxyId);
            if (realTarget[sym] === undefined) {
                realTarget[sym] = {};
            }
            realTarget = realTarget[sym];
        }
        this.setVal(realTarget, valx, attr, prop);
        if (this.fireEvent) {
            target.dispatchEvent(new CustomEvent(this.fireEvent, {
                detail: this.getDetail(valx),
                bubbles: true
            }));
        }
    }
    getDetail(val) {
        return { value: val };
    }
    detach(pS) {
        pS.removeEventListener(this.on, this._bndHndlEv);
    }
    disconnectedCallback() {
        const pS = this.getPreviousSib();
        if (pS && this._bndHndlEv)
            this.detach(pS);
    }
}

class NavDown {
    constructor(seed, match, careOf, notify, max, ignore = null, mutDebounce = 50) {
        this.seed = seed;
        this.match = match;
        this.careOf = careOf;
        this.notify = notify;
        this.max = max;
        this.ignore = ignore;
        this.mutDebounce = mutDebounce;
        this._inMutLoop = false;
    }
    init() {
        this.addMutObs(this.seed.parentElement);
        this.sync();
        this.notify(this);
    }
    addMutObs(elToObs) {
        if (elToObs === null)
            return;
        const nodes = [];
        this._mutObs = new MutationObserver((m) => {
            this._inMutLoop = true;
            m.forEach(mr => {
                mr.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        const el = node;
                        el.dataset.__pdWIP = '1';
                        nodes.push(el);
                    }
                });
            });
            nodes.forEach(node => delete node.dataset.__pdWIP);
            this.sync();
            this._inMutLoop = false;
            this.notify(this);
        });
        this._mutObs.observe(elToObs, { childList: true });
    }
    sibCheck(sib, c) { }
    sync(c = 0) {
        const isF = typeof this.match === 'function';
        this.matches = [];
        let ns = this._sis ? this.seed : this.seed.nextElementSibling;
        while (ns !== null) {
            if (this.ignore === null || !ns.matches(this.ignore)) {
                let isG = isF ? this.match(ns) : ns.matches(this.match);
                if (isG) {
                    const matchedElements = (this.careOf !== undefined) ? Array.from(ns.querySelectorAll(this.careOf)) : [ns];
                    if (matchedElements !== null) {
                        this.matches = this.matches.concat(matchedElements);
                        c++;
                        if (c >= this.max) {
                            return;
                        }
                    }
                }
                this.sibCheck(ns, c);
            }
            ns = ns.nextElementSibling;
        }
    }
    disconnect() {
        this._mutObs.disconnect();
    }
}

/**
 * Pass data from one element down the DOM tree to other elements
 * @element p-d
 *
 */
class PD extends P {
    constructor() {
        super(...arguments);
        this._pdNavDown = null;
        this._iIP = false;
    }
    pass(e) {
        this._lastEvent = e;
        this.attr('pds', '🌩️');
        const count = this.applyProps(this._pdNavDown);
        this.attr('pds', '👂');
    }
    getMatches(pd) {
        return pd.matches;
    }
    applyProps(pd) {
        //if(this._iIP && this.skI()) return;
        if (this._iIP)
            return 0;
        if (this._lastEvent === null)
            return;
        const matches = this.getMatches(pd);
        //const matches = pd.getMatches();
        matches.forEach(el => {
            if (pd._inMutLoop) {
                if (el.dataset.__pdWIP !== '1')
                    return;
            }
            this.injectVal(this._lastEvent, el);
        });
        const len = matches.length;
        this.attr('mtch', len.toString());
        return len;
    }
    newNavDown() {
        const bndApply = this.applyProps.bind(this);
        let seed = this._trigger || this;
        if (this.from !== undefined) {
            seed = seed.closest(this.from);
            if (seed === null) {
                throw this.from + ' not found.';
            }
        }
        return new NavDown(seed, this.to, this.careOf, bndApply, this.m);
    }
    connectedCallback(trigger) {
        this._trigger = trigger;
        super.connectedCallback();
        this.attr('pds', '📞');
        if (!this.to) {
            //apply to next only
            this.to = '*';
            this.m = 1;
        }
        const pdnd = this.newNavDown();
        //const pdnd = new PDNavDown(this, this.to, nd => bndApply(nd), this.m);
        //pdnd.root = this;
        this._iIP = true;
        pdnd.init();
        this._iIP = false;
        this._pdNavDown = pdnd;
        this.init();
    }
}
PD.is = 'p-d';
PD.attributeProps = ({ disabled, on, to, careOf, noblock, val, prop, ifTargetMatches, m, from, observe, fireEvent, skipInit, debug, log, withPath, async, propFromEvent, capture, parseValAs, proxyId }) => {
    const bool = [disabled, noblock, skipInit, debug, log, async, capture];
    const num = [m];
    const str = [on, to, careOf, val, prop, ifTargetMatches, from, observe, fireEvent, withPath, propFromEvent, parseValAs, proxyId];
    const reflect = [...bool, ...num, ...str];
    return {
        bool,
        num,
        str,
        reflect
    };
};
define$1(PD);

const mainTemplate = createTemplate(/* html */ `
  <style>
      :host{
          display:block;
      }
      label{
          display:block;
      }
  </style>
  <label for=myInput part=label></label>
  <input id=myInput part=input>
`);
const [label$, input$] = [Symbol('label'), Symbol('input')];
const initTransform = ({ self }) => ({
    label: label$,
    input: [{}, { input: self.handleInput }, , , input$]
});
const updateLabel = ({ name }) => ({
    [label$]: name + ':',
});
const updateInput = ({ readOnly, inputType, disabled, value }) => ({
    [input$]: [{}, , { 'readonly': readOnly, type: inputType, disabled: disabled, value: value }]
});
const updateTransforms = [
    updateLabel, updateInput
];
const linkInputType = ({ type, self }) => {
    switch (type) {
        case 'boolean':
            self.inputType = 'checkbox';
            break;
        case 'number':
            self.inputType = 'number';
            break;
        case 'string':
            self.inputType = 'text';
            break;
    }
};
const linkEditedValue = ({ value, self }) => {
    self.editedValue = value;
};
class SwagTagPrimitiveBase extends XtalElement {
    constructor() {
        super();
        this.readyToInit = true;
        this.mainTemplate = mainTemplate;
        this.readyToRender = true;
        this.initTransform = initTransform;
        this.propActions = [
            linkInputType, linkEditedValue
        ];
        this.updateTransforms = updateTransforms;
        this.eventScopes = [[, 'bubbles']];
    }
    handleInput(e) {
        this.editedValue = e.target.value;
    }
}
SwagTagPrimitiveBase.is = 'swag-tag-primitive-base';
SwagTagPrimitiveBase.attributeProps = ({ readOnly, type, testValues, value, disabled, eventScopes, name, description, inputType, editedValue }) => ({
    bool: [readOnly, disabled],
    async: [readOnly, inputType, disabled, value],
    str: [type, value, name, description, inputType, editedValue],
    notify: [editedValue],
    obj: ['default', testValues, eventScopes],
    jsonProp: [eventScopes],
    reflect: [readOnly, type, disabled, name, inputType]
});
define(SwagTagPrimitiveBase);

import('./json-viewer-89013c5c.js');
const mainTemplate$1 = createTemplate(/* html */ `
<style>
details{
    max-height: 300px;
    overflow-y:auto;
}
</style>
<details open>
    <summary>Event History</summary>
    <json-viewer -object></json-viewer>
</details>
`);
const jsonViewer = Symbol('json-viewer');
const details = Symbol('details');
const initTransform$1 = {
    details: {
        'json-viewer': jsonViewer
    },
    '"': [{ style: { display: 'none' } }, , , , details]
};
const allowList = ['detail', 'type', 'bubbles', 'cancelBubble', 'cancelable', 'composed', 'defaultPrevented', 'eventPhase', 'isTruted', 'returnValue', 'timeStamp'];
const appendToEventArchive = ({ newEvent, self }) => {
    if (newEvent === undefined)
        return;
    const safeEvent = {};
    allowList.forEach(prop => {
        safeEvent[prop] = newEvent[prop];
    });
    if (self.eventArchive === undefined) {
        self.eventArchive = {
            eventHistory: []
        };
    }
    self.eventArchive.eventHistory.unshift(safeEvent);
    self.eventArchive = self.eventArchive;
};
const bindJsonViewer = ({ eventArchive }) => ({
    [jsonViewer]: [{ object: eventArchive }],
    [details]: [{ style: { display: 'block' } }]
});
const updateTransforms$1 = [bindJsonViewer];
class JsonEventViewer extends XtalElement {
    constructor() {
        super(...arguments);
        this.readyToInit = true;
        this.mainTemplate = mainTemplate$1;
        this.readyToRender = true;
        this.initTransform = initTransform$1;
        this.propActions = [appendToEventArchive];
        this.updateTransforms = updateTransforms$1;
    }
}
JsonEventViewer.is = 'json-event-viewer';
JsonEventViewer.attributeProps = ({ newEvent, eventArchive }) => ({
    obj: [newEvent, eventArchive]
});
define(JsonEventViewer);

const debounce$2 = (fn, time) => {
    let timeout;
    return function () {
        const functionCall = () => fn.apply(this, arguments);
        clearTimeout(timeout);
        timeout = setTimeout(functionCall, time);
    };
};

//export const propUp: unique symbol = Symbol.for('8646ccd5-3ffd-447a-a4df-0022ca3a8155');
//export const attribQueue: unique symbol = Symbol.for('02ca2c80-68e0-488f-b4b4-6859284848fb');
/**
 * Base mixin for many xtal- components
 * @param superClass
 */
function hydrate$2(superClass) {
    return class extends superClass {
        constructor() {
            super(...arguments);
            this.__conn = false;
        }
        /**
         * Set attribute value.
         * @param name
         * @param val
         * @param trueVal String to set attribute if true.
         */
        attr(name, val, trueVal) {
            if (val === undefined)
                return this.getAttribute(name);
            if (!this.__conn) {
                if (this.__attribQueue === undefined)
                    this.__attribQueue = [];
                this.__attribQueue.push({
                    name, val, trueVal
                });
                return;
            }
            const v = val ? 'set' : 'remove'; //verb
            this[v + 'Attribute'](name, trueVal || val);
        }
        /**
         * Needed for asynchronous loading
         * @param props Array of property names to "upgrade", without losing value set while element was Unknown
         * @private
         */
        __propUp(props) {
            const defaultValues = this.constructor['defaultValues'];
            props.forEach(prop => {
                let value = this[prop];
                if (value === undefined && defaultValues !== undefined) {
                    value = defaultValues[prop];
                }
                if (this.hasOwnProperty(prop)) {
                    delete this[prop];
                }
                if (value !== undefined)
                    this[prop] = value;
            });
        }
        connectedCallback() {
            this.__conn = true;
            const ep = this.constructor.props;
            this.__propUp([...ep.bool, ...ep.str, ...ep.num, ...ep.obj]);
            if (this.__attribQueue !== undefined) {
                this.__attribQueue.forEach(attribQItem => {
                    this.attr(attribQItem.name, attribQItem.val, attribQItem.trueVal);
                });
                this.__attribQueue = undefined;
            }
        }
    };
}

/**
 * Base class for many xtal- components
 * @param superClass
 */
function XtallatX$2(superClass) {
    var _a;
    return _a = class extends superClass {
            constructor() {
                super(...arguments);
                /**
                 * Tracks how many times each event type was called.
                 */
                this.__evCount = {};
                /**
                 * @private
                 */
                this.self = this;
                this._xlConnected = false;
                this.__propActionQueue = new Set();
            }
            /**
             * @private
             */
            static get evalPath() {
                return lispToCamel$3(this.is);
            }
            /**
             * @private
             */
            static get observedAttributes() {
                const props = this.props;
                return [...props.bool, ...props.num, ...props.str, ...props.jsonProp].map(s => camelToLisp$2(s));
            }
            static get props() {
                if (this.is === undefined)
                    return {};
                if (this[this.evalPath] === undefined) {
                    const args = deconstruct$2(this.attributeProps);
                    const arg = {};
                    args.forEach(token => {
                        arg[token] = token;
                    });
                    this[this.evalPath] = this.attributeProps(arg);
                    const ep = this[this.evalPath];
                    propCategories$2.forEach(propCat => {
                        ep[propCat] = ep[propCat] || [];
                    });
                }
                let props = this[this.evalPath];
                const superProps = Object.getPrototypeOf(this).props;
                if (superProps !== undefined)
                    props = mergeProps$2(props, superProps);
                return props;
            }
            /**
             * Turn number into string with even and odd values easy to query via css.
             * @param n
             */
            __to$(n) {
                const mod = n % 2;
                return (n - mod) / 2 + '-' + mod;
            }
            /**
             * Increment event count
             * @param name
             */
            __incAttr(name) {
                const ec = this.__evCount;
                if (name in ec) {
                    ec[name]++;
                }
                else {
                    ec[name] = 0;
                }
                this.attr('data-' + name, this.__to$(ec[name]));
            }
            onPropsChange(name) {
                let isAsync = false;
                const propInfoLookup = this.constructor[propInfoSym$2];
                if (Array.isArray(name)) {
                    name.forEach(subName => {
                        this.__propActionQueue.add(subName);
                        const propInfo = propInfoLookup[subName];
                        if (propInfo !== undefined && propInfo.async)
                            isAsync = true;
                    });
                }
                else {
                    this.__propActionQueue.add(name);
                    const propInfo = propInfoLookup[name];
                    if (propInfo !== undefined && propInfo.async)
                        isAsync = true;
                }
                if (this.disabled || !this._xlConnected) {
                    return;
                }
                if (!this.disabled) {
                    if (isAsync) {
                        this.__processActionDebouncer();
                    }
                    else {
                        this.__processActionQueue();
                    }
                }
            }
            attributeChangedCallback(n, ov, nv) {
                this[atrInit$2] = true; // track each attribute?
                const ik = this[ignoreAttrKey$2];
                if (ik !== undefined && ik[n] === true) {
                    delete ik[n];
                    return;
                }
                const propName = lispToCamel$3(n);
                const privatePropName = '_' + propName;
                //TODO:  Do we need this?
                // if((<any>this)[ignorePropKey] === undefined) (<any>this)[ignorePropKey] = {};
                // (<any>this)[ignorePropKey][propName] = true;
                const anyT = this;
                const ep = this.constructor.props;
                if (ep.str.includes(propName)) {
                    anyT[privatePropName] = nv;
                }
                else if (ep.bool.includes(propName)) {
                    anyT[privatePropName] = nv !== null;
                }
                else if (ep.num.includes(propName)) {
                    anyT[privatePropName] = parseFloat(nv);
                }
                else if (ep.jsonProp.includes(propName)) {
                    try {
                        anyT[privatePropName] = JSON.parse(nv);
                    }
                    catch (e) {
                        anyT[privatePropName] = nv;
                    }
                }
                this.onPropsChange(propName);
            }
            connectedCallback() {
                super.connectedCallback();
                this._xlConnected = true;
                this.__processActionDebouncer();
                this.onPropsChange('');
            }
            /**
             * Dispatch Custom Event
             * @param name Name of event to dispatch ("-changed" will be appended if asIs is false)
             * @param detail Information to be passed with the event
             * @param asIs If true, don't append event name with '-changed'
             * @private
             */
            [de$2](name, detail, asIs = false) {
                if (this.disabled)
                    return;
                const eventName = name + (asIs ? '' : '-changed');
                let bubbles = false;
                let composed = false;
                let cancelable = false;
                if (this.eventScopes !== undefined) {
                    const eventScope = this.eventScopes.find(x => (x[0] === undefined) || x[0].startsWith(eventName));
                    if (eventScope !== undefined) {
                        bubbles = eventScope[1] === 'bubbles';
                        cancelable = eventScope[2] === 'cancelable';
                        composed = eventScope[3] === 'composed';
                    }
                }
                const newEvent = new CustomEvent(eventName, {
                    detail: detail,
                    bubbles: bubbles,
                    composed: composed,
                    cancelable: cancelable,
                });
                this.dispatchEvent(newEvent);
                this.__incAttr(eventName);
                return newEvent;
            }
            get __processActionDebouncer() {
                if (this.___processActionDebouncer === undefined) {
                    this.___processActionDebouncer = debounce$2((getNew = false) => {
                        this.__processActionQueue();
                    }, 16);
                }
                return this.___processActionDebouncer;
            }
            propActionsHub(propAction) { }
            __processActionQueue() {
                if (this.propActions === undefined)
                    return;
                const queue = this.__propActionQueue;
                this.__propActionQueue = new Set();
                this.propActions.forEach(propAction => {
                    const dependencies = deconstruct$2(propAction);
                    const dependencySet = new Set(dependencies);
                    if (intersection$2(queue, dependencySet).size > 0) {
                        this.propActionsHub(propAction);
                        propAction(this);
                    }
                });
            }
        },
        /**
         * @private
         * @param param0
         */
        _a.attributeProps = ({ disabled }) => ({
            bool: [disabled],
        }),
        _a;
}
//utility fns
//const ignorePropKey = Symbol();
const ignoreAttrKey$2 = Symbol();
const propInfoSym$2 = Symbol('propInfo');
const atrInit$2 = Symbol('atrInit');
function define$2(MyElementClass) {
    const tagName = MyElementClass.is;
    let n = 0;
    let foundIt = false;
    let isNew = false;
    let name = tagName;
    do {
        if (n > 0)
            name = `${tagName}-${n}`;
        const test = customElements.get(name);
        if (test !== undefined) {
            if (test === MyElementClass) {
                foundIt = true; //all good;
                MyElementClass.isReally = name;
            }
        }
        else {
            isNew = true;
            MyElementClass.isReally = name;
            foundIt = true;
        }
        n++;
    } while (!foundIt);
    if (!isNew)
        return;
    const props = MyElementClass.props;
    const proto = MyElementClass.prototype;
    const flatProps = [...props.bool, ...props.num, ...props.str, ...props.obj];
    const existingProps = Object.getOwnPropertyNames(proto);
    MyElementClass[propInfoSym$2] = {};
    flatProps.forEach(prop => {
        if (existingProps.includes(prop))
            return;
        const privateKey = '_' + prop;
        const propInfo = {};
        propCategories$2.forEach(cat => {
            propInfo[cat] = props[cat].includes(prop);
        });
        MyElementClass[propInfoSym$2][prop] = propInfo;
        //TODO:  make this a bound function?
        Object.defineProperty(proto, prop, {
            get() {
                return this[privateKey];
            },
            set(nv) {
                const propInfo = MyElementClass[propInfoSym$2][prop];
                if (propInfo.dry) {
                    if (nv === this[privateKey])
                        return;
                }
                const c2l = camelToLisp$2(prop);
                if (propInfo.reflect) {
                    //experimental line -- we want the attribute to take precedence over default value.
                    if (this[atrInit$2] === undefined && this.hasAttribute(c2l))
                        return;
                    if (this[ignoreAttrKey$2] === undefined)
                        this[ignoreAttrKey$2] = {};
                    this[ignoreAttrKey$2][c2l] = true;
                    if (propInfo.bool) {
                        if ((nv && !this.hasAttribute(c2l)) || nv === false) {
                            this.attr(c2l, nv, '');
                        }
                        else {
                            this[ignoreAttrKey$2][c2l] = false;
                        }
                    }
                    else if (propInfo.str) {
                        this.attr(c2l, nv);
                    }
                    else if (propInfo.num) {
                        this.attr(c2l, nv.toString());
                    }
                    else if (propInfo.obj) {
                        this.attr(c2l, JSON.stringify(nv));
                    }
                }
                this[privateKey] = nv;
                if (propInfo.log) {
                    console.log(propInfo, nv);
                }
                if (propInfo.debug)
                    debugger;
                this.onPropsChange(prop);
                if (propInfo.notify) {
                    this[de$2](c2l, { value: nv });
                }
            },
            enumerable: true,
            configurable: true
        });
    });
    customElements.define(name, MyElementClass);
}
const de$2 = Symbol.for('1f462044-3fe5-4fa8-9d26-c4165be15551');
function mergeProps$2(props1, props2) {
    const returnObj = {};
    propCategories$2.forEach(propCat => {
        returnObj[propCat] = (props1[propCat] || []).concat(props2[propCat] || []);
    });
    return returnObj;
}
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
function intersection$2(setA, setB) {
    let _intersection = new Set();
    for (let elem of setB) {
        if (setA.has(elem)) {
            _intersection.add(elem);
        }
    }
    return _intersection;
}
const ltcRe$2 = /(\-\w)/g;
function lispToCamel$3(s) {
    return s.replace(ltcRe$2, function (m) { return m[1].toUpperCase(); });
}
const ctlRe$2 = /[\w]([A-Z])/g;
function camelToLisp$2(s) {
    return s.replace(ctlRe$2, function (m) {
        return m[0] + "-" + m[1];
    }).toLowerCase();
}
const p$1 = Symbol('placeholder');
function symbolize$1(obj) {
    for (var key in obj) {
        obj[key] = Symbol(key);
    }
}
const propCategories$2 = ['bool', 'str', 'num', 'reflect', 'notify', 'obj', 'jsonProp', 'dry', 'log', 'debug', 'async'];
const argList$2 = Symbol('argList');
function deconstruct$2(fn) {
    if (fn[argList$2] === undefined) {
        const fnString = fn.toString().trim();
        if (fnString.startsWith('({')) {
            const iPos = fnString.indexOf('})', 2);
            fn[argList$2] = fnString.substring(2, iPos).split(',').map(s => s.trim());
        }
        else {
            fn[argList$2] = [];
        }
    }
    return fn[argList$2];
}

const SkipSibs$1 = Symbol();
const NextMatch$1 = Symbol();
const more$1 = Symbol.for('e35fe6cb-78d4-48fe-90f8-bf9da743d532');
function transform$1(sourceOrTemplate, ctx, target = sourceOrTemplate) {
    ctx.ctx = ctx;
    const isATemplate = isTemplate$1(sourceOrTemplate);
    const source = isATemplate
        ? sourceOrTemplate.content.cloneNode(true)
        : sourceOrTemplate;
    processFragment$1(source, ctx);
    let verb = "appendChild";
    const options = ctx.options;
    if (options !== undefined) {
        if (options.prepend)
            verb = "prepend";
        const callback = options.initializedCallback;
        if (callback !== undefined)
            callback(ctx, source, options);
    }
    if (isATemplate && target) {
        target[verb](source);
    }
    ctx.mode = 'update';
    return ctx;
}
function isTemplate$1(test) {
    return test !== undefined && test.localName === 'template' && test.content && (typeof test.content.cloneNode === 'function');
}
function copyCtx$1(ctx) {
    return Object.assign({}, ctx);
}
function restoreCtx$1(ctx, originalCtx) {
    return (Object.assign(ctx, originalCtx));
}
function processFragment$1(source, ctx) {
    const transf = ctx.Transform;
    if (transf === undefined)
        return;
    const transforms = Array.isArray(transf) ? transf : [transf];
    const isInit = ctx.mode === undefined;
    transforms.forEach(transform => {
        const start = { level: 0, idx: 0 };
        if (isInit) {
            start.mode = 'init';
        }
        Object.assign(ctx, start);
        ctx.target = source.firstElementChild;
        ctx.Transform = transform;
        processEl$1(ctx);
        processSymbols$1(ctx);
    });
}
function processSymbols$1(ctx) {
    const transf = ctx.Transform;
    for (const sym of Object.getOwnPropertySymbols(transf)) {
        let transformTemplateVal = transf[sym];
        if (sym === more$1) {
            ctx.Transform = transformTemplateVal;
            processSymbols$1(ctx);
            ctx.Transform = transf;
        }
        const newTarget = (ctx[sym] || ctx.host[sym]);
        if (newTarget === undefined)
            continue;
        ctx.target = newTarget;
        while (typeof transformTemplateVal === 'function') {
            transformTemplateVal = transformTemplateVal(ctx);
        }
        switch (typeof (transformTemplateVal)) {
            case 'string':
                newTarget.textContent = transformTemplateVal;
                break;
            case 'object':
                ctx.customObjProcessor('', transformTemplateVal, ctx);
                break;
            case 'boolean':
                if (transformTemplateVal === false)
                    newTarget.remove();
        }
    }
}
function processEl$1(ctx) {
    const target = ctx.target;
    if (target == null || ctx.Transform === undefined)
        return true;
    if (target.hasAttribute('debug'))
        debugger;
    const keys = Object.keys(ctx.Transform);
    if (keys.length === 0)
        return true;
    const firstCharOfFirstProp = keys[0][0];
    let isNextStep = "SNTM".indexOf(firstCharOfFirstProp) > -1;
    if (isNextStep) {
        doNextStepSelect$1(ctx);
        doNextStepSibling$1(ctx);
    }
    let nextElementSibling = target;
    const tm = ctx.Transform;
    let matched = false;
    while (nextElementSibling !== null) {
        if (ctx.itemTagger !== undefined)
            ctx.itemTagger(nextElementSibling);
        let removeNextElementSibling = false;
        for (let i = 0, ii = keys.length; i < ii; i++) {
            const key = keys[i];
            if (key === 'debug') {
                debugger;
                continue;
            }
            if (key.startsWith('"')) {
                if (!matched)
                    continue;
            }
            else {
                let modifiedSelector = key;
                if (key === ':host') {
                    if (nextElementSibling !== ctx.host) {
                        matched = false;
                    }
                }
                else if (key.startsWith(':has(>')) {
                    const query = key.substring(6, key.length - 1);
                    let foundMatch = false;
                    for (let i = 0, ii = nextElementSibling.children.length; i < ii; i++) {
                        const el = nextElementSibling.children[i];
                        if (el.matches(query)) {
                            foundMatch = true;
                            break;
                        }
                    }
                    if (!foundMatch) {
                        matched = false;
                        continue;
                    }
                }
                else {
                    if (key.endsWith('Part')) {
                        modifiedSelector = `[part="${key.substring(0, key.length - 4)}"]`;
                    }
                    if (!nextElementSibling.matches(modifiedSelector)) {
                        matched = false;
                        continue;
                    }
                }
            }
            matched = true;
            ctx.target = nextElementSibling;
            const tvo = getRHS$1(tm[key], ctx);
            if (key.endsWith(']')) {
                //TODO use named capture group reg expression
                const pos = key.lastIndexOf('[');
                if (pos > -1 && key[pos + 1] === '-') {
                    const propName = lispToCamel$4(key.substring(pos + 2, key.length - 1));
                    nextElementSibling[propName] = tvo;
                    continue;
                }
            }
            switch (typeof tvo) {
                case 'string':
                    nextElementSibling.textContent = tvo;
                    break;
                case 'boolean':
                    if (tvo === false)
                        removeNextElementSibling = true;
                    break;
                case 'object':
                    if (tvo === null)
                        continue;
                    ctx.customObjProcessor(key, tvo, ctx);
                    break;
                case 'symbol':
                    const cache = ctx.host || ctx;
                    cache[tvo] = nextElementSibling;
                case 'undefined':
                    continue;
            }
        }
        const elementToRemove = (removeNextElementSibling || nextElementSibling.dataset.deleteMe === 'true') ?
            nextElementSibling : undefined;
        const nextMatch = nextElementSibling[NextMatch$1];
        const prevEl = nextElementSibling;
        if (prevEl[SkipSibs$1]) {
            nextElementSibling = null;
        }
        else if (nextMatch !== undefined) {
            nextElementSibling = closestNextSib$1(nextElementSibling, nextMatch);
        }
        else {
            nextElementSibling = nextElementSibling.nextElementSibling;
        }
        prevEl[SkipSibs$1] = false;
        prevEl[NextMatch$1] = undefined;
        if (elementToRemove !== undefined)
            elementToRemove.remove();
    }
    return true;
}
const stcRe$1 = /(\-\w)/g;
function lispToCamel$4(s) {
    return s.replace(stcRe$1, function (m) { return m[1].toUpperCase(); });
}
function getProp$2(val, pathTokens) {
    let context = val;
    for (const token of pathTokens) {
        context = context[token];
        if (context === undefined)
            break;
    }
    return context;
}
function closestNextSib$1(target, match) {
    let nextElementSibling = target.nextElementSibling;
    while (nextElementSibling !== null) {
        if (nextElementSibling.matches(match))
            return nextElementSibling;
        nextElementSibling = nextElementSibling.nextElementSibling;
    }
    return null;
}
function doNextStepSelect$1(ctx) {
    const nextStep = ctx.Transform;
    if (nextStep.Select === undefined)
        return;
    let nextEl = ctx.target.querySelector(nextStep.Select);
    if (nextEl === null)
        return;
    const inherit = !!nextStep.MergeTransforms;
    let mergedTransform = nextStep.Transform || ctx.previousTransform;
    if (inherit && nextStep.Transform) {
        const newTransform = nextStep.Transform;
        mergedTransform = Object.assign({}, newTransform);
        if (ctx.previousTransform !== undefined && inherit) {
            Object.assign(mergedTransform, ctx.previousTransform);
        }
    }
    const copy = copyCtx$1(ctx);
    ctx.Transform = mergedTransform;
    ctx.target = nextEl;
    processEl$1(ctx);
    restoreCtx$1(ctx, copy);
}
function doNextStepSibling$1(ctx) {
    const nextStep = ctx.Transform;
    const aTarget = ctx.target;
    (aTarget)[SkipSibs$1] = nextStep.SkipSibs || (aTarget)[SkipSibs$1];
    aTarget[NextMatch$1] = (aTarget[NextMatch$1] === undefined) ? nextStep.NextMatch : aTarget[NextMatch$1] + ', ' + nextStep.NextMatch;
}
function getRHS$1(expr, ctx) {
    switch (typeof expr) {
        case 'undefined':
        case 'string':
        case 'symbol':
        case 'boolean':
            return expr;
        case 'function':
            return getRHS$1(expr(ctx), ctx);
        case 'object':
            if (expr === null)
                return expr;
            if (!Array.isArray(expr) || expr.length === 0)
                return expr;
            const pivot = expr[0];
            switch (typeof pivot) {
                case 'object':
                case 'undefined':
                case 'string':
                    return expr;
                case 'function':
                    const val = expr[0](ctx);
                    return getRHS$1([val, ...expr.slice(1)], ctx);
                case 'boolean':
                    if (isTemplate$1(expr[1]))
                        return expr;
                    return getRHS$1(pivot ? expr[1] : expr[2], ctx);
                case 'symbol':
                    return ctx[pivot].fn(ctx, expr);
            }
        case 'number':
            return expr.toString();
    }
}

const _transformDebouncer$1 = Symbol();
const transformDebouncer$1 = Symbol();
class XtalElement$1 extends XtallatX$2(hydrate$2(HTMLElement)) {
    constructor() {
        super(...arguments);
        /**
         * @private
         */
        this.noShadow = false;
        this._renderOptions = {};
        this._mainTemplateProp = 'mainTemplate';
        this.__initRCIP = false;
        this._propChangeQueue = new Set();
    }
    get renderOptions() {
        return this._renderOptions;
    }
    initRenderCallback(ctx, target) { }
    /**
     * @private
     */
    get root() {
        if (this.noShadow)
            return this;
        if (this.shadowRoot == null) {
            this.attachShadow({ mode: 'open' });
        }
        return this.shadowRoot;
    }
    afterInitRenderCallback(ctx, target, renderOptions) { }
    afterUpdateRenderCallback(ctx, target, renderOptions) { }
    async initRenderContext() {
        const plugins = await this.plugins();
        this.transformHub(this.initTransform);
        const isInitTransformAFunction = typeof this.initTransform === 'function';
        if (isInitTransformAFunction && this.__initTransformArgs === undefined) {
            this.__initTransformArgs = new Set(deconstruct$2(this.initTransform));
        }
        const ctx = {
            Transform: isInitTransformAFunction ? this.initTransform(this) : this.initTransform,
            host: this,
            cache: this.constructor,
            mode: 'init',
        };
        Object.assign(ctx, plugins);
        ctx.ctx = ctx;
        return ctx;
    }
    async plugins() {
        const { doObjectMatch, repeateth, interpolateSym, interpolatePlugin, templStampSym, templStampPlugin } = await import('./standardPlugins-5d6be390.js');
        return {
            customObjProcessor: doObjectMatch,
            repeatProcessor: repeateth,
            [interpolateSym]: interpolatePlugin,
            [templStampSym]: templStampPlugin
        };
    }
    get [transformDebouncer$1]() {
        if (this[_transformDebouncer$1] === undefined) {
            this[_transformDebouncer$1] = debounce$2((getNew = false) => {
                this.transform();
            }, 16);
        }
        return this[_transformDebouncer$1];
    }
    transformHub(transform) {
    }
    async transform() {
        if (this.__initRCIP)
            return;
        const readyToRender = this.readyToRender;
        let evaluateAllUpdateTransforms = false;
        if (readyToRender === false)
            return;
        if (typeof (readyToRender) === 'string') {
            if (readyToRender !== this._mainTemplateProp) {
                this.root.innerHTML = '';
                this._renderContext = undefined;
            }
        }
        if (this.updateTransforms === undefined) {
            //Since there's no delicate update transform,
            //assumption is that if data changes, just redraw based on init
            this.root.innerHTML = '';
        }
        else {
            if (this.__initTransformArgs && intersection$2(this._propChangeQueue, this.__initTransformArgs).size > 0) {
                //we need to restart the ui initialization, since the initialization depended on some properties that have since changed.
                //reset the UI
                this.root.innerHTML = '';
                delete this._renderContext;
                evaluateAllUpdateTransforms = true;
            }
        }
        let rc = this._renderContext;
        let target;
        let isFirst = true;
        if (rc === undefined) {
            this.dataset.upgraded = 'true';
            this.__initRCIP = true;
            rc = this._renderContext = await this.initRenderContext();
            rc.options = {
                initializedCallback: this.afterInitRenderCallback.bind(this),
            };
            target = this[this._mainTemplateProp].content.cloneNode(true);
            await transform$1(target, rc);
            delete rc.options.initializedCallback;
            this.__initRCIP = false;
        }
        else {
            target = this.root;
            isFirst = false;
        }
        if (this.updateTransforms !== undefined) {
            const propChangeQueue = this._propChangeQueue;
            this._propChangeQueue = new Set();
            this.updateTransforms.forEach(async (selectiveUpdateTransform) => {
                const dependencies = deconstruct$2(selectiveUpdateTransform);
                const dependencySet = new Set(dependencies);
                if (evaluateAllUpdateTransforms || intersection$2(propChangeQueue, dependencySet).size > 0) {
                    this._renderOptions.updatedCallback = this.afterUpdateRenderCallback.bind(this);
                    this.transformHub(selectiveUpdateTransform);
                    rc.Transform = selectiveUpdateTransform(this);
                    await transform$1(target, rc);
                    //rc!.update!(rc!, this.root);
                }
            });
        }
        if (isFirst) {
            this.root.appendChild(target);
        }
    }
    async onPropsChange(name, skipTransform = false) {
        super.onPropsChange(name);
        this._propChangeQueue.add(name);
        if (this.disabled || !this._xlConnected || !this.readyToInit) {
            return;
        }
        if (!skipTransform) {
            await this.transform();
        }
    }
}

function createTemplate$1(html, context, symbol) {
    const useCache = (context !== undefined) && (symbol !== undefined);
    const cache = context !== undefined ? (context.cache ? context.cache : context) : undefined;
    if (useCache) {
        if (cache[symbol] !== undefined)
            return cache[symbol];
    }
    const template = document.createElement("template");
    template.innerHTML = html;
    if (useCache) {
        cache[symbol] = template;
    }
    return template;
}

function stamp$1(fragment, attr, refs, ctx) {
    const target = ctx.host || ctx.cache;
    Array.from(fragment.getRootNode().querySelectorAll(`[${attr}]`)).forEach(el => {
        const val = el.getAttribute(attr);
        const sym = refs[val];
        if (sym !== undefined) {
            target[sym] = el;
        }
    });
}
function fromTuple$1(ctx, pia) {
    stamp$1(ctx.target, 'id', pia[1], ctx);
    stamp$1(ctx.target, 'part', pia[1], ctx);
}
const templStampSym$1 = Symbol.for('Dd5nJwRNaEiFtfam5oaSkg');
const plugin$1 = {
    fn: fromTuple$1,
    sym: templStampSym$1
};

const mainTemplate$2 = createTemplate$1(/* html */ `
    <div class="remove" part=remove>Remove item by deleting a property name.</div>
    <div data-type=string part=editor>
        <div part=field class=field>
            <button part=expander class="expander nonPrimitive">+</button><input part=key><input part=value class=value>
            <div part=childInserters class="nonPrimitive childInserters" data-open=false>
                <button part=objectAdder class=objectAdder>add object</button>
                <button part=stringAdder class=stringAdder>add string</button>
                <button part=boolAdder class=boolAdder>add bool</button>
                <button part=numberAdder class=numberAdder>add number</button>
            </div>
        </div>
        <div part=childEditors class="nonPrimitive childEditors" data-open=false></div>
        
    </div>
    <style>
        :host{
            display:block;
        }
        .expander{
            width: fit-content;
            height: fit-content;
            padding-left: 0px;
            padding-right: 0px;
            width:20px;
        }
        .objectAdder{
            background-color: #E17000;
        }
        .stringAdder{
            background-color: #009408;
        }
        .boolAdder{
            background-color: #B1C639;
        }
        .numberAdder{
            background-color: #497B8D;
        }
        .childInserters button{
            color: white;
            text-shadow:1px 1px 1px black;
            border-radius: 5px;
            padding: 2;
            border: none;
        }
        .remove{
            padding: 2px 4px;
            -webkit-border-radius: 5px;
            -moz-border-radius: 5px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            text-shadow: 1px 1px 1px black;
            background-color: black;
        }

        .field{
            display:flex;
            flex-direction:row;
            line-height: 20px;
            margin-top: 2px;
            align-items: center;
        }
        .childInserters{
            display: flex;
            justify-content: center;
        }
        .childEditors{
            margin-left: 25px;
        }
        div[part="childEditors"][data-open="false"]{
            display: none;
        }
        [data-type="object"] button.nonPrimitive{
            display: inline;
        }
        [data-type="object"] div.nonPrimitive[data-open="true"]{
            display: block;
        }
        [data-type="array"] button.nonPrimitive{
            display: inline;
        }
        [data-type="array"] div.nonPrimitive[data-open="true"]{
            display: block;
        }
        [data-type="string"] .nonPrimitive{
            display: none;
        }
        [data-type="number"] .nonPrimitive{
            display: none;
        }
        [data-type="boolean"] .nonPrimitive{
            display: none;
        }
        [data-type="string"] [part="key"]{
            background-color: rgb(0, 148, 8);
        }
        [data-type="boolean"] [part="key"]{
            background-color: #B1C639;
        }
        [data-type="object"] [part="key"]{
            background-color: rgb(225, 112, 0);
        }
        [data-type="number"] [part="key"]{
            background-color: rgb(73, 123, 141);
        }
        [data-type="array"] [part="key"]{
            background-color: rgb(45, 91, 137);
        }
        .value{
            background-color: #ECF3C3;
            flex-grow: 5;
        }

        input {
            border: none;
            -webkit-border-radius: 5px;
            -moz-border-radius: 5px;
            border-radius: 5px;
            padding: 3px;
            margin-right: 2px;
        }

    </style>
`);
const refs = { key: p$1, value: p$1, editor: p$1, childEditors: p$1, expander: p$1, objectAdder: p$1, stringAdder: p$1, boolAdder: p$1, remove: p$1, numberAdder: p$1 };
symbolize$1(refs);
const initTransform$2 = ({ self, type, hasParent }) => ({
    ':host': [templStampSym$1, refs],
    [refs.expander]: [{}, { click: self.toggle }],
    [refs.key]: [{}, { change: [self.handleKeyChange, 'value'] }],
    [refs.value]: [{}, { change: [self.handleValueChange, 'value'] }],
    [refs.objectAdder]: [{}, { click: self.addObject }],
    [refs.stringAdder]: [{}, { click: self.addString }],
    [refs.boolAdder]: [{}, { click: self.addBool }],
    [refs.numberAdder]: [{}, { click: self.addNumber }],
    [refs.remove]: !hasParent
});
const updateTransforms$2 = [
    ({ type }) => ({
        [refs.editor]: [{ dataset: { type: type } }],
    }),
    ({ value }) => ({
        [refs.value]: [{ value: value }]
    }),
    ({ uiValue }) => ({
        [refs.value]: [uiValue === undefined ? undefined : { value: uiValue }]
    }),
    ({ key }) => ({
        [refs.key]: [{ value: key }]
    }),
    ({ childValues, type, self }) => ({
        //insert child editor elements
        [refs.childEditors]: [childValues, XtalEditorBasePrimitive.is, , ({ target, item, idx }) => {
                if (!target)
                    return;
                //TODO:  enhance(?) TR to make this declarative
                switch (typeof item) {
                    case 'object':
                        target.key = item.key;
                        target.value = item.value;
                        break;
                    default:
                        target.value = item;
                        target.key = idx.toString();
                }
                target.hasParent = true;
                target.addEventListener('internal-update-count-changed', e => {
                    self.upwardDataFlowInProgress = true;
                });
            }]
    }),
    ({ open }) => ({
        [refs.expander]: open ? '-' : '+',
        [refs.childEditors]: [{ dataset: { open: (!!open).toString() } }]
    })
];
const linkTypeAndParsedObject = ({ value, self }) => {
    let parsedObject = value;
    if (value !== undefined) {
        if (value === 'true' || value === 'false') {
            self.type = 'boolean';
        }
        else if (!isNaN(value)) {
            self.type = 'number';
        }
        else {
            try {
                parsedObject = JSON.parse(value);
                if (Array.isArray(parsedObject)) {
                    self.type = 'array';
                }
                else {
                    self.type = 'object';
                }
            }
            catch (e) {
                self.type = 'string';
            }
        }
    }
    self.parsedObject = parsedObject;
};
const link_ParsedObject = ({ uiValue, self }) => {
    if (uiValue === undefined)
        return;
    switch (self.type) {
        case 'object':
        case 'array':
            self._parsedObject = JSON.parse(uiValue);
            self._value = uiValue;
            self.dispatchEvent(new CustomEvent('parsed-object-changed', {
                detail: {
                    value: self._parsedObject
                }
            }));
    }
};
function toString(item) {
    switch (typeof item) {
        case 'string':
            return item;
        case 'number':
        case 'boolean':
            return item.toString();
        case 'object':
            return JSON.stringify(item);
    }
}
const linkChildValues = ({ parsedObject, type, self }) => {
    if (parsedObject === undefined) {
        self.childValues = undefined;
        return;
    }
    switch (type) {
        case 'array':
            self.childValues = parsedObject.map(item => toString(item));
            break;
        case 'object':
            const childValues = [];
            for (var key in parsedObject) {
                childValues.push({
                    key: key,
                    value: toString(parsedObject[key]),
                });
            }
            self.childValues = childValues;
            return;
    }
};
const linkValueFromChildren = ({ upwardDataFlowInProgress, self, type }) => {
    if (!upwardDataFlowInProgress)
        return;
    const children = Array.from(self.shadowRoot.querySelectorAll(XtalEditorBasePrimitive.is));
    switch (type) {
        case 'object':
            {
                const newVal = {}; //TODO: support array type
                children.forEach(child => {
                    newVal[child.key] = child.parsedObject; //TODO: support for none primitive
                });
                self.uiValue = JSON.stringify(newVal);
            }
            break;
        case 'array':
            {
                const newVal = [];
                children.forEach(child => {
                    newVal.push(child.parsedObject); //TODO: support for none primitive
                });
                self.uiValue = JSON.stringify(newVal);
            }
            break;
    }
    self.incrementUpdateCount();
    self.upwardDataFlowInProgress = false;
};
const addObject = ({ objCounter, self }) => {
    if (objCounter === undefined)
        return;
    self.open = true;
    const newObj = { ...self.parsedObject };
    newObj['object' + objCounter] = {};
    self.value = JSON.stringify(newObj);
};
const addString = ({ strCounter, self }) => {
    if (strCounter === undefined)
        return;
    const newObj = { ...self.parsedObject };
    newObj['string' + strCounter] = 'val' + strCounter;
    self.value = JSON.stringify(newObj);
    self.open = true;
};
const addBool = ({ boolCounter, self }) => {
    if (boolCounter === undefined)
        return;
    const newObj = { ...self.parsedObject };
    newObj['bool' + boolCounter] = 'false';
    self.value = JSON.stringify(newObj);
    self.open = true;
};
const addNumber = ({ numberCounter, self }) => {
    if (numberCounter === undefined)
        return;
    const newObj = { ...self.parsedObject };
    newObj['number' + numberCounter] = '0';
    self.value = JSON.stringify(newObj);
    self.open = true;
};
const propActions = [linkTypeAndParsedObject, linkChildValues, linkValueFromChildren, addObject, addString, addBool, addNumber, link_ParsedObject];
class XtalEditorBasePrimitive extends XtalElement$1 {
    constructor() {
        super(...arguments);
        this.readyToInit = true;
        this.readyToRender = true;
        this.mainTemplate = mainTemplate$2;
        this.initTransform = initTransform$2;
        this.updateTransforms = updateTransforms$2;
        this.propActions = propActions;
        this.actionCount = 0;
    }
    handleKeyChange(key) {
        if (key === '') {
            this.remove();
        }
        this.value = key;
    }
    handleValueChange(val) {
        this.value = val;
        this.incrementUpdateCount();
    }
    incrementUpdateCount() {
        this.internalUpdateCount = this.internalUpdateCount === undefined ? 0 : this.internalUpdateCount + 1;
    }
    toggle() {
        this.open = !this.open;
    }
    propActionsHub(propAction) {
    }
    transformHub(transform) {
    }
    addObject() {
        this.objCounter = this.objCounter === undefined ? 1 : this.objCounter + 1;
    }
    addString() {
        this.strCounter = this.strCounter === undefined ? 1 : this.strCounter + 1;
    }
    addBool() {
        this.boolCounter = this.boolCounter === undefined ? 1 : this.boolCounter + 1;
    }
    addNumber() {
        this.numberCounter = this.numberCounter === undefined ? 1 : this.numberCounter + 1;
    }
}
XtalEditorBasePrimitive.is = 'xtal-editor-base-primitive';
XtalEditorBasePrimitive.attributeProps = ({ value, uiValue, type, parsedObject, key, childValues, upwardDataFlowInProgress, internalUpdateCount, open, objCounter, strCounter, boolCounter, numberCounter, hasParent }) => ({
    bool: [upwardDataFlowInProgress, open, hasParent],
    dry: [type, parsedObject, value, hasParent],
    num: [internalUpdateCount, objCounter, strCounter, boolCounter, numberCounter],
    str: [value, type, key, uiValue],
    jsonProp: [value],
    obj: [parsedObject, childValues],
    notify: [internalUpdateCount, parsedObject],
});
define$2(XtalEditorBasePrimitive);

const mainTemplate$3 = createTemplate(/* html */ `
  <style>
      :host{
          display:block;
      }
      label{
          display:block
      }
  </style>
  <main>
    <label for=myInput part=label></label>
    <xtal-editor-base-primitive key=root part=xtalEditor></xtal-editor-base-primitive>
  </main>
`);
const uiRefs = {
    label: Symbol('label'),
    xtalEditor: Symbol('xtalEditor')
};
const initTransform$3 = ({ self, handleChange }) => ({
    ':host': [templStampSym, uiRefs],
    [uiRefs.xtalEditor]: [{}, { 'parsed-object-changed': handleChange }]
});
const updateLabel$1 = ({ name }) => ({
    [uiRefs.label]: [{ textContent: name + ':' }]
});
const updateJsonEditor = ({ value, name }) => ({
    [uiRefs.xtalEditor]: [{ value: value }]
});
const linkParsedObject = ({ value, self }) => {
    try {
        const parsed = JSON.parse(value);
        self.parsedObject = parsed;
    }
    catch (e) { }
};
const propActions$1 = [linkParsedObject, linkInputType];
class SwagTagJsonEditor extends SwagTagPrimitiveBase {
    constructor() {
        super(...arguments);
        this.propActions = propActions$1;
        this.mainTemplate = mainTemplate$3;
        this.initTransform = initTransform$3;
        this.updateTransforms = [
            updateLabel$1, updateJsonEditor
        ];
    }
    handleChange(e) {
        this.parsedObject = e.target.parsedObject;
    }
}
SwagTagJsonEditor.is = 'swag-tag-json-editor';
SwagTagJsonEditor.attributeProps = ({ parsedObject }) => ({
    obj: [parsedObject],
    notify: [parsedObject]
});
define(SwagTagJsonEditor);

//#region Templates 
//Very little top level styling used, so consumers can take the first crack at styling.
//So make what little styling there is  guaranteed to not affect anything else via guid.
const mainTemplate$4 = createTemplate(/* html */ `
<style id=0f0d62e5-0d00-4e70-ad90-277fcd94c963>
  fieldset[data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963"]>legend{
    cursor: pointer;
  }
  fieldset[data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963"][data-open="false"]>[part="scrollableArea"]{
    display: none;
  }
  fieldset[data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963"][data-open="true"]>[part="scrollableArea"]{
    max-height: 500px;
    overflow-y:auto;
    display:flex;
    flex-direction: column;
  }
</style>
<main>
<!-- pass down edited values / parsed objects to demo component -->
<p-d on=edited-value-changed to=section -care-of val=target.editedValue prop-from-event=target.name m=1 skip-init></p-d>
<p-d on=parsed-object-changed to=section -care-of val=target.parsedObject prop-from-event=target.name m=1 skip-init></p-d>
<header part=header>
</header>
<section part=section>
  <div part=componentHolder>
    <div part=componentListeners></div>
  </div>
</section>
<json-event-viewer -new-event part=jsonEventViewer></json-event-viewer>
<form part=propsEditor>
  <fieldset data-open="true" data-guid="0f0d62e5-0d00-4e70-ad90-277fcd94c963" part=fieldset>
    <legend part=legend><span part=action>Edit</span> <var part=componentName></var>'s properties</legend>
    <div part=scrollableArea>
    </div>
  </fieldset>
</form>

<details part=viewSchema>
  <summary>View Schema</summary>
  <json-viewer part=jsonViewer allowlist="name,properties,attributes,slots,events"></json-viewer>
</details>

</main>
`);
const eventListenerForJsonViewer = createTemplate(/* html */ `
<p-d from=section to=${JsonEventViewer.is}[-new-event] val=. skip-init m=1></p-d>
`);
//#endregion
//#region Transforms
const uiRefs$1 = {
    componentName: p, header: p, componentHolder: p, componentListeners: p, jsonViewer: p,
    fieldset: p, scrollableArea: p, legend: p
};
symbolize(uiRefs$1);
const initTransform$4 = ({ self, tag }) => ({
    ':host': [templStampSym, uiRefs$1],
    [uiRefs$1.legend]: [{}, { click: self.toggleForm }],
    main: {
        '[-care-of]': tag,
    }
});
const bindName = ({ name, innerTemplate }) => ({
    [uiRefs$1.header]: `<${name}>`,
    [uiRefs$1.componentName]: name,
    [uiRefs$1.componentHolder]: [name, 'afterBegin'],
    [more]: {
        [uiRefs$1.componentHolder]: {
            [name]: ({ target }) => {
                if (innerTemplate !== undefined) {
                    target.appendChild(innerTemplate.content.cloneNode(true));
                }
            }
        }
    }
});
const addEventListeners = ({ events, name }) => ({
    [uiRefs$1.componentListeners]: [events || [], eventListenerForJsonViewer, , {
            [PD.is]: ({ item }) => [{ observe: name, on: item.name }]
        }]
});
const copyPropInfoIntoEditor = ({ item, target }) => {
    Object.assign(target, item);
    target.setAttribute('role', 'textbox');
};
const copyPropInfoIntoEditors = {
    [`${SwagTagPrimitiveBase.is},${SwagTagJsonEditor.is}`]: copyPropInfoIntoEditor,
};
const addEditors = ({ massagedProps, name }) => ({
    // Loop over massagedProps, and insert dynamic editor via tag name (item.editor is the tag name)
    [uiRefs$1.scrollableArea]: [
        //Array to loop over
        massagedProps || [],
        //A **toTagOrTemplate** function that returns a string -- used to generate a (custom element) with the name of the string. 
        ({ item }) => item.editor,
        //range could go here
        ,
        //now that document.createElement(tag) done, apply transform
        copyPropInfoIntoEditors
    ]
});
const bindSelf = ({ attribs, self }) => ({
    [uiRefs$1.jsonViewer]: [{ object: self }]
});
const updateTransforms$3 = [
    bindName,
    addEventListeners,
    addEditors,
    bindSelf
];
//#endregion
//#region propActions
const linkWcInfo = ({ viewModel, tag, self }) => {
    if (tag === undefined || viewModel === undefined)
        return;
    const wcInfo = viewModel.tags.find(t => t.name === tag);
    wcInfo.attribs = wcInfo.attributes;
    delete wcInfo.attributes;
    Object.assign(self, wcInfo);
};
function adjustValueAndType(prop) {
    let defaultVal = prop.default;
    let parsedType = undefined;
    if (defaultVal !== undefined) {
        try {
            defaultVal = JSON.parse(defaultVal);
            parsedType = JSON.parse('[' + prop.type.replace(/\|/g, ',') + ']');
        }
        catch (e) { }
        if (Array.isArray(parsedType)) {
            prop.value = defaultVal;
            prop.type = 'stringArray';
            prop.options = parsedType;
            return;
        }
        switch (typeof defaultVal) {
            case 'object':
                prop.value = prop.default;
                prop.type = 'object';
                break;
            case 'string':
                prop.value = defaultVal;
                prop.type = 'string';
                break;
            case 'number':
                prop.value = defaultVal;
                prop.type = 'number';
                break;
            case 'boolean':
                prop.value = defaultVal;
                prop.type = 'boolean';
                break;
            default:
                prop.value = prop.default;
                prop.type = 'object';
        }
    }
    else {
        switch (prop.type) {
            case 'string':
            case 'boolean':
            case 'number':
                break;
            default:
                prop.type = 'object';
        }
    }
}
const massaged = Symbol();
const linkMassagedProps = ({ properties, self, block }) => {
    if (properties === undefined || properties[massaged])
        return;
    properties.forEach(prop => {
        adjustValueAndType(prop);
        const anyProp = prop;
        switch (prop.type) {
            case 'string':
            case 'number':
            case 'boolean':
                anyProp.editor = SwagTagPrimitiveBase.is;
                break;
            case 'object':
                anyProp.editor = SwagTagJsonEditor.is;
                break;
            default:
                throw 'not implemented';
        }
    });
    properties[massaged] = true;
    self.massagedProps = block !== undefined ? properties.filter(prop => !block.includes(prop.name)) : properties;
};
const linkInnerTemplate = ({ useInnerTemplate, self }) => {
    if (!useInnerTemplate)
        return;
    const innerTemplate = self.querySelector('template');
    if (innerTemplate === null) {
        setTimeout(() => {
            linkInnerTemplate(self);
        }, 50);
        return;
    }
    self.innerTemplate = innerTemplate;
};
const triggerImportReferencedModule = ({ path, self, skipImports }) => {
    if (path !== undefined && !skipImports) {
        if (self.href.indexOf('//') > -1 && self.href.indexOf('//') < 7) {
            const selfResolvingModuleSplitPath = self.href.split('/');
            selfResolvingModuleSplitPath.pop();
            const selfResolvingModulePath = selfResolvingModuleSplitPath.join('/') + self.path.substring(1) + '?module';
            import(selfResolvingModulePath);
        }
        else {
            const splitPath = (location.origin + location.pathname).split('/');
            splitPath.pop();
            let path = self.path;
            while (path.startsWith('../')) {
                splitPath.pop();
                path = path.substr(3);
            }
            const importPath = splitPath.join('/') + '/' + path;
            import(importPath);
        }
    }
};
const showHideEditor = ({ editOpen, self }) => {
    self[uiRefs$1.fieldset].dataset.open = (editOpen || false).toString();
};
//#endregion
/**
 * @csspart header
 * @csspart section
 * @csspart componentHolder
 * @csspart componentListeners
 * @csspart jsonEventViewer
 * @csspart propsEditor
 * @csspart fieldset
 * @csspart action
 * @csspart componentName
 * @csspart scrollableArea
 * @csspart viewSchema
 * @csspart jsonViewer
 */
class SwagTag extends XtalFetchViewElement {
    constructor() {
        super(...arguments);
        /**
         * @private
         */
        this.noShadow = true;
        this.mainTemplate = mainTemplate$4;
        this.readyToRender = true;
        this.propActions = [
            linkWcInfo, linkMassagedProps, triggerImportReferencedModule, showHideEditor, linkInnerTemplate
        ];
        this.initTransform = initTransform$4;
        this.updateTransforms = updateTransforms$3;
        /**
         * If test page contains needed imports, skip any imports contained in test script.
         * @attr skip-imports
         */
        this.skipImports = false;
    }
    toggleForm(e) {
        this.editOpen = !this.editOpen;
    }
}
SwagTag.is = "swag-tag";
SwagTag.attributeProps = ({ tag, name, properties, path, events, slots, testCaseNames, attribs, editOpen, block, useInnerTemplate, innerTemplate, skipImports }) => {
    const ap = {
        str: [tag, name, path],
        bool: [editOpen, useInnerTemplate, skipImports],
        obj: [properties, events, slots, testCaseNames, attribs, block, innerTemplate],
        jsonProp: [block],
        reflect: [tag, editOpen]
    };
    return mergeProps(ap, XtalFetchViewElement.props);
};
define(SwagTag);

export { addEditors as A, bindSelf as B, linkWcInfo as C, adjustValueAndType as D, linkMassagedProps as E, linkInnerTemplate as F, triggerImportReferencedModule as G, showHideEditor as H, SwagTag as S, doNextStepSibling as a, processSymbols as b, copyCtx as c, doNextStepSelect as d, templStampSym as e, plugin as f, getProp as g, isTemplate$1 as h, isTemplate as i, getProp$2 as j, copyCtx$1 as k, doNextStepSelect$1 as l, doNextStepSibling$1 as m, processEl$1 as n, processSymbols$1 as o, processEl as p, restoreCtx$1 as q, restoreCtx as r, transform$1 as s, transform as t, templStampSym$1 as u, plugin$1 as v, uiRefs$1 as w, bindName as x, addEventListeners as y, copyPropInfoIntoEditor as z };
