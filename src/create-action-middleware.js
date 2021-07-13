import { isObject, isString, getNamespacedName } from './utils';

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
export const createActionMiddleware = rootInstance => {
    const { getInstanceByActionName } = rootInstance;
    /**
     * 实现 commit 的函数
     *
     * @param {*} store
     * @param {*} actionName
     * @returns
     */
    const commitHandler = (store, instance) => (reducerName, payload) => {
        const { dispatch } = store;
        const { namespaced, parentName, path } = instance;
        let nextReducerName = reducerName;

        if (namespaced === true) {
            if (
                reducerName.indexOf(parentName?.toString().toUpperCase()) === -1
            ) {
                nextReducerName = getNamespacedName(reducerName, parentName);
            }
        }

        dispatch({
            type: nextReducerName,
            payload,
            // ReactX 的设计原则，reducer 只能在 action 中调用
            // 在 commit 触发 redux 的 reducer 时候，加入isReactX的标识
            // 用于判断 reducer 一定是由 action => commit 的路径触发的
            // 而不是使用 redux 的 dispatch action.type 的方式绕过 action 直接触发 reducer
            isReactX: true,
            path
        });
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
    const actionHandler = ({ actionName, actionFn, store, payload }) => {
        const instance = getInstanceByActionName(actionName);
        const { state } = instance || {};
        const rootState = store.getState();
        const commit = commitHandler(store, instance);
        const { dispatch } = store;

        return actionFn(
            {
                state,
                rootState,
                commit,
                dispatch
            },
            ...payload
        );
    };

    /**
     * 根据 actionName 获取 actionFn
     *
     * @param {*} actionName
     * @returns
     */
    const getActionFnByActionName = actionName => {
        const instance = getInstanceByActionName(actionName);
        const { actions = {} } = instance || {};
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
    return store => next => (action, ...payload) => {
        if (isObject(action) && action.type) {
            // 原生 redux reducer
            const reducerName = action.type;
            const { isReactX, type, payload: reducerPayload } = action;
            if (isReactX) {
                // 过滤掉 isReactX 标识
                // const nextPlainObject = {
                //     ...action
                // };
                // if (reducerPayload) {
                //     nextPlainObject.payload = reducerPayload;
                // }
                next({...action});
            } else {
                throw new Error(
                    `ReactX Error: You Must call the reducer '${reducerName}' in a Action!`
                );
            }
        } else if (isString(action)) {
            // reactx
            const actionName = action;
            const actionFn = getActionFnByActionName(actionName);

            if (actionFn) {
                return actionHandler({
                    actionName,
                    actionFn,
                    store,
                    payload
                });
            }

            throw new Error(
                `ReactX Error: The Action function '${actionName}' is not registered!`
            );
        }

        return null;
    };
};
