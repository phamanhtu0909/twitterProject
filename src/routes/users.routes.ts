import { Router } from 'express'
import { register } from 'module'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'

const usersRoute = Router()

usersRoute.get('/login', loginValidator, loginController)

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
usersRoute.post('/register', registerValidator, registerController)

export default usersRoute