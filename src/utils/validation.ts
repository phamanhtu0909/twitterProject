import { NextFunction, Request, Response } from 'express'
import { body, validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import { EntityError, ErrorWithStatus } from '~/models/Errors'
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req) //lấy từ những chỗ check lỗi vào req
    //hàm run trả ra Promise nên phải dùng await
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }

    const errorObjects = errors.mapped() //lấy ra những lỗi đã được map
    const entityError = new EntityError({ errors: {} })
    //xử lí errorObject
    for (const key in errorObjects) {
      //lấy msg của từng error
      const { msg } = errorObjects[key]
      //nếu msg có dạng ErrorWithStatus và status !==422 thì ném về error handler tổng
      if (msg instanceof ErrorWithStatus && msg.status !== 422) {
        return next(msg)
      }
      //các lỗi 422 từ errorObject sẽ được push vào entityError
      entityError.errors[key] = msg
    } //dùng forin để lấy ra từng key trong errorObject

    //sau khi tổng hợp xong thì ném ra cho defaultErrorHandler xử lý
    next(entityError)
  }
}
