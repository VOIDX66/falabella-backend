import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	AfterInsert,
	BaseEntity
} from 'typeorm';
import { AppDataSource } from '../db';
import { Product } from './product';
  
@Entity()
export class ProductReview extends BaseEntity {
	@PrimaryGeneratedColumn({ name: 'id_comment' })
	id_comment: number;

	@Column()
	userId: number; // ID del usuario que comenta

	@Column()
	productId: number; // ID del producto comentado

	@Column({ type: 'int' })
	rating: number; // obligatorio (1-5)

	@Column()
	reviewerName: string; // obligatorio

	@Column({ nullable: true })
	summary?: string; // describe tu calificación (opcional)

	@Column({ type: 'text', nullable: true })
	comment?: string; // opinión (opcional)

	@Column({ type:"jsonb", nullable: true, default : [] })
	photos?: string[]; // hasta 6 fotos (opcional)

	@Column({ type: 'boolean', nullable: true })
	recommended?: boolean; // si/no (opcional)

	@Column({ type: 'int', default: 0 })
  likes: number; // Campo para contar los likes

  @Column({ type: 'int', default: 0 })
  dislikes: number; // Campo para contar los dislikes

	@CreateDateColumn()
	createdAt: Date;

	///
	@AfterInsert()
	async updateProductRating() {
		const reviewRepo = AppDataSource.getRepository(ProductReview);
		const productRepo = AppDataSource.getRepository(Product);

		const result = await reviewRepo
			.createQueryBuilder("review")
			.select("AVG(review.rating)", "avg")
			.where("review.productId = :productId", { productId: this.productId })
			.getRawOne();

		const avg = parseFloat(result.avg);

		await productRepo.update(this.productId, {
			rating: parseFloat(avg.toFixed(1)),
		});
	}
}

