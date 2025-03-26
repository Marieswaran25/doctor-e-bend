import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export interface UserAttributes {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string | null;
    mobileNumber?: string | null;
    metadata: string | null;
    emailVerified?: 0 | 1;
    blacklisted?: 0 | 1;
    createdAt: Date;
    updatedAt?: Date | null;
    deletedAt?: Date | null;
}

@Entity({ name: 'users' })
export class Users extends BaseEntity implements UserAttributes {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id!: string;

    @Column('text', { name: 'firstName', nullable: false })
    firstName!: string;

    @Column('text', { name: 'lastName', nullable: false })
    lastName!: string;

    @Column('varchar', { name: 'email', nullable: false, unique: true, length: 255 })
    email!: string;

    @Column('text', { name: 'password', nullable: true, default: () => 'NULL' })
    password?: string | null;

    @Column('text', { name: 'mobileNumber', nullable: true, default: () => 'NULL' })
    mobileNumber?: string | null;

    @Column('json', { name: 'metadata', nullable: true, default: () => 'NULL' })
    metadata: string | null;

    @Column('tinyint', { name: 'blacklisted', nullable: false, default: 0 })
    blacklisted?: 0 | 1;

    @CreateDateColumn({ name: 'createdAt', type: 'datetime' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updatedAt', nullable: true, default: () => 'NULL' })
    updatedAt?: Date | null;

    @DeleteDateColumn({ name: 'deletedAt', nullable: true, default: () => 'NULL' })
    deletedAt?: Date | null;
}
