var testCase = "{\"items\":[{\"id\":1,\"name\":\"\u043C\u044F\u0447\",\"price\":1000,\"discount\":\"9%\"},\n{\"id\":2,\"name\":\"\u0444\u0443\u0442\u0431\u043E\u043B\u043A\u0430\",\"price\":2000},{\"id\":3,\"name\":\"\u0434\u043E\u0436\u0434\u0435\u0432\u0438\u043A\",\"price\":5000}],\n\n\"discounts\":[{\"id\":1,\"name\":\"\u0432\u0435\u0441\u0435\u043D\u043D\u044F\u044F \u0440\u0430\u0441\u043F\u0440\u043E\u0434\u0430\u0436\u0430\",\"discount\":\"30%\", \"start\": \"1 \u043C\u0430\u0440\u0442\", \"exp\": \"31 \u043C\u0430\u0439\"},\n{\"id\":2,\"name\":\"\u043D\u043E\u0432\u043E\u0433\u043E\u0434\u043D\u0438\u0435 \u0441\u043A\u0438\u0434\u043A\u0438\",\"discount\":\"20%\",\"start\": \"25 \u0434\u0435\u043A\u0430\u0431\u0440\u044C\", \"exp\": \"10 \u044F\u043D\u0432\u0430\u0440\u044C\"}],\n\n\"totalDiscounts\":[{\"id\":1,\"minPrice\":1000,\"discount\":\"5%\"},{\"id\":1,\"minPrice\":5000,\"discount\":\"7%\"}, {\"id\":1,\"minPrice\":4000,\"discount\":\"10%\"}],\n\n\"purchases\":[{\"item\":1,\"amount\":10},{\"item\":2,\"amount\":5},{\"item\":3,\"amount\":10}],\n\n\"itemsDiscounts\":[{\"itemId\":1,\"discountId\":1},{\"itemId\":1,\"discountId\":2},{\"itemId\":3,\"discountId\":1}]}";
var MONTH = {
    январь: 0,
    февраль: 1,
    март: 2,
    апрель: 3,
    май: 4,
    июнь: 5,
    июль: 6,
    август: 7,
    сентябрь: 8,
    октябрь: 9,
    ноябрь: 10,
    декабрь: 11,
};
var Item = /** @class */ (function () {
    function Item(options) {
        this.itemId = options.id;
        this.name = options.name;
        this.price = options.price;
        this.discounts = [new Discount({ discount: options.discount })];
        this.reducedPrice = this.price;
    }
    Item.prototype.pushDiscount = function (discount) {
        this.discounts.push(discount);
    };
    Item.prototype.applyDiscounts = function () {
        this.reducedPrice = this.price;
        for (var _i = 0, _a = this.discounts; _i < _a.length; _i++) {
            var discount = _a[_i];
            this.reducedPrice = discount.applyDiscounts(this.reducedPrice);
        }
    };
    return Item;
}());
var Discount = /** @class */ (function () {
    function Discount(options) {
        var _a;
        this.discountId = options.id;
        this.percentage = ((_a = options.discount) === null || _a === void 0 ? void 0 : _a.includes('%')) ? parseInt(options.discount) : undefined;
        this.minPrice = (options.minPrice) ? options.minPrice : undefined;
        if (options.start && options.exp) {
            var _b = Discount.stringToDate(options.start, options.exp), firstDay = _b.firstDay, lastDay = _b.lastDay;
            this.start = firstDay;
            this.exp = lastDay;
        }
    }
    Discount.stringToDate = function (start, exp) {
        var _a = start.split(' '), startDay = _a[0], startMonth = _a[1];
        var _b = exp.split(' '), expDay = _b[0], expMonth = _b[1];
        var now = new Date();
        var startYear = now.getFullYear();
        var expYear = (MONTH[startMonth] > MONTH[expMonth]) ? (now.getFullYear() + 1) : startYear;
        var firstDay = new Date(startYear, MONTH[startMonth], +startDay);
        var lastDay = new Date(expYear, MONTH[expMonth], +expDay);
        return { firstDay: firstDay, lastDay: lastDay };
    };
    Discount.isExp = function (start, exp) {
        var now = new Date();
        console.log(start, exp);
        return (start < now && now < exp); // видимо не разобралась с типами, везде проставила Date, а после сохранения падает строка. пока костыль.
    };
    Discount.prototype.applyDiscounts = function (price) {
        this.isActive = (this.start && this.exp) ? Discount.isExp(this.start, this.exp) : true;
        if (!this.isActive) {
            return price;
        }
        else if (this.percentage !== undefined) {
            var discountAmount = (this.percentage / 100) * price;
            price = Math.max(price - discountAmount, 0);
        }
        return price;
    };
    return Discount;
}());
var Purchase = /** @class */ (function () {
    function Purchase(purchase) {
        this.itemId = purchase.item;
        this.amount = purchase.amount;
    }
    return Purchase;
}());
var Cart = /** @class */ (function () {
    function Cart(cartCase) {
        this.fullCost = 0;
        this.reducedCost = 0;
        this.totalCost = 0;
        this.resultString = '';
        var cartData = JSON.parse(cartCase);
        this.items = [];
        for (var _i = 0, _a = cartData.items; _i < _a.length; _i++) {
            var item = _a[_i];
            this.items[item.id] = new Item(item);
        }
        this.discounts = [];
        for (var _b = 0, _c = cartData.discounts; _b < _c.length; _b++) {
            var discount = _c[_b];
            this.discounts[discount.id] = new Discount(discount);
        }
        for (var _d = 0, _e = cartData.itemsDiscounts; _d < _e.length; _d++) {
            var items_discounts = _e[_d];
            this.items[items_discounts.itemId].pushDiscount(this.discounts[items_discounts.discountId]);
        }
        for (var _f = 0, _g = this.items; _f < _g.length; _f++) {
            var item = _g[_f];
            if (item) {
                item.applyDiscounts();
            }
        }
        this.purchases = [];
        for (var _h = 0, _j = cartData.purchases; _h < _j.length; _h++) {
            var purchase = _j[_h];
            this.purchases[purchase.item] = new Purchase(purchase);
            this.purchases[purchase.item].beforeDiscounts = this.items[purchase.item].price * purchase.amount;
            this.purchases[purchase.item].afterDiscounts = this.items[purchase.item].reducedPrice * purchase.amount;
            this.fullCost += this.purchases[purchase.item].beforeDiscounts;
            this.reducedCost += this.purchases[purchase.item].afterDiscounts;
            var itemName = this.items[purchase.item].name;
            var itemAmount = purchase.amount;
            var itemCost = this.formatPrice(this.purchases[purchase.item].beforeDiscounts);
            var reducedCost = this.formatPrice(this.purchases[purchase.item].afterDiscounts);
            this.resultString += "".concat(itemName, " - ").concat(itemAmount, "\u0448\u0442\u0443\u043A, ").concat(reducedCost, " (").concat(itemCost, " \u0431\u0435\u0437 \u0441\u043A\u0438\u0434\u043E\u043A);\n");
        }
        this.totalDiscounts = [];
        for (var m = 0; m < cartData.totalDiscounts.length; m++) {
            this.totalDiscounts[m] = new Discount(cartData.totalDiscounts[m]);
        }
        this.totalDiscounts = this.totalDiscounts.sort(function (a, b) { return a.minPrice < b.minPrice ? 1 : -1; });
        for (var _k = 0, _l = this.totalDiscounts; _k < _l.length; _k++) {
            var totalDiscount = _l[_k];
            if (totalDiscount.minPrice <= this.reducedCost) {
                this.totalCost = totalDiscount.applyDiscounts(this.reducedCost);
                var reducedCost = this.formatPrice(Math.min(this.reducedCost, this.fullCost));
                var fullCost = this.formatPrice(this.fullCost);
                var totalCost = this.formatPrice(Math.min(this.totalCost, this.fullCost, this.reducedCost));
                this.resultString += "\u0418\u0442\u043E\u0433\u043E: ".concat(reducedCost, " (").concat(fullCost, " \u0431\u0435\u0437 \u0441\u043A\u0438\u0434\u043E\u043A)\n\u0418\u0442\u043E\u0433\u043E \u0441\u043E \u0441\u043A\u0438\u0434\u043A\u043E\u0439: ").concat(totalCost);
                break;
            }
        }
    }
    Cart.prototype.formatPrice = function (price) {
        var _a;
        var rubles;
        var cents;
        var formattedPrice = '';
        if (!Number.isInteger(price)) {
            _a = String(price).split('.'), rubles = _a[0], cents = _a[1];
            formattedPrice = "".concat(rubles).split('').reverse().map(function (el, index) { return index % 3 !== 2 ? el : " ".concat(el); }).reverse().join('') + "\u0440. ".concat(cents, " \u043A\u043E\u043F.");
        }
        else {
            formattedPrice = "".concat(price).split('').reverse().map(function (el, index) { return index % 3 !== 2 ? el : " ".concat(el); }).reverse().join('') + 'р.';
        }
        return formattedPrice;
    };
    Cart.prototype.count = function () {
        console.log(this.resultString);
    };
    return Cart;
}());
var cart = new Cart(testCase);
cart.count();
