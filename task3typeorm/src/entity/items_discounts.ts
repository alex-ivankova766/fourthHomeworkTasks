import { Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm"
import { Discount } from "./discount";
import { Item } from "./Item";

@Entity()
export class Items_Discounts {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne( () => Item)
    @JoinColumn()
    item: Item;

    @ManyToOne( () => Discount)
    discount: Discount;

    applyDiscount() {
        this.item.reducedPrice = this.discount.applyDiscount(this.item.reducedPrice);
    }
    
}
