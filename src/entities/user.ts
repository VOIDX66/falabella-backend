import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    OneToMany
} from "typeorm";

import { Address } from "./address";

@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    user_id : number

    @Column()
    name : string

    @Column()
    lastname : string

    @Column({ nullable : true})
    lastname2 : string

    @Column({ unique : true })
    email : string

    @Column()
    id_type : string

    @Column()
    id_number : string
    
    @Column( { unique : true } )
    phone : string

    @Column()
    password : string

    @OneToMany(() => Address, address => address.user, { cascade: true })
    addresses: Address[];

    @CreateDateColumn()
    create_at : Date

    @UpdateDateColumn()
    updated_at : Date
}