import { Router } from 'express'
import {
  changePasswordController,
  emailVerifyTokenController,
  followController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  unfollowController,
  updateMeController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/requests/User.requests'
import { wrapAsync } from '~/utils/handlers'

const usersRoute = Router()
/*
des: đăng nhập
path: /users/login
method: POST
body: {email, password}
*/

usersRoute.post('/login', loginValidator, wrapAsync(loginController))

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
/*
des: reset password
path: '/reset-password'
method: POST
Header: không cần, vì  ngta quên mật khẩu rồi, thì sao mà đăng nhập để có authen đc
body: {forgot_password_token: string, password: string, confirm_password: string}
*/
usersRoute.post(
  '/reset-password',
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator,
  wrapAsync(resetPasswordController)
)

/*
des: get profile của user
path: '/me'
method: get
Header: {Authorization: Bearer <access_token>}
body: {}
*/
usersRoute.get('/me', accessTokenValidator, wrapAsync(getMeController))

usersRoute.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  filterMiddleware<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'avatar',
    'username',
    'cover_photo'
  ]),
  updateMeValidator,
  wrapAsync(updateMeController)
)

/*
des: get profile của user khác bằng unsername
path: '/:username'
method: get
không cần header vì, chưa đăng nhập cũng có thể xem
*/
usersRoute.get('/:username', wrapAsync(getProfileController))
//chưa có controller getProfileController, nên bây giờ ta làm

/*
des: Follow someone
path: '/follow'
method: post
headers: {Authorization: Bearer <access_token>}
body: {followed_user_id: string}
*/
//654cb33e35133e703f807db2 user 50
//654cb491ca6eebfa96f046a1  user 54
usersRoute.post('/follow', accessTokenValidator, verifiedUserValidator, followValidator, wrapAsync(followController))
//accessTokenValidator dùng dể kiểm tra xem ngta có đăng nhập hay chưa, và có đc user_id của người dùng từ req.decoded_authorization
//verifiedUserValidator dùng để kiễm tra xem ngta đã verify email hay chưa, rồi thì mới cho follow người khác
//trong req.body có followed_user_id  là mã của người mà ngta muốn follow
//followValidator: kiểm tra followed_user_id truyền lên có đúng định dạng objectId hay không
//  account đó có tồn tại hay không
//followController: tiến hành thao tác tạo document vào collection followers

/*
    des: unfollow someone
    path: '/follow/:user_id'
    method: delete
    headers: {Authorization: Bearer <access_token>}
  g}
    */
usersRoute.delete(
  '/unfollow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowValidator,
  wrapAsync(unfollowController)
)

//unfollowValidator: kiểm tra user_id truyền qua params có hợp lệ hay k?

/*
  des: change password
  path: '/change-password'
  method: PUT
  headers: {Authorization: Bearer <access_token>}
  Body: {old_password: string, password: string, confirm_password: string}
g}
  */
usersRoute.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapAsync(changePasswordController)
)
//changePasswordValidator kiểm tra các giá trị truyền lên trên body cớ valid k ?

/*
  des: refreshtoken
  path: '/refresh-token'
  method: POST
  Body: {refresh_token: string}
g}
  */
usersRoute.post('/refresh-token', refreshTokenValidator, wrapAsync(refreshTokenController))
//khỏi kiểm tra accesstoken, tại nó hết hạn rồi mà
//refreshController chưa làm

export default usersRoute
