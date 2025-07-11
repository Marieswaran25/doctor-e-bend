import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Users } from './users';

export interface SessionAttributes {
    id: string;
    externalSessionId: string;
    startedAt: Date;
    endedAt?: Date | null;
    duration: number;
    status: 'active' | 'inactive';
    metadata: string | null;
    userId: Users;
    createdAt: Date;
    updatedAt?: Date | null;
    deletedAt?: Date | null;
}

@Entity({ name: 'sessions' })
export class Sessions extends BaseEntity implements SessionAttributes {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id!: string;

    @Column('varchar', { name: 'externalSessionId', nullable: false, unique: true, length: 255 })
    externalSessionId!: string;

    @Column('timestamp with time zone', { name: 'startedAt', nullable: false })
    startedAt!: Date;

    @Column('timestamp with time zone', { name: 'endedAt', nullable: true, default: null })
    endedAt?: Date | null;

    @Column('int', { name: 'duration', nullable: false, default: 0 })
    duration!: number;

    @Column('varchar', { name: 'status', nullable: false, length: 255 })
    status: 'active' | 'inactive';

    @Column('jsonb', { name: 'metadata', nullable: true, default: null })
    metadata: string | null;

    @ManyToOne(() => Users, user => user.id, { nullable: false })
    userId!: Users;

    @CreateDateColumn({ name: 'createdAt' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updatedAt', nullable: true, default: null })
    updatedAt?: Date | null;

    @DeleteDateColumn({ name: 'deletedAt', nullable: true, default: null })
    deletedAt?: Date | null;
}
