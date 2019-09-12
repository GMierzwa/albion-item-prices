'use strict';

const axios = require('axios');
const fs = require('fs');
const lodash = require('lodash');

const utils = require('./utils');
const OUTPUT_FILE = './item-data-with-prices.json';

const LOCATION = 'Carleon';
const CHUNK_SIZE = 30;
const REQUEST_INTERVAL = 500;

// Website: https://www.albion-online-data.com/
// Swagger: https://www.albion-online-data.com/api/swagger/index.html

/**
 * Retrieve historical data about an item's sales (Sell orders only).
 * @param itemId
 * @param [date]
 * @return {Promise<Object>}
 */
async function getCharts(itemId, date) {
    const response = await axios({
        method: 'get',
        url: `https://www.albion-online-data.com/api/v1/stats/charts/${itemId}`,
        params: {
            date,
            locations: LOCATION,
        },
    });

    return response.data[0].data;
}

/**
 * Retrieve the current prices of the given items.
 * @param itemList
 * @param [qualities]
 * @return {Promise<Object[]>}
 */
async function getPrices(itemList, qualities) {
    const response = await axios({
        method: 'get',
        url: `https://www.albion-online-data.com/api/v1/stats/prices/${itemList}`,
        params: {
            qualities,
            locations: LOCATION,
        },
    });

    return response.data;
}

function setTimeoutPromise(time) {
    return new Promise(resolve => {
        setTimeout(() => resolve(), time);
    });
}

async function getChunkedPriceInformation(itemData, chunks, itemDataWithPrices) {
    const chunk = chunks.pop();
    console.log(`Chunks left: ${chunks.length}`);

    const pricesResponse = await getPrices(chunk);

    lodash.forEach(pricesResponse, priceInformation => {
        priceInformation = utils.convertCase(priceInformation, lodash.camelCase);
        const itemId = priceInformation.itemId;
        const quality = priceInformation.quality;
        delete priceInformation.city;

        const id = `${itemId}-${quality}`;
        itemDataWithPrices[id] = lodash.assign({}, priceInformation, itemData[itemId]);
    });

    if (chunks.length > 0) {
        await setTimeoutPromise(REQUEST_INTERVAL);
        return getChunkedPriceInformation(itemData, chunks, itemDataWithPrices);

    } else {
        return itemDataWithPrices;
    }
}

/**
 * @return {Promise<void>}
 */
async function getPriceInformation() {
    const itemData = require('../item-data');
    const itemList = lodash.keys(itemData);
    const chunks = lodash.chunk(itemList, CHUNK_SIZE);

    const itemDataWithPrices = await getChunkedPriceInformation(itemData, chunks, {});

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(itemDataWithPrices));
}

module.exports = {
    getPriceInformation,
};
