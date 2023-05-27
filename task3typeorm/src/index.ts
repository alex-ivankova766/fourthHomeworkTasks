
import { DB } from "./data-source"
import { Item } from "./entity/Item"
import { Discount } from "./entity/discount"
import { Items_Discounts } from "./entity/items_discounts"
import { testCase } from './testCase'
import { Purchase } from "./entity/purchase"

function formatPrice(price: number) {
    let rubles; let cents;
    let formattedPrice = '';
    if (!Number.isInteger(price)) {
        [rubles, cents] = String(price).split('.');
        formattedPrice = `${rubles}`.split('').reverse().map((el, index) => index % 3 !== 2 ? el : ` ${el}`).reverse().join('') + `р. ${cents} коп.`;
    } else {
        formattedPrice = `${price}`.split('').reverse().map((el, index) => index % 3 !== 2 ? el : ` ${el}`).reverse().join('') + 'р.';
    }

    return formattedPrice;
}

console.log(JSON.stringify(['a', 'b', 'c']))

DB.initialize().then(async () => {

    const data = JSON.parse(testCase);
    let fullCost = 0;
    let beforeTotalDiscount = 0;
    let totalCost = 0;
    let resultString = '';
    
    const ItemsRepository = DB.getRepository(Item);
    const DiscountsRepository = DB.getRepository(Discount);
    const PurchasesRepository = DB.getRepository(Purchase);
    const Items_DiscountsRepository = DB.getRepository(Items_Discounts);
    try {
        await Items_DiscountsRepository.clear();
        await PurchasesRepository.clear();
        await DiscountsRepository.clear();
        await ItemsRepository.clear();
    } catch(e) {
        console.log(e)
    }

    for (const item of data.items) {
        const newItem = Item.create(item);
        await DB.manager.save(newItem)
    }

    for (const discount of data.discounts) {
        const newDiscount = Discount.create(discount);
        await DB.manager.save(newDiscount);
    }

    for (const items_discounts of data.itemsDiscounts) {
        const item = await ItemsRepository.manager.findOne(Item, {where: {itemId: items_discounts.itemId}});
        const discount = await DiscountsRepository.manager.findOne(Discount, {where: {discountId: items_discounts.discountId}});

        if (item && discount) {
            const newItems_discounts = new Items_Discounts();
            newItems_discounts.item = item;
            newItems_discounts.discount = discount;
            newItems_discounts.applyDiscount();
            await DB.manager.save([item, newItems_discounts]);
        }
    }

    for (let purchase of data.purchases) {
        const newPurchase = Purchase.create(purchase);
        const item = await ItemsRepository.manager.findOne(Item, {where: {itemId: purchase.itemId}});
        newPurchase.item = item;
        newPurchase.beforeDiscounts = newPurchase.item.price * newPurchase.amount;
        newPurchase.afterDiscounts = newPurchase.item.reducedPrice * newPurchase.amount;
        await DB.manager.save(newPurchase)

        fullCost += newPurchase.beforeDiscounts;
        beforeTotalDiscount += newPurchase.afterDiscounts;

        const itemName = newPurchase.item.itemName;
        const itemAmount = newPurchase.amount;
        const itemCost = formatPrice(newPurchase.beforeDiscounts);
        const reducedCost = formatPrice(newPurchase.afterDiscounts);

        resultString += `${itemName} - ${itemAmount}штук, ${reducedCost} (${itemCost} без скидок);\n`;
} 

    for (const totalDiscount of data.totalDiscounts) {
        if (totalDiscount.minPrice <= beforeTotalDiscount) {
            const newTotalDiscount = Discount.create(totalDiscount);
            await DB.manager.save(newTotalDiscount);
        }
    }

    const relevantTotalDiscount =   await DiscountsRepository
    .createQueryBuilder('discount')
    .where('discount.minPrice < :beforeTotalDiscount', {beforeTotalDiscount: beforeTotalDiscount})
    .orderBy('discount.minPrice', 'DESC')
    .getOne();

    totalCost = relevantTotalDiscount.applyDiscount(beforeTotalDiscount);
    const formattedReducedCost = formatPrice(Math.min(beforeTotalDiscount, fullCost));
    const formattedFullCost = formatPrice(fullCost);
    const formattedTotalCost = formatPrice(Math.min(totalCost, fullCost, beforeTotalDiscount));
    resultString += `Итого: ${formattedReducedCost} (${formattedFullCost} без скидок)\nИтого со скидкой: ${formattedTotalCost}`;
    console.log(resultString);
}).catch(error => console.log(error));