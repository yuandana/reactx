import { isObject, getNamespacedName } from './utils';

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
class ReactX {
    constructor({ config, name, parentName, preloadedState, path }) {
        const { namespaced, state, reducers, actions, modules } = config;

        this.config = config;
        this.namespaced = !!namespaced;
        this.name = name;
        this.parentName = parentName;
        this.initState = state || {};
        this.preloadedState = preloadedState || {};
        this.path = path ? `${path}.${name}` : name;

        this.state = state || {};
        this.reducers = reducers || {};
        this.constructorNamespacedReducers();
        this.actions = actions || {};
        this.constructorNamespacedActions();
        this.modules = modules || {};

        this.children = {};

        this.checkStateNameAndModuleNameConflicts();
        this.constructorChildrenModule();
    }

    constructorChildrenModule = () => {
        if (isObject(this.preloadedState)) {
            const nextState = {
                ...this.state,
                ...this.preloadedState
            };

            this.state = nextState;
            this.initState = nextState;
        }
        // 实例化所有子模块并存储在 this.children 下
        // this.children[childName] = new ReactX()
        Object.entries(this.modules).forEach(([moduleName, moduleConfig]) => {
            const { preloadedState, name, path } = this;
            const childrenPreloadedState = preloadedState[moduleName];

            this.children[moduleName] = new ReactX({
                config: moduleConfig,
                name: moduleName,
                parentName: name,
                preloadedState: childrenPreloadedState,
                path
            });
        });
    };

    /**
     * 初始化时构造当前实例的 reducers
     *
     * @returns
     */
    constructorNamespacedReducers = () => {
        const { namespaced, parentName, reducers } = this;
        if (namespaced === false) {
            return;
        }
        if (!parentName) {
            return;
        }
        const result = {};
        Object.entries(reducers).forEach(([reducerName, reducerFn]) => {
            const nextReducerName = getNamespacedName(reducerName, parentName);
            result[nextReducerName] = reducerFn;
        });
        this.reducers = result;
    };

    /**
     * 初始化时构造当前实例的 actions
     *
     * @returns
     */
    constructorNamespacedActions = () => {
        const { namespaced, parentName, actions } = this;
        if (namespaced === false) {
            return;
        }
        if (!parentName) {
            return;
        }
        const result = {};
        Object.entries(actions).forEach(([actionName, actionFn]) => {
            const nextActionName = getNamespacedName(actionName, parentName);
            result[nextActionName] = actionFn;
        });
        this.actions = result;
    };

    /**
     * 校验所有 action 确认每个 actionName 保持全局唯一
     * 并返回 所有 action 的集合
     *
     * @param {*} instance
     * @param {*} collection
     * @returns
     */
    checkActions = (instance, collection = {}) => {
        let actionCollection = { ...collection };
        const nextInstance = instance || this;
        const { actions, name, children } = nextInstance;

        Object.keys(actions).forEach(actionName => {
            if (actionCollection[actionName]) {
                throw new Error(
                    `ReactX Error: No duplicate action name allowed! You can try using spacenamed under your module or rename your action. (${name}.${actionName})`
                );
            } else {
                actionCollection[actionName] = true;
            }
        });

        Object.values(children).forEach(childInstance => {
            const childrenActionCollection = this.checkActions(
                childInstance,
                actionCollection
            );
            actionCollection = {
                ...actionCollection,
                ...childrenActionCollection
            };
        });

        return actionCollection;
    };

    /**
     * 校验所有 reducer 确认每个 reducerName 保持全局唯一
     * 并返回 所有 reducer 的集合
     *
     * @param {*} instance
     * @param {*} collection
     * @returns
     */
    checkReducers = (instance, collection = {}) => {
        let reducerCollection = { ...collection };
        const nextInstance = instance || this;
        const { reducers, name, children } = nextInstance;

        Object.keys(reducers).forEach(reducerName => {
            if (reducerCollection[reducerName]) {
                throw new Error(
                    `ReactX Error: No duplicate reducer name allowed! You can try using spacenamed under your module or rename your reducer. (${name}.${reducerName})`
                );
            } else {
                reducerCollection[reducerName] = true;
            }
        });

        Object.values(children).forEach(childInstance => {
            const childrenReducerCollection = this.checkReducers(
                childInstance,
                reducerCollection
            );
            reducerCollection = {
                ...reducerCollection,
                ...childrenReducerCollection
            };
        });

        return reducerCollection;
    };

    /**
     * Check whether the state name conflicts with the module name
     *
     * 检查状态名称是否与模块名称冲突
     */
    checkStateNameAndModuleNameConflicts = () => {
        Object.keys(this.state).forEach(stateKey => {
            if (this.modules[stateKey]) {
                throw new Error(
                    `ReactX Error: The ${
                        this.name || 'root'
                    } module state name conflicts with the module name`
                );
            }
        });
    };

    /**
     * 根据 actionName 获取 ReactX 实例
     * 因为 actionName 一定是唯一的
     *
     * @param {*} actionName
     * @returns
     */
    getInstanceByActionName = actionName => {
        if (this.actions[actionName]) {
            return this;
        }
        let result;
        Object.values(this.children).find(childInstance => {
            const actionFn = childInstance.getInstanceByActionName(actionName);
            if (actionFn) {
                result = actionFn;
                return true;
            }
            return false;
        });
        return result;
    };

    /**
     * 根据 reducerName 获取 ReactX 实例
     * 因为 reducerName 一定是唯一的
     *
     * @param {*} reducerName
     * @returns
     */
    getInstanceByReducerName = reducerName => {
        if (this.reducers[reducerName]) {
            return this;
        }
        let result;
        Object.values(this.children).find(childInstance => {
            const reducerFn = childInstance.getInstanceByReducerName(
                reducerName
            );
            if (reducerFn) {
                result = reducerFn;
                return true;
            }
            return false;
        });

        return result;
    };

    getState = () => {
        const { children, state } = this;
        return Object.entries(children).reduce(
            (accumulator, [moduleName, moduleInstance]) => ({
                ...accumulator,
                [moduleName]: moduleInstance.getState()
            }),
            state
        );
    };

    getInitState = () => {
        const { children, initState } = this;
        return Object.entries(children).reduce(
            (accumulator, [moduleName, moduleInstance]) => ({
                ...accumulator,
                [moduleName]: moduleInstance.getInitState()
            }),
            initState
        );
    };

    setState = state => {
        this.state = state;
    };
}

export default ReactX;
