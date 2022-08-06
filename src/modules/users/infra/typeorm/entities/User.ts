import { Exclude, Expose } from "class-transformer";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import upload from "@config/upload";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  avatar: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  /** Get avatar url depending of it's storaged local. */
  @Expose({ name: "avatarUrl" })
  getAvatarUrl(): string | null {
    if (!this.avatar) {
      return null;
    }

    switch (upload.driver) {
      case "disk":
        return `${process.env.APP_API_URL}/files/${this.avatar}`;
      case "awsS3":
        return `https://${upload.config.aws.bucket}.s3.${upload.config.aws.region}.amazonaws.com/${this.avatar}`;
      default:
        return null;
    }
  }
}
