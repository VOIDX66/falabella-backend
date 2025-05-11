import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
  BaseEntity,
} from "typeorm";
import { User } from "./user";
import { OrderProduct } from "./orderproduct";

@Entity()
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.orders)
  @JoinColumn({ name: "user_id" })
  user: User;

  @CreateDateColumn()
  purchase_date: Date;

  @Column("decimal", { precision: 10, scale: 2 })
  total_price: number;

  @Column()
  payment_status: string;

  @Column({ nullable: true })
  payment_id: string;

  @OneToMany(() => OrderProduct, orderProduct => orderProduct.order, { cascade: true })
  products: OrderProduct[];
}
