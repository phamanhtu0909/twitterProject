import { error } from 'console'
import { Router } from 'express'
import { access } from 'fs'
import { register } from 'module'
import {
  emailVerifyTokenController,
  loginController,
  logoutController,
  registerController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
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
usersRoute.post('/verify_email', emailVerifyTokenValidator, wrapAsync(emailVerifyTokenController))

export default usersRoute
