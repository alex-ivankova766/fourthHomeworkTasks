import { Entity, Column, PrimaryColumn, OneToOne, JoinTable, ManyToMany } from "typeorm"
import { Purchase } from "./purchase"
import { Discount } from "./discount";

@Entity()
export class Item {

    pushDiscount(discount: Discount) {
		this.discounts.push(discount);
	}

    @PrimaryColumn()
    @OneToOne(() => Purchase, (purchase) => purchase.item)
    itemId: number;

    @Column()
    itemName: string

    @Column()
    price: number

    @ManyToMany( () => Discount)
    @JoinTable()
    discounts: Discount[]

    @Column( { nullable: true})
    reducedPrice: number

    static create(item) {
        const newItem = new Item();
        newItem.itemId = item.itemId
        newItem.itemName = item.itemName
        newItem.price = item.price;
        const discount = (item.discount)? Discount.create({discount: item.discount}) : undefined;
        if (discount) {
            newItem.reducedPrice = discount.applyDiscount(newItem.price);
        }
        return newItem;
    }
}
