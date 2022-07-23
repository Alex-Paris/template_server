import { Expose } from "class-transformer";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { dateNow, isBefore } from "@utils/date";

import { User } from "./User";

export type TType = "refresh_token" | "forgot_password" | "create_user";

export enum EType {
  refresh_token,
  forgot_password,
  create_user,
}

@Entity("users_tokens")
export class UserTokens {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  refresh_token: string;

  @Column()
  type: EType;

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
  replaced_token_id?: string;

  @OneToOne(() => UserTokens)
  @JoinColumn({ name: "replaced_token_id" })
  // eslint-disable-next-line no-use-before-define
  replaced_token: UserTokens;

  @Column()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Expose({ name: "description_type" })
  getType(): string {
    switch (this.type) {
      case EType.refresh_token:
        return "Refresh token";
      case EType.forgot_password:
        return "Recovery password token";
      default:
        return "Not expected type";
    }
  }

  @Expose({ name: "is_expired" })
  getIsExpired(): boolean {
    return isBefore(this.expires_at, dateNow());
  }

  @Expose({ name: "is_revoked" })
  getIsRevoked(): boolean {
    return this.revoked_at !== null && this.revoked_at !== undefined;
  }

  @Expose({ name: "is_active" })
  getIsActive(): boolean {
    return !this.getIsExpired() && !this.getIsRevoked();
  }
}
