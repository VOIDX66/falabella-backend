import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity
} from "typeorm";

@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    user_id : number

    @Column()
    name : string

    @Column()
    lastname : string

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

    @CreateDateColumn()
    create_at : Date

    @UpdateDateColumn()
    updated_at : Date
}