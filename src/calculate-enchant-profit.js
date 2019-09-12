'use strict';

const fs = require('fs');
const lodash = require('lodash');

const OUTPUT_FILE = './item-data-with-profit.json';

const ENCHANT_SEPARATOR = '@';
const UNABLE_TO_ENCHANT = 'Unable to enchant';
const PRICES_NOT_AVAILABLE = 'Prices not available';
const ITEM_DOES_NOT_SELL = 'Item does not sell';
const BUY_ORDER_SETUP_FEE = 0.01;
const SELL_ORDER_SETUP_FEE = 0.03;

function getEnchantMaterial(itemDataWithPrices, item) {
    let enchantItemId;
    switch (item.enchant) {
        case 0:
            enchantItemId = 'RUNE';
            break;
        case 1:
            enchantItemId = 'SOUL';
            break;
        case 2:
            enchantItemId = 'RELIC';
            break;
    }
    enchantItemId = `T${item.tier}_${enchantItemId}-0`;
    return itemDataWithPrices[enchantItemId];
}

function getEnchantMaterialQuantity(item) {
    const category = lodash.toLower(item.category);
    switch (category) {
        case 'main':
            // 1 handed weapon
            return 72;
        case '2h':
            // 2 handed weapon
            return 96;
        case 'bag':
        case 'armor':
            // Armors and bags
            return 48;
        default:
            // Shoes, heads, offhand and capes
            return 24;
    }
}

function calculateEnchantProfit() {
    const itemDataWithPrices = require('../item-data-with-prices');

    const itemDataWithProfit = {};
    lodash.forEach(itemDataWithPrices, (item, id) => {
        const quality = item.quality;
        const [itemName] = item.id.split(ENCHANT_SEPARATOR);
        const enchant = item.enchant;

        if (itemName.includes('GATHERER_')) {
            item.profit = ITEM_DOES_NOT_SELL;
            item.margin = ITEM_DOES_NOT_SELL;
            item.cost = ITEM_DOES_NOT_SELL;
            item.materialCost = ITEM_DOES_NOT_SELL;
            item.totalCost = ITEM_DOES_NOT_SELL;
            item.revenue = ITEM_DOES_NOT_SELL;

        } else {
            const nextLevelItemId = `${itemName}${ENCHANT_SEPARATOR}${enchant + 1}-${quality}`;
            const nextLevelItem = itemDataWithPrices[nextLevelItemId];
            if (!nextLevelItem || item.category === 'MEAL') {
                item.profit = UNABLE_TO_ENCHANT;
                item.margin = UNABLE_TO_ENCHANT;
                item.cost = UNABLE_TO_ENCHANT;
                item.materialCost = UNABLE_TO_ENCHANT;
                item.totalCost = UNABLE_TO_ENCHANT;
                item.revenue = UNABLE_TO_ENCHANT;

            } else {
                const enchantMaterial = getEnchantMaterial(itemDataWithPrices, item);
                const enchantMaterialQuantity = getEnchantMaterialQuantity(item);

                if (!enchantMaterial) {
                    item.profit = UNABLE_TO_ENCHANT;
                    item.margin = UNABLE_TO_ENCHANT;
                    item.cost = UNABLE_TO_ENCHANT;
                    item.materialCost = UNABLE_TO_ENCHANT;
                    item.totalCost = UNABLE_TO_ENCHANT;
                    item.revenue = UNABLE_TO_ENCHANT;

                } else {
                    let itemCost = item.buyPriceMin;
                    if (itemCost < 10) {
                        itemCost = item.sellPriceMin;
                    }
                    let enchantMaterialCost = enchantMaterial.buyPriceMax;
                    if (enchantMaterialCost < 10) {
                        enchantMaterialCost = enchantMaterial.sellPriceMin;
                    }
                    const materialCost = enchantMaterialQuantity * enchantMaterialCost;
                    const cost = itemCost + materialCost;
                    const revenue = nextLevelItem.sellPriceMin;
                    item.cost = itemCost;
                    item.materialCost = materialCost;
                    item.totalCost = cost;
                    item.revenue = revenue;

                    if (!itemCost || !materialCost || !revenue) {
                        item.profit = PRICES_NOT_AVAILABLE;
                        item.margin = PRICES_NOT_AVAILABLE;

                    } else {
                        const profit = revenue * (1 - SELL_ORDER_SETUP_FEE) - cost * (1 + BUY_ORDER_SETUP_FEE);
                        const margin = profit / cost;

                        item.profit = profit;
                        item.margin = margin;
                    }
                }
            }
        }

        itemDataWithProfit[id] = item;
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(itemDataWithProfit));
}

module.exports = {
    calculateEnchantProfit,
};
