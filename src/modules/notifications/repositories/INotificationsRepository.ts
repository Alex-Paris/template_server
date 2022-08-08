import { ICreateNotificationDTO } from "../dtos/ICreateNotificationDTO";
import { Notification } from "../infra/typeorm/schemas/Notification";

export interface INotificationsRepository {
  /**
   * Create notification to be showed in dashbord and API.
   * @param content message to be show in notification.
   * @param recipientId id of the source.
   */
  create(data: ICreateNotificationDTO): Promise<Notification>;
}
