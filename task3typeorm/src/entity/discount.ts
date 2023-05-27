import { Entity, Column, PrimaryColumn, ManyToMany } from "typeorm"
import { Item } from "./Item";
import { MONTH } from '../constants'

@Entity()
export class Discount {

    @PrimaryColumn()
    discountId: number;

    @ManyToMany(() => Item)
    items: Item[]

    @Column({ nullable: true})
    discountName: string

    @Column( { nullable: true} )
    percentage: number

    @Column( { nullable: true} )
    minPrice: number

	@Column( { type: 'date', nullable: true} )
    start: Date

	@Column( { type: 'date', nullable: true} )
    exp: Date

    @Column( {default: false} )
    isActive: boolean

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
		return (new Date(start) < now && now < new Date(exp)); // видимо не разобралась с типами, везде проставила Date, а после сохранения падает строка. пока костыль.
	}

	applyDiscount(price: number): number {
		this.isActive = (this.start && this.exp) ? Discount.isExp(this.start, this.exp) : true;
		if (!this.isActive) {
			return price;
		} else if (this.percentage !== undefined) {
			const discountAmount = (this.percentage / 100) * price;
			price = Math.max(price - discountAmount, 0);
		}
		return price;
	}

    static create(discountOptions) {

		const newDiscount = new Discount();
		newDiscount.discountId = (discountOptions.discountId)? discountOptions.discountId : undefined ;
		newDiscount.discountName = (discountOptions.discountName)? discountOptions.discountName : undefined ;
		newDiscount.percentage = (discountOptions.discount?.includes('%')) ? parseInt(discountOptions.discount) : undefined;
		newDiscount.minPrice = (discountOptions.minPrice) ? discountOptions.minPrice : undefined;
		if (discountOptions.start && discountOptions.exp) {
			const {firstDay, lastDay} = Discount.stringToDate(discountOptions.start, discountOptions.exp);
			newDiscount.start = firstDay;
			newDiscount.exp = lastDay;
		}
		return newDiscount;
    }
}