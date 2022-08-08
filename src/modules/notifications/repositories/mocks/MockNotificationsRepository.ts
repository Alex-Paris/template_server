import { ObjectId } from "mongodb";

import { ICreateNotificationDTO } from "@modules/notifications/dtos/ICreateNotificationDTO";
import { Notification } from "@modules/notifications/infra/typeorm/schemas/Notification";

import { INotificationsRepository } from "../INotificationsRepository";

export class MockNotificationsRepository implements INotificationsRepository {
  private notifications: Notification[] = [];

  async create({
    content,
    recipientId,
  }: ICreateNotificationDTO): Promise<Notification> {
    const notification = new Notification();

    Object.assign(notification, { id: new ObjectId(), content, recipientId });

    this.notifications.push(notification);

    return notification;
  }
}
