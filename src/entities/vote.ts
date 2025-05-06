import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    BaseEntity
  } from 'typeorm';
  import { ProductReview } from './comment';
  
  @Entity()
  export class UserVote extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => ProductReview, (review) => review.id_comment)
    @JoinColumn({ name: 'id_comment' })
    comment: ProductReview;
  
    @Column()
    userId: number;
  
    @Column()
    action: 'like' | 'dislike'; // Puede ser "like" o "dislike"
  }
  