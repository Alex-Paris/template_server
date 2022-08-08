import { MongoRepository } from "typeorm";

import { ICreateNotificationDTO } from "@modules/notifications/dtos/ICreateNotificationDTO";
import { INotificationsRepository } from "@modules/notifications/repositories/INotificationsRepository";

import { queueSource } from "@shared/infra/typeorm/data-source";

import { Notification } from "../schemas/Notification";

export class NotificationsRepository implements INotificationsRepository {
  private repository: MongoRepository<Notification>;

  constructor() {
    this.repository = queueSource.getMongoRepository(Notification);
  }

  public async create(data: ICreateNotificationDTO): Promise<Notification> {
    const notification = this.repository.create(data);

    await this.repository.save(notification);

    return notification;
  }
}
