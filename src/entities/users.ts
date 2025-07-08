import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { UserRoles } from './userRoles';

export type LOGIN_TYPE = 'google' | 'default';
export interface UserAttributes {
    id: string;
    username: string;
    email: string;
    password?: string | null;
    mobileNumber?: string | null;
    profileUrl?: string | null;
    loginType: LOGIN_TYPE;
    metadata: string | null;
    emailVerified?: boolean;
    blacklisted?: boolean;
    createdAt: Date;
    updatedAt?: Date | null;
    deletedAt?: Date | null;
}

@Entity({ name: 'users' })
export class Users extends BaseEntity implements UserAttributes {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id!: string;

    @Column('varchar', { name: 'username', length: 255, nullable: false })
    username!: string;

    @Column('varchar', { name: 'email', nullable: false, unique: true, length: 255 })
    email!: string;

    @Column('varchar', { name: 'loginType', default: 'default', length: 255 })
    loginType: LOGIN_TYPE;

    @Column('varchar', { name: 'password', nullable: true, default: null, length: 255 })
    password?: string | null;

    @Column('varchar', { name: 'mobileNumber', nullable: true, default: null, length: 255 })
    mobileNumber?: string | null;

    @Column('varchar', { name: 'profileUrl', nullable: true, default: null, length: 255 })
    profileUrl?: string | null;

    @Column('jsonb', { name: 'metadata', nullable: true, default: null })
    metadata: string | null;

    @Column('boolean', { name: 'emailVerified', nullable: false, default: false })
    emailVerified?: boolean;

    @Column('boolean', { name: 'blacklisted', nullable: false, default: false })
    blacklisted?: boolean;

    @CreateDateColumn({ name: 'createdAt' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updatedAt', nullable: true, default: null })
    updatedAt?: Date | null;

    @DeleteDateColumn({ name: 'deletedAt', nullable: true, default: null })
    deletedAt?: Date | null;

    @OneToMany(() => UserRoles, userRoles => userRoles.userId)
    userRoles!: UserRoles[];
}
