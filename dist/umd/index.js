(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react-redux'), require('redux'), require('lodash-es')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react-redux', 'redux', 'lodash-es'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global['@yuandana/reactx'] = {}, global.ReactRedux, global.Redux, global.lodash));
}(this, (function (exports, reactRedux, redux, lodashEs) { 'use strict';

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  /**
   * 判断数据是否为对象类型
   *
   * @param  {[type]} _data [description]
   * @return {[type]}       [description]
   */
  var isObject = function isObject(data) {
    return Object.prototype.toString.call(data) === '[object Object]';
  };
  /**
   * 判断数据是否为字符串类型
   *
   * @param  {[type]} _data [description]
   * @return {[type]}       [description]
   */

  var isString = function isString(data) {
    return Object.prototype.toString.call(data) === '[object String]';
  };
  /**
   * 判断数据是否为function
   *
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */

  var isFunction = function isFunction(data) {
    return Object.prototype.toString.call(data) === '[object Function]';
  };
  /**
   * 判断数据是否为 undefined
   *
   * @param {*} data
   * @returns
   */

  var isUndefined = function isUndefined(data) {
    return data === undefined;
  };
  /**
   * 创建命名空间名字
   */

  var getNamespacedName = function getNamespacedName(name, parentName) {
    return "".concat(parentName, ".").concat(name).toUpperCase();
  };

  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
  /**
   * ReactX 模块化核心类实现
   * 递归构造一个树状结构的实例
   * 每个实例上都有基于当前实例以及向子级操作的方法
   *
   * 示例
   * module = {
   *      state: {
   *          [key]: value
   *      },
   *      reducers: {
   *          // 保持当前Module唯一
   *          [reducerName]: () => {}
   *      },
   *      actions: {
   *          // 需要保持全局唯一
   *          [actionName]: () => {}
   *      },
   *      modules: {
   *          [childrenModuleName]: childrenModule
   *      }
   * }
   *
   * 如 namespaced = true
   * someModule = {
   *      namespaced: true
   * }
   * module = {
   *      modules: {
   *          a: someModule,
   *          b: someModule
   *      }
   * }
   * aModule 下的 actionName 将自动转为
   * dispatch(`A_${actionName}`, payload)
   */

  var ReactX = function ReactX(_ref) {
    var _this = this;

    var config = _ref.config,
        _name = _ref.name,
        _parentName = _ref.parentName,
        _preloadedState = _ref.preloadedState,
        _path = _ref.path;

    _classCallCheck(this, ReactX);

    _defineProperty(this, "constructorChildrenModule", function () {
      if (isObject(_this.preloadedState)) {
        var nextState = _objectSpread(_objectSpread({}, _this.state), _this.preloadedState);

        _this.state = nextState;
        _this.initState = nextState;
      } // 实例化所有子模块并存储在 this.children 下
      // this.children[childName] = new ReactX()


      Object.entries(_this.modules).forEach(function (_ref2) {
        var _ref3 = _slicedToArray(_ref2, 2),
            moduleName = _ref3[0],
            moduleConfig = _ref3[1];

        var preloadedState = _this.preloadedState,
            name = _this.name,
            path = _this.path;
        var childrenPreloadedState = preloadedState[moduleName];
        _this.children[moduleName] = new ReactX({
          config: moduleConfig,
          name: moduleName,
          parentName: name,
          preloadedState: childrenPreloadedState,
          path: path
        });
      });
    });

    _defineProperty(this, "constructorNamespacedReducers", function () {
      var namespaced = _this.namespaced,
          parentName = _this.parentName,
          reducers = _this.reducers;

      if (namespaced === false) {
        return;
      }

      if (!parentName) {
        return;
      }

      var result = {};
      Object.entries(reducers).forEach(function (_ref4) {
        var _ref5 = _slicedToArray(_ref4, 2),
            reducerName = _ref5[0],
            reducerFn = _ref5[1];

        var nextReducerName = getNamespacedName(reducerName, parentName);
        result[nextReducerName] = reducerFn;
      });
      _this.reducers = result;
    });

    _defineProperty(this, "constructorNamespacedActions", function () {
      var namespaced = _this.namespaced,
          parentName = _this.parentName,
          actions = _this.actions;

      if (namespaced === false) {
        return;
      }

      if (!parentName) {
        return;
      }

      var result = {};
      Object.entries(actions).forEach(function (_ref6) {
        var _ref7 = _slicedToArray(_ref6, 2),
            actionName = _ref7[0],
            actionFn = _ref7[1];

        var nextActionName = getNamespacedName(actionName, parentName);
        result[nextActionName] = actionFn;
      });
      _this.actions = result;
    });

    _defineProperty(this, "checkActions", function (instance) {
      var collection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var actionCollection = _objectSpread({}, collection);

      var nextInstance = instance || _this;
      var actions = nextInstance.actions,
          name = nextInstance.name,
          children = nextInstance.children;
      Object.keys(actions).forEach(function (actionName) {
        if (actionCollection[actionName]) {
          throw new Error("ReactX Error: No duplicate action name allowed! You can try using spacenamed under your module or rename your action. (".concat(name, ".").concat(actionName, ")"));
        } else {
          actionCollection[actionName] = true;
        }
      });
      Object.values(children).forEach(function (childInstance) {
        var childrenActionCollection = _this.checkActions(childInstance, actionCollection);

        actionCollection = _objectSpread(_objectSpread({}, actionCollection), childrenActionCollection);
      });
      return actionCollection;
    });

    _defineProperty(this, "checkReducers", function (instance) {
      var collection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var reducerCollection = _objectSpread({}, collection);

      var nextInstance = instance || _this;
      var reducers = nextInstance.reducers,
          name = nextInstance.name,
          children = nextInstance.children;
      Object.keys(reducers).forEach(function (reducerName) {
        if (reducerCollection[reducerName]) {
          throw new Error("ReactX Error: No duplicate reducer name allowed! You can try using spacenamed under your module or rename your reducer. (".concat(name, ".").concat(reducerName, ")"));
        } else {
          reducerCollection[reducerName] = true;
        }
      });
      Object.values(children).forEach(function (childInstance) {
        var childrenReducerCollection = _this.checkReducers(childInstance, reducerCollection);

        reducerCollection = _objectSpread(_objectSpread({}, reducerCollection), childrenReducerCollection);
      });
      return reducerCollection;
    });

    _defineProperty(this, "checkStateNameAndModuleNameConflicts", function () {
      Object.keys(_this.state).forEach(function (stateKey) {
        if (_this.modules[stateKey]) {
          throw new Error("ReactX Error: The ".concat(_this.name || 'root', " module state name conflicts with the module name"));
        }
      });
    });

    _defineProperty(this, "getInstanceByActionName", function (actionName) {
      if (_this.actions[actionName]) {
        return _this;
      }

      var result;
      Object.values(_this.children).find(function (childInstance) {
        var actionFn = childInstance.getInstanceByActionName(actionName);

        if (actionFn) {
          result = actionFn;
          return true;
        }

        return false;
      });
      return result;
    });

    _defineProperty(this, "getInstanceByReducerName", function (reducerName) {
      if (_this.reducers[reducerName]) {
        return _this;
      }

      var result;
      Object.values(_this.children).find(function (childInstance) {
        var reducerFn = childInstance.getInstanceByReducerName(reducerName);

        if (reducerFn) {
          result = reducerFn;
          return true;
        }

        return false;
      });
      return result;
    });

    _defineProperty(this, "getState", function () {
      var children = _this.children,
          state = _this.state;
      return Object.entries(children).reduce(function (accumulator, _ref8) {
        var _ref9 = _slicedToArray(_ref8, 2),
            moduleName = _ref9[0],
            moduleInstance = _ref9[1];

        return _objectSpread(_objectSpread({}, accumulator), {}, _defineProperty({}, moduleName, moduleInstance.getState()));
      }, state);
    });

    _defineProperty(this, "getInitState", function () {
      var children = _this.children,
          initState = _this.initState;
      return Object.entries(children).reduce(function (accumulator, _ref10) {
        var _ref11 = _slicedToArray(_ref10, 2),
            moduleName = _ref11[0],
            moduleInstance = _ref11[1];

        return _objectSpread(_objectSpread({}, accumulator), {}, _defineProperty({}, moduleName, moduleInstance.getInitState()));
      }, initState);
    });

    _defineProperty(this, "setState", function (state) {
      _this.state = state;
    });

    var _namespaced = config.namespaced,
        _state = config.state,
        _reducers = config.reducers,
        _actions = config.actions,
        modules = config.modules;
    this.config = config;
    this.namespaced = !!_namespaced;
    this.name = _name;
    this.parentName = _parentName;
    this.initState = _state || {};
    this.preloadedState = _preloadedState || {};
    this.path = _path ? "".concat(_path, ".").concat(_name) : _name;
    this.state = _state || {};
    this.reducers = _reducers || {};
    this.constructorNamespacedReducers();
    this.actions = _actions || {};
    this.constructorNamespacedActions();
    this.modules = modules || {};
    this.children = {};
    this.checkStateNameAndModuleNameConflicts();
    this.constructorChildrenModule();
  };

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  /**
   * Action 本质就是一个中间函数
   *
   * redux 本质的处理过程如下
   * redux = dispatch => reducer => state
   *
   * 构造一个实际存在且必须的 action 过程
   * reactx = dispatch => action => reducer => state
   *
   * 基于 redux
   *
   * dispatch action 时候采用 middleware 拦截判断
   * 处理 action 之后，调用 redux 的触发 reducer 的逻辑
   *
   * @param {*} rootInstance
   * @returns
   */

  var createActionMiddleware = function createActionMiddleware(rootInstance) {
    var getInstanceByActionName = rootInstance.getInstanceByActionName;
    /**
     * 实现 commit 的函数
     *
     * @param {*} store
     * @param {*} actionName
     * @returns
     */

    var commitHandler = function commitHandler(store, instance) {
      return function (reducerName, payload) {
        var dispatch = store.dispatch;
        var namespaced = instance.namespaced,
            parentName = instance.parentName;
        var nextReducerName = reducerName;

        if (namespaced === true) {
          if (reducerName.indexOf(parentName === null || parentName === void 0 ? void 0 : parentName.toString().toUpperCase()) === -1) {
            nextReducerName = getNamespacedName(reducerName, parentName);
          }
        }

        dispatch({
          type: nextReducerName,
          payload: payload,
          // ReactX 的设计原则，reducer 只能在 action 中调用
          // 在 commit 触发 redux 的 reducer 时候，加入isReactX的标识
          // 用于判断 reducer 一定是由 action => commit 的路径触发的
          // 而不是使用 redux 的 dispatch action.type 的方式绕过 action 直接触发 reducer
          isReactX: true
        });
      };
    };
    /**
     * 实现 action 的函数
     *
     * action 本质就是一个函数，本身并不属于 redux 中的缓解
     *
     * 这里 action 实际是 ReactX 实例中存储过的函数，寻找到后进行执行，
     * 并传入实现的 commit 函数逻辑来触发真正的 reducer
     *
     * @param {*} param0
     * @returns
     */


    var actionHandler = function actionHandler(_ref) {
      var actionName = _ref.actionName,
          actionFn = _ref.actionFn,
          store = _ref.store,
          payload = _ref.payload;
      var instance = getInstanceByActionName(actionName);

      var _ref2 = instance || {},
          state = _ref2.state;

      var rootState = store.getState();
      var commit = commitHandler(store, instance);
      var dispatch = store.dispatch;
      return actionFn.apply(void 0, [{
        state: state,
        rootState: rootState,
        commit: commit,
        dispatch: dispatch
      }].concat(_toConsumableArray(payload)));
    };
    /**
     * 根据 actionName 获取 actionFn
     *
     * @param {*} actionName
     * @returns
     */


    var getActionFnByActionName = function getActionFnByActionName(actionName) {
      var instance = getInstanceByActionName(actionName);

      var _ref3 = instance || {},
          _ref3$actions = _ref3.actions,
          actions = _ref3$actions === void 0 ? {} : _ref3$actions;

      return actions[actionName];
    };
    /**
     * actionMiddleware 创建方法
     *
     * 拦截所有 dispatch 发出的调用
     *
     * 其中 dispatch('SOME_ACTION_NAME', payload, otherParams) 我们需要拦截 交给 reactx 来处理
     *
     * 如果 dispatch({type: 'SOME_REDUCER_TYPE', payload}) 的形势为 redux 原生的对象方式
     * 使用 redux 原生的调用方式会抛错，必须先调用 action 由 action 中的 commit 函数调用对应的reducer
     *
     * @param {*} store
     * @returns actionMiddleware
     */


    return function (store) {
      return function (next) {
        return function (action) {
          if (isObject(action) && action.type) {
            // 原生 redux reducer
            var reducerName = action.type;
            var isReactX = action.isReactX,
                type = action.type,
                reducerPayload = action.payload;

            if (isReactX) {
              // 过滤掉 isReactX 标识
              var nextPlainObject = {
                type: type
              };

              if (reducerPayload) {
                nextPlainObject.payload = reducerPayload;
              }

              next(nextPlainObject);
            } else {
              throw new Error("ReactX Error: You Must call the reducer '".concat(reducerName, "' in a Action!"));
            }
          } else if (isString(action)) {
            // reactx
            var actionName = action;
            var actionFn = getActionFnByActionName(actionName);

            if (actionFn) {
              for (var _len = arguments.length, payload = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                payload[_key - 1] = arguments[_key];
              }

              return actionHandler({
                actionName: actionName,
                actionFn: actionFn,
                store: store,
                payload: payload
              });
            }

            throw new Error("ReactX Error: The Action function '".concat(actionName, "' is not registered!"));
          }

          return null;
        };
      };
    };
  };

  // import { merge } from 'lodash-es';
  /**
   * 根 reducer
   * reducer 其实就是一个 function
   * 根据传入进来的 type 执行 对应的reducer 并返回新的state
   *
   * 实际上所有 commit 最终会执行到这里
   *
   * @param {*} state
   * @param {*} action
   * @returns
   */

  var createRootReducer = function createRootReducer(rootInstance) {
    return function (_, action) {
      var getInstanceByReducerName = rootInstance.getInstanceByReducerName,
          getState = rootInstance.getState;
      var type = action.type,
          payload = action.payload;
      var reducerName = type;
      var isReduxAction = reducerName.indexOf('@@redux') !== -1;

      if (!isReduxAction) {
        var itemInstance = getInstanceByReducerName(reducerName);

        var _ref = itemInstance || {},
            moduleState = _ref.state,
            _ref$reducers = _ref.reducers,
            reducers = _ref$reducers === void 0 ? {} : _ref$reducers;

        var reducerFn = reducers[reducerName];

        if (reducerFn && isFunction(reducerFn)) {
          var nextModuleState = reducerFn(moduleState, payload);
          itemInstance.setState(nextModuleState);
        } else {
          throw new Error("[ReactX Error:] The Reducer function '".concat(reducerName, "' is not registered!"));
        }
      }

      return getState();
    };
  };

  var baseConfig = {};
  var createStore = function createStore() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var preloadedState = args[0],
        enhancer = args[1];
    var nextEnhancer;
    var nextPreloadedState = preloadedState;

    if (isFunction(preloadedState) && isUndefined(enhancer)) {
      nextEnhancer = preloadedState;
      nextPreloadedState = undefined;
    } // 判断 module 是否为 Object


    if (!isObject(config)) {
      throw new Error('ReactX Error: Expected the module to be a Object.');
    } // 合并默认 baseConfig


    var nextConfig = lodashEs.merge(baseConfig, config); // 实例化 reactx

    var rootInstance = new ReactX({
      config: nextConfig,
      preloadedState: nextPreloadedState
    }); // 验证 actions & reducers 的名称唯一性
    // 如果不唯一则抛错

    rootInstance.checkActions();
    rootInstance.checkReducers(); // 集成 actionMiddleware

    var actionMiddleware = createActionMiddleware(rootInstance);
    var reactXEnhancer = redux.applyMiddleware(actionMiddleware);

    if (nextEnhancer !== undefined) {
      // compose 原有的 applyMiddleware 或者 enhancer
      // 并保证 actionMiddleware 在第一位
      nextEnhancer = redux.compose(reactXEnhancer, nextEnhancer);
    } else {
      nextEnhancer = reactXEnhancer;
    } // 创建核心 reducer


    var rootReducer = createRootReducer(rootInstance); // 创建原生 redux store
    // createStore(reducer, [preloadedState], enhancer)

    var store = redux.createStore(rootReducer, nextPreloadedState, nextEnhancer); // [todo]
    // 自定义 store 的方法
    // 动态注册新的模块

    store.registerModule = function () {};

    return store;
  };

  Object.defineProperty(exports, 'Provider', {
    enumerable: true,
    get: function () {
      return reactRedux.Provider;
    }
  });
  Object.defineProperty(exports, 'batch', {
    enumerable: true,
    get: function () {
      return reactRedux.batch;
    }
  });
  Object.defineProperty(exports, 'connect', {
    enumerable: true,
    get: function () {
      return reactRedux.connect;
    }
  });
  Object.defineProperty(exports, 'connectAdvanced', {
    enumerable: true,
    get: function () {
      return reactRedux.connectAdvanced;
    }
  });
  Object.defineProperty(exports, 'useDispatch', {
    enumerable: true,
    get: function () {
      return reactRedux.useDispatch;
    }
  });
  Object.defineProperty(exports, 'useSelector', {
    enumerable: true,
    get: function () {
      return reactRedux.useSelector;
    }
  });
  Object.defineProperty(exports, 'useStore', {
    enumerable: true,
    get: function () {
      return reactRedux.useStore;
    }
  });
  exports.createStore = createStore;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
