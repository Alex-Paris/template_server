export interface IAuthenticateSessionDTO {
  refresh_token: string;
  expires_at: Date;
  created_by_ip: string;
  user_id: string;
}
