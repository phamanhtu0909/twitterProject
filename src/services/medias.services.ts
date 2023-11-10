import sharp from 'sharp'
import { getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/files'
import { Request } from 'express'
import path from 'path'
import { UPLOAD_DIR } from '~/constants/dir'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { MediaType } from '~/constants/enums'
import { Media } from '~/models/schemas/Other'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'

class MediasService {
  async uploadImage(req: Request) {
    //lưu ảnh vào trong uploads/temp
    const files = await handleUploadImage(req)
    //xử lý file bằng sharp giúp tối ưu hình ảnh
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newFilename = getNameFromFullName(file.newFilename) + '.jpg'
        const newPath = UPLOAD_IMAGE_DIR + '/' + newFilename
        const info = await sharp(file.filepath).jpeg().toFile(newPath)
        //xóa file trong temp
        fs.unlinkSync(file.filepath)

        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newFilename}`
            : `http://localhost:${process.env.PORT}/static/image/${newFilename}`,
          type: MediaType.Image
        }
      })
    )
    return result
  }
  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)

    const result: Media[] = await Promise.all(
      files.map(async (video) => {
        const { newFilename } = video
        return {
          url: isProduction
            ? `${process.env.HOST}/static/video-stream/${newFilename}`
            : `http://localhost:${process.env.PORT}/static/video-stream/${newFilename}`,
          type: MediaType.Video
        }
      })
    )
    return result
  }
}

const mediasService = new MediasService()
export default mediasService
