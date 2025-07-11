import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Sessions } from './sessions';
import { Users } from './users';

export interface ConversationAttributes {
    id: string;
    externalConversationId: string;
    conversation: string | null;
    sessionId: Sessions;
    userId: Users;
    createdAt: Date;
    updatedAt?: Date | null;
    deletedAt?: Date | null;
}

@Entity({ name: 'conversations' })
export class Conversations extends BaseEntity implements ConversationAttributes {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id!: string;

    @Column('varchar', { name: 'externalConversationId', nullable: false, unique: true, length: 255 })
    externalConversationId!: string;

    @Column('jsonb', { name: 'conversation', nullable: true, default: null })
    conversation: string | null;

    @OneToOne(() => Sessions, session => session.id, { nullable: false })
    sessionId!: Sessions;

    @ManyToOne(() => Users, user => user.id, { nullable: false })
    userId!: Users;

    @CreateDateColumn({ name: 'createdAt' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updatedAt', nullable: true, default: null })
    updatedAt?: Date | null;

    @DeleteDateColumn({ name: 'deletedAt', nullable: true, default: null })
    deletedAt?: Date | null;
}
