import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn, PrimaryGeneratedColumn } from "typeorm"
import { Item } from "./Item"

@Entity()
export class Purchase {

    @PrimaryGeneratedColumn()
    id: number

    @OneToOne(() => Item, (item) => item.itemId)
    @JoinColumn({ name: 'itemId' })    
    item: Item

    @Column()
    amount: number

    @Column( { nullable: true} )
    beforeDiscounts: number;

    @Column( { nullable: true} )
	afterDiscounts: number;

    static create(purchase) {
        const newPurchase = new Purchase();
        newPurchase.amount = purchase.amount;
        return newPurchase;
    }
}
