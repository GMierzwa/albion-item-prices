'use strict';

const { parseItemsInformation } = require('./parse-items-information');
const { getPriceInformation } = require('./get-price-information');
const { calculateEnchantProfit } = require('./calculate-enchant-profit');
const { generateCsv } = require('./generate-csv');

parseItemsInformation();
getPriceInformation().then(() => {
    calculateEnchantProfit();
    generateCsv();
}).catch(console.error);
