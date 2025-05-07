import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity
} from "typeorm";
import { User } from "./user";

@Entity()
export class Address extends BaseEntity {

    @PrimaryGeneratedColumn()
    address_id: number;

    @Column()
    department: string;

    @Column()
    city: string;

    @Column()
    via: string;

    @Column()
    primary_number: string;

    @Column()
    complement_1: string;

    @Column()
    complement_2: string;

    @Column()
    neighborhood: string;

    @Column({ nullable: true })
    reference: string; 

    @Column({ default: false })
    is_favorite: boolean;

    @ManyToOne(() => User, user => user.addresses, { onDelete: "CASCADE" })
    user: User;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
