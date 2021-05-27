// import { merge } from 'lodash-es';
import { isFunction } from './utils';
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
export const createRootReducer = rootInstance => (_, action) => {
    const { getInstanceByReducerName, getState } = rootInstance;
    const { type, payload } = action;
    const reducerName = type;

    const isReduxAction = reducerName.indexOf('@@redux') !== -1;

    if (!isReduxAction) {
        const itemInstance = getInstanceByReducerName(reducerName);
        const { state: moduleState, reducers = {} } = itemInstance || {};
        const reducerFn = reducers[reducerName];
        if (reducerFn && isFunction(reducerFn)) {
            const nextModuleState = reducerFn(moduleState, payload);
            itemInstance.setState(nextModuleState);
        } else {
            throw new Error(
                `[ReactX Error:] The Reducer function '${reducerName}' is not registered!`
            );
        }
    }

    return getState();
};
