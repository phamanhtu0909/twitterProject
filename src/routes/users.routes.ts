import { error } from 'console'
import { Router } from 'express'
import { access } from 'fs'
import { register } from 'module'
import { loginController, logoutController, registerController } from '~/controllers/users.controllers'
import {
  accessTokenValidator,
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
export default usersRoute
