import {
    createStore as reduxCreateStore,
    applyMiddleware,
    compose
} from 'redux';
import { merge } from 'lodash-es';
import ReactX from './reactx';
import { isObject, isFunction, isUndefined } from './utils';
import { createActionMiddleware } from './create-action-middleware';
import { createRootReducer } from './create-root-reducer';

const baseConfig = {};

export const createStore = (config = {}, ...args) => {
    const [preloadedState, enhancer] = args;

    let nextEnhancer;
    let nextPreloadedState = preloadedState;

    if (isFunction(preloadedState) && isUndefined(enhancer)) {
        nextEnhancer = preloadedState;
        nextPreloadedState = undefined;
    }
    // 判断 module 是否为 Object
    if (!isObject(config)) {
        throw new Error('ReactX Error: Expected the module to be a Object.');
    }

    // 合并默认 baseConfig
    const nextConfig = merge(baseConfig, config);

    // 实例化 reactx
    const rootInstance = new ReactX({
        config: nextConfig,
        preloadedState: nextPreloadedState
    });

    // 验证 actions & reducers 的名称唯一性
    // 如果不唯一则抛错
    rootInstance.checkActions();
    rootInstance.checkReducers();

    // 集成 actionMiddleware
    const actionMiddleware = createActionMiddleware(rootInstance);
    const reactXEnhancer = applyMiddleware(actionMiddleware);
    if (nextEnhancer !== undefined) {
        // compose 原有的 applyMiddleware 或者 enhancer
        // 并保证 actionMiddleware 在第一位
        nextEnhancer = compose(reactXEnhancer, nextEnhancer);
    } else {
        nextEnhancer = reactXEnhancer;
    }

    // 创建核心 reducer
    const rootReducer = createRootReducer(rootInstance);

    // 创建原生 redux store
    // createStore(reducer, [preloadedState], enhancer)
    const store = reduxCreateStore(
        rootReducer,
        nextPreloadedState,
        nextEnhancer
    );

    // [todo]
    // 自定义 store 的方法
    // 动态注册新的模块
    store.registerModule = () => {};

    return store;
};
