import {
  ObjectID,
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ObjectIdColumn,
} from "typeorm";

@Entity("notifications")
export class Notification {
  @ObjectIdColumn()
  id: ObjectID; // ID do MongoDB

  @Column()
  content: string;

  @Column("uuid", { name: "recipient_id" })
  recipientId: string;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
