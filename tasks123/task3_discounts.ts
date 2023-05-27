const testCase = `{"items":[{"id":1,"name":"мяч","price":1000,"discount":"9%"},
{"id":2,"name":"футболка","price":2000},{"id":3,"name":"дождевик","price":5000}],

"discounts":[{"id":1,"name":"весенняя распродажа","discount":"30%", "start": "1 март", "exp": "31 май"},
{"id":2,"name":"новогодние скидки","discount":"20%","start": "25 декабрь", "exp": "10 январь"}],

"totalDiscounts":[{"id":1,"minPrice":1000,"discount":"5%"},{"id":1,"minPrice":5000,"discount":"7%"}, {"id":1,"minPrice":4000,"discount":"10%"}],

"purchases":[{"item":1,"amount":10},{"item":2,"amount":5},{"item":3,"amount":10}],

"itemsDiscounts":[{"itemId":1,"discountId":1},{"itemId":1,"discountId":2},{"itemId":3,"discountId":1}]}`;

const MONTH = {
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

type ItemOptions = {
	id: number;
	name: string;
	price: number;
	discount: string;
};

class Item {
	itemId: number;
	name: string;
	price: number;
	discounts;
	reducedPrice: number;

	constructor(options: ItemOptions) {
		this.itemId = options.id;
		this.name = options.name;
		this.price = options.price;
		this.discounts = [new Discount({discount: options.discount})];
		this.reducedPrice = this.price;
	}

	pushDiscount(discount: Discount) {
		this.discounts.push(discount);
	}

	applyDiscounts() {
		this.reducedPrice = this.price;
		for (const discount of this.discounts) {
			this.reducedPrice = discount.applyDiscounts(this.reducedPrice);
		}
	}
}

type DiscountOptions = {
	id?: number;
	name?: string;
	discount: string;
	start?: string;
	exp?: string;
	minPrice?: number;
};

class Discount {
	discountId?: number;
	percentage?: number;
	isActive?: boolean;
	minPrice?: number;
	start?: Date;
	exp?: Date;

	constructor(options: DiscountOptions) {
		this.discountId = options.id;
		this.percentage = (options.discount?.includes('%')) ? parseInt(options.discount) : undefined;
		this.minPrice = (options.minPrice) ? options.minPrice : undefined;
		if (options.start && options.exp) {
			const {firstDay, lastDay} = Discount.stringToDate(options.start, options.exp);
			this.start = firstDay;
			this.exp = lastDay;
		}
	}

	static stringToDate(start: string, exp: string) {
		const [startDay, startMonth] = start.split(' ');
		const [expDay, expMonth] = exp.split(' ');
		const now = new Date();
		const startYear = now.getFullYear();
		const expYear = ( MONTH[startMonth] > MONTH[expMonth] ) ? (now.getFullYear() + 1) : startYear;
		const firstDay = new Date(startYear, MONTH[startMonth], +startDay);
		const lastDay = new Date(expYear, MONTH[expMonth], +expDay);
		return {firstDay, lastDay}
	}

	static isExp(start: Date, exp: Date): boolean {
		const now = new Date();
		return (start < now && now < exp);
	}

	applyDiscounts(price: number): number {
		this.isActive = (this.start && this.exp) ? Discount.isExp(this.start, this.exp) : true;
		if (!this.isActive) {
			return price;
		} else if (this.percentage !== undefined) {
			const discountAmount = (this.percentage / 100) * price;
			price = Math.max(price - discountAmount, 0);
		}

		return price;
	}
}

type PurchasesOptions = {
	item: number;
	amount: number;
};

class Purchase {
	itemId: number;
	amount: number;
	beforeDiscounts: number;
	afterDiscounts: number;

	constructor(purchase: PurchasesOptions) {
		this.itemId = purchase.item;
		this.amount = purchase.amount;
	}
}

class Cart {
	items;
	purchases;
	discounts;
	totalDiscounts;
	fullCost = 0;
	reducedCost = 0;
	totalCost = 0;
	resultString = '';

	constructor(cartCase: string) {
		const cartData = JSON.parse(cartCase);

		this.items = [];
		for (const item of cartData.items) {
			this.items[item.id] = new Item(item);
		}

		this.discounts = [];
		for (const discount of cartData.discounts) {
			this.discounts[discount.id] = new Discount(discount);
		}

		for (const items_discounts of cartData.itemsDiscounts) {
			this.items[items_discounts.itemId].pushDiscount(this.discounts[items_discounts.discountId]);
		}

		for (const item of this.items) {
			if (item) {
				item.applyDiscounts();
			}
		}

		this.purchases = [];
		for (const purchase of cartData.purchases) {
			this.purchases[purchase.item] = new Purchase(purchase);
			this.purchases[purchase.item].beforeDiscounts = this.items[purchase.item].price * purchase.amount;
			this.purchases[purchase.item].afterDiscounts = this.items[purchase.item].reducedPrice * purchase.amount;
			this.fullCost += this.purchases[purchase.item].beforeDiscounts;
			this.reducedCost += this.purchases[purchase.item].afterDiscounts;
			const itemName = this.items[purchase.item].name;
			const itemAmount = purchase.amount;
			const itemCost = this.formatPrice(this.purchases[purchase.item].beforeDiscounts);
			const reducedCost = this.formatPrice(this.purchases[purchase.item].afterDiscounts);

			this.resultString += `${itemName} - ${itemAmount}штук, ${reducedCost} (${itemCost} без скидок);\n`;
		}

		this.totalDiscounts = [];

		for (let m = 0; m < cartData.totalDiscounts.length; m++) {
			this.totalDiscounts[m] = new Discount(cartData.totalDiscounts[m]);
		}

		this.totalDiscounts = this.totalDiscounts.sort((a, b) => a.minPrice < b.minPrice ? 1 : -1);

		for (const totalDiscount of this.totalDiscounts) {
			if (totalDiscount.minPrice <= this.reducedCost) {
				this.totalCost = totalDiscount.applyDiscounts(this.reducedCost);
				const reducedCost = this.formatPrice(Math.min(this.reducedCost, this.fullCost));
				const fullCost = this.formatPrice(this.fullCost);
				const totalCost = this.formatPrice(Math.min(this.totalCost, this.fullCost, this.reducedCost));
				this.resultString += `Итого: ${reducedCost} (${fullCost} без скидок)\nИтого со скидкой: ${totalCost}`;
				break;
			}
		}
	}

	formatPrice(price: number) {
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

	count() {
		console.log(this.resultString);
	}
}

const cart = new Cart(testCase);
cart.count();