import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'
import { ObjectId } from 'mongodb'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { USERS_MESSAGES } from '~/constants/messages'

class UsersService {
  // hàm nhận vào user_id và bỏ vào payload để tạo AccessToken
  // hàm nhận vào user_id và bỏ vào payload để tạo RefreshToken
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN as string }
    })
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN as string }
    })
  }
  //ký asccess_token và refresh_token
  private signAccessAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }
  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }

  async register(payload: RegisterReqBody) {
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        //vì User.schema.ts có date_of_birth là Date
        //nhưng mà người dùng gửi lên payload là string
        password: hashPassword(payload.password)
      })
    )
    //insertOne sẽ trả về 1 object, trong đó có thuộc tính insertedId là user_Id của user vừa tạo
    //vì vậy ta sẽ lấy user_Id đó ra để tạo token
    const user_id = result.insertedId.toString()
    // const accessToken = await this.signAccessToken(user_Id)
    // const refreshToken = await this.signRefreshToken(user_Id)
    //nên viết là thì sẽ giảm thời gian chờ 2 cái này tạo ra
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
    //đây cũng chính là lý do mình chọn xử lý bất đồng bộ, thay vì chọn xử lý đồng bộ
    //Promise.all giúp nó chạy bất đồng bộ, chạy song song nhau, giảm thời gian

    //Lưu refresh_token vào database
    //lưu lại refreshToken và collection refreshTokens mới tạo
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    return { access_token, refresh_token }
    //ta sẽ return 2 cái này về cho client
    //thay vì return user_Id về cho client
  }
  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    return { access_token, refresh_token }
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return { message: USERS_MESSAGES.USERS_LOGOUT_SUCCESS }
  }
}

const usersService = new UsersService()
export default usersService
