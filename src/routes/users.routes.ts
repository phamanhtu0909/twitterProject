import { error } from 'console'
import { Router } from 'express'
import { access } from 'fs'
import { register } from 'module'
import {
  emailVerifyTokenController,
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const usersRoute = Router()
/*
des: đăng nhập
path: /users/login
method: POST
body: {email, password}
*/

usersRoute.get('/login', loginValidator, wrapAsync(loginController))

/*
Description: Register new user
Path: /register
body:{
    name: string
    email: string
    password: string
    confirm_password: string(quy chuẩn)
    data_of_birth: string theo chuẩn ISO 8601 (do tk json không có tk nào là Date hết)
}
*/
usersRoute.post('/register', registerValidator, wrapAsync(registerController))

/*
  des: lougout
  path: /users/logout
  method: POST
  Header: {Authorization: Bearer <access_token>}
  body: {refresh_token: string}
  */
usersRoute.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController)) //ta sẽ thêm middleware sau

/*
des: verify email
khi người dùng đăng kí họ sẽ nhận được mail có link dạng
http://localhost:3000/users/verify-email?token=<email_verify_token>
nếu mà em nhấp vào link thì sẽ tạo ra req gữi lên email_verify_token lên server
server kiểm tra xem email_verify_token có hợp lệ hay không
thì từ cái decoded_email_verify_token ta sẽ lấy ra user_Id
và vào user_Id đó để update lại trường email_verified_token thành rỗng, verify =1,update_at = Date.now()
path: /users/verify-email
method: POST
body: {email_verify_token: string}
*/
usersRoute.post('/verify-email', emailVerifyTokenValidator, wrapAsync(emailVerifyTokenController))

/*
des: refresh email verify token
khi maill thất lạc , hoặc email_verify_token hết hạn, thì người dùng có nhu cầu resend email verify token

method: POST
path: /users/resend-verifi-email
headers: {Authorization: "Bearer <access_token>"}//dăng nhập mới được resend email verify token
*/
usersRoute.post('/resend-verifi-email', accessTokenValidator, wrapAsync(resendEmailVerifyController))

/*
des: khi người dùng quên mật khẩu, họ sẽ gữi lên email của mình tạo cho họ forgot password token
path: /users/forgot-password
method: POST
body: {email: string}
*/
usersRoute.post('/forgot-password', forgotPasswordValidator, wrapAsync(forgotPasswordController))

/*
des: khi người dùng nhấp vào link trong email để reset password, 
họ sẽ gữi 1 req kèm theo forgot_password_token lên sever 
sau đó chuyển hướng người dùng đến trang reset password
path: /users/reset-password
method: POST
body: {forgot_password_token: string}
*/
usersRoute.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapAsync(verifyForgotPasswordTokenController)
)
export default usersRoute
