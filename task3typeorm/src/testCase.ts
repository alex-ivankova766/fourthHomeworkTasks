export const testCase = `{"items":[{"itemId":1,"itemName":"мяч","price":1000,"discount":"7%"},
{"itemId":2,"itemName":"футболка","price":2000,"discount":"9%"}],

"discounts":[{"discountId":1,"discountName":"весенняя распродажа","discount":"30%", "start": "1 март", "exp": "31 май"},
{"discountId":2,"discountName":"новогодние скидки","discount":"20%","start": "25 декабрь", "exp": "10 январь"}],

"totalDiscounts":[{"discountId":3,"minPrice":1000,"discount":"5%"},{"discountId":4,"minPrice":10000,"discount":"3%"}, {"discountId":5,"minPrice":8000,"discount":"7%"}],

"purchases":[{"itemId":1,"amount":10},{"itemId":2,"amount":5}],

"itemsDiscounts":[{"itemId":1,"discountId":1},{"itemId":2,"discountId":1},{"itemId":2,"discountId":2}]}`