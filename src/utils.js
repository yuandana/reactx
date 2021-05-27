/**
 * 判断数据是否为对象类型
 *
 * @param  {[type]} _data [description]
 * @return {[type]}       [description]
 */
export const isObject = data =>
    Object.prototype.toString.call(data) === '[object Object]';

/**
 * 判断数据是否为字符串类型
 *
 * @param  {[type]} _data [description]
 * @return {[type]}       [description]
 */
export const isString = data =>
    Object.prototype.toString.call(data) === '[object String]';

/**
 * 判断数据是否为function
 *
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export const isFunction = data =>
    Object.prototype.toString.call(data) === '[object Function]';

/**
 * 判断数据是否为 undefined
 *
 * @param {*} data
 * @returns
 */
export const isUndefined = data => data === undefined;

/**
 * 创建命名空间名字
 */
export const getNamespacedName = (name, parentName) =>
    `${parentName}.${name}`.toUpperCase();
