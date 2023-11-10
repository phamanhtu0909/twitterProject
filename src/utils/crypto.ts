import { createHash } from 'crypto'
import { config } from 'dotenv'
config()

//Tạo một hàm nhận vào chuỗi là mã hóa theo chuẩn SHA256

function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

// Hàm nhận vào password sau đó mã hóa
export function hashPassword(password: string) {
  return sha256(password + process.env.PASSWORD_SECRET)
}
