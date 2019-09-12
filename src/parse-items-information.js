'use strict';

const fs = require('fs');
const lodash = require('lodash');

// Items: https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/formatted/items.json
const itemsJson = require('../items');

const OUTPUT_FILE = './item-data.json';

function parseItemsInformation() {
    const parsedItems = {};

    lodash.forEach(itemsJson, itemData => {
        const item = {
            index: itemData.Index,
            id: itemData.UniqueName,
        };

        const [itemName, enchant] = item.id.split('@');
        item.enchant = parseInt(enchant) || 0;

        if (itemName.startsWith('T') && itemName[2] === '_') {
            const splitId = itemName.split('_');

            item.tier = parseInt(splitId.shift().replace('T', ''));

            let category = splitId.shift();
            if (lodash.toLower(category) === 'artefact' || lodash.toLower(category) === 'artifact') {
                item.artifact = true;
                category = splitId.shift();
            } else {
                item.artifact = false;
            }

            item.category = category;
            item.name = splitId.join('_');
            if (!item.name) {
                item.name = item.category;
            }

            if (itemData.LocalizedNames) {
                item.usName = itemData.LocalizedNames['EN-US'];
            }

            parsedItems[item.id] = item;
        }
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(parsedItems));
}

module.exports = {
    parseItemsInformation,
};
