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

export type TType = "refreshToken" | "forgotPassword" | "createUser";

export enum EType {
  refreshToken,
  forgotPassword,
  createUser,
}

@Entity("users_tokens")
export class UserTokens {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "refresh_token" })
  refreshToken: string;

  @Column()
  type: EType;

  @Column("time with time zone", { name: "expires_at" })
  expiresAt: Date;

  @Column({ name: "revoked_by_ip" })
  revokedByIp: string;

  @Column("time with time zone", { name: "revoked_at" })
  revokedAt: Date;

  @Column({ name: "revoked_reason" })
  revokedReason: string;

  @Column({ name: "created_by_ip" })
  createdByIp: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @Column({ name: "replaced_token_id" })
  replacedTokenId?: string;

  @OneToOne(() => UserTokens)
  @JoinColumn({ name: "replaced_token_id" })
  // eslint-disable-next-line no-use-before-define
  replacedToken: UserTokens;

  @Column({ name: "user_id" })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Expose({ name: "descriptionType" })
  getType(): string {
    switch (this.type) {
      case EType.refreshToken:
        return "Refresh token";
      case EType.forgotPassword:
        return "Recovery password token";
      default:
        return "Not expected type";
    }
  }

  @Expose({ name: "isExpired" })
  getIsExpired(): boolean {
    return isBefore(this.expiresAt, dateNow());
  }

  @Expose({ name: "isRevoked" })
  getIsRevoked(): boolean {
    return this.revokedAt !== null && this.revokedAt !== undefined;
  }

  @Expose({ name: "isActive" })
  getIsActive(): boolean {
    return !this.getIsExpired() && !this.getIsRevoked();
  }
}
