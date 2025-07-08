import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Users } from './users';
export type Roles = 'user' | 'admin' | 'super-admin';
export interface UserRoleAttributes {
    id: string;
    userId: Users;
    role: Roles;
    createdAt: Date;
    updatedAt?: Date | null;
    deletedAt?: Date | null;
}

@Entity({ name: 'user-roles' })
export class UserRoles extends BaseEntity implements UserRoleAttributes {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id!: string;

    @ManyToOne(() => Users, user => user.id, { nullable: false, onDelete: 'CASCADE' })
    userId!: Users;

    @Column('varchar', { name: 'role', nullable: false, length: 255 })
    role: Roles;

    @CreateDateColumn({ name: 'createdAt' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updatedAt', nullable: true, default: null })
    updatedAt?: Date | null;

    @DeleteDateColumn({ name: 'deletedAt', nullable: true, default: null })
    deletedAt?: Date | null;
}
