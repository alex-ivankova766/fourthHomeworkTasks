import "reflect-metadata"
import { DataSource } from "typeorm"
import { Item } from "./entity/Item"
import { Purchase } from "./entity/purchase"
import { Discount } from "./entity/discount"
import { Items_Discounts } from "./entity/items_discounts"

export const DB = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "qwerty",
    database: "dev",
    synchronize: true,
    logging: true,
    entities: [Item, Purchase, Discount, Items_Discounts],
    migrations: [],
    subscribers: [],
})
