//file này dùng để định nghĩa lain Request truyền lên từ client
import { Request } from 'express'
import User from './models/schemas/User.schema'
import { TokenPayload } from './models/requests/User.requests'
declare module 'express' {
  interface Request {
    user?: User // trong 1 request có thể có hoặc không có user
    decoded_authorization?: TokenPayload // trong 1 request có thể có hoặc không có decoded_athorization_token
    decoded_refresh_token?: TokenPayload // trong 1 request có thể có hoặc không có decoded_refresh_token
    decoded_email_verify_token?: TokenPayload // trong 1 request có thể có hoặc không có decoded_email_verify_token
    decoded_forgot_password_token?: TokenPayload // trong 1 request có thể có hoặc không có decoded_forgot_password_token
  }
}
