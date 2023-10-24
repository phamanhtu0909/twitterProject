import { createHash } from 'crypto'
import { config } from 'dotenv'
config()
//tạo 1 hàm nhận vào chuỗi là mã hóa thoe chuẩn sha256

function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

//hàm nhận vào password và trả về password đã mã hóa
//hàm mã hóa password kèm 1 mật khẩu bí mật do mình tạo ra
export function hashPassword(password: string) {
  return sha256(password + process.env.PASSWORD_SECRET)
}
