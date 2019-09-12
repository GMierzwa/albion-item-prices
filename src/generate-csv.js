'use strict';

const fs = require('fs');
const lodash = require('lodash');
const json2csv = require('json2csv');

const OUTPUT_FILE = './item-data-with-profit.csv';

function generateCsv() {
    const itemDataWithProfit = require('../item-data-with-profit');
    const itemDataArray = lodash.values(itemDataWithProfit);

    const csv = json2csv.parse(itemDataArray, {
        fields: lodash.keys(itemDataArray[0]),
    });

    fs.writeFileSync(OUTPUT_FILE, csv);
}

module.exports = {
    generateCsv,
};
