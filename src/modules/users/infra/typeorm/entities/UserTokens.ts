import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { User } from "./User";

@Entity("users_tokens")
export class UserTokens {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  refresh_token: string;

  @Column("time with time zone")
  expires_at: Date;

  @Column()
  revoked_by_ip: string;

  @Column("time with time zone")
  revoked_at: Date;

  @Column()
  revoked_reason: string;

  @Column()
  created_by_ip: string;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  replaced_token_id: string;

  @OneToOne(() => UserTokens)
  @JoinColumn({ name: "replaced_token_id" })
  // eslint-disable-next-line no-use-before-define
  replaced_token: UserTokens;

  @Column()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;
}
