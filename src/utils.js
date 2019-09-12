'use strict';

const lodash = require('lodash');

/**
 * Creates a new object by recursively converting the case of all keys in a given object
 *
 * @param {Object}   object             Object to convert the keys of. Objects that are not plain should have a
 *                                      toJSON method that will be used to serialize them
 * @param {Function} conversionFunction Function to be used when converting the case of the object's keys
 *                                      Usually one of lodash's functions, like camelCase or snakeCase
 * @return {Object} Object with its keys converted
 */
function convertCase(object, conversionFunction) {
    if (!lodash.isObject(object)) {
        return object;

    } else if (lodash.isPlainObject(object)) {
        const accumulator = {};

        lodash.forEach(object, (value, key) => {
            accumulator[conversionFunction(key)] = convertCase(value, conversionFunction);
        });

        return accumulator;

    } else if (lodash.isArray(object)) {
        return object.map(value => convertCase(value, conversionFunction));

    } else if (object.toJSON) {
        return convertCase(object.toJSON(), conversionFunction);

    } else {
        // Other javascript objects, like Symbol or Function.
        const obj = object.toString();
        throw new Error(
            `'convertCase' was called on an object that doesn't contain a toJSON function: ${obj}`
        );
    }
}

module.exports = {
    convertCase,
};
