import { Request, Response } from 'express'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.requests'
export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'test@gmail.com' && password === '123456')
    return res.json({
      message: 'login successfully',
      result: [
        { name: 'Điệp', yob: 1999 },
        { name: 'Hùng', yob: 2003 },
        { name: 'Được', yob: 1994 }
      ]
    })
  return res.status(400).json({
    error: 'login faied'
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  try {
    const result = await usersService.register(req.body)
    res.json({
      message: 'register successfully',
      result
    })
  } catch (error) {
    res.status(400).json({
      message: 'register faied',
      error
    })
  }
}
