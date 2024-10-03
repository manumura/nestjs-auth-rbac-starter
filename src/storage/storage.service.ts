import { MultipartFile } from '@fastify/multipart';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import cloudinary, { UploadApiOptions, UploadApiResponse, UploadResponseCallback } from 'cloudinary';
import fs, { promises as fsAsync } from 'fs';
import moment from 'moment';
import { extname } from 'path';
import { Transform, pipeline } from 'stream';
import util from 'util';
import { UploadResponseModel } from '../shared/model/upload.response.model';

@Injectable()
export class StorageService {
  private readonly logger = new Logger('StorageService');
  private readonly pump = util.promisify(pipeline);

  async uploadProfileImage(filepath: string, userUuId: string): Promise<UploadApiResponse> {
    const nowAsString = moment().utc().format('YYYYMMDDHHmmss');
    const options: UploadApiOptions = {
      folder: 'profiles/' + userUuId,
      resource_type: 'image',
      public_id: 'profile_' + userUuId + '_' + nowAsString,
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    };
    const response = await cloudinary.v2.uploader.upload(filepath, options);
    return response;
  }

  // https://cloudinary.com/documentation/upload_images#chunked_asset_upload
  // https://support.cloudinary.com/hc/en-us/articles/208263735-Guidelines-for-implementing-chunked-upload-to-Cloudinary
  // https://medium.com/@maksim_smagin/software-architecture-101-how-to-upload-file-s3-nodejs-fastify-68fceb5c5133
  async uploadVideo(filepath: string, userUuId: string, callback: UploadResponseCallback): Promise<UploadApiResponse> {
    const nowAsString = moment().utc().format('YYYYMMDDHHmmss');
    const options: UploadApiOptions = {
      // filename: editCloudinaryFileName,
      folder: 'videos/' + userUuId,
      public_id: 'video_' + userUuId + '_' + nowAsString,
      resource_type: 'video',
    };
    const response = await cloudinary.v2.uploader.upload_large(filepath, options, callback);
    return response;
  }

  async delete(publicId: string): Promise<any> {
    this.logger.verbose(`Trying to delete file by public ID: ${publicId}`);
    const res = await cloudinary.v2.uploader.destroy(publicId, (error, result) => {
      if (error) {
        this.logger.error(`Delete image failed: ${JSON.stringify(error)}`);
      }

      if (result) {
        this.logger.verbose(`Delete file by public ID: ${publicId} result: ${JSON.stringify(result)}`);
      }
    });
    return res;
  }

  async saveVideoToLocalPath(multipartFile: MultipartFile): Promise<UploadResponseModel | null> {
    return this.saveToLocalPath(multipartFile);
  }

  async saveImageToLocalPath(multipartFile: MultipartFile): Promise<UploadResponseModel | null> {
    return this.saveToLocalPath(
      multipartFile,
      /(jpg|jpeg|png|gif)$/,
      'File should be an image with extension jpg, jpeg, png or gif',
    );
  }

  async saveCsvToLocalPath(multipartFile: MultipartFile): Promise<UploadResponseModel | null> {
    return this.saveToLocalPath(multipartFile, /(csv)$/, 'File is not a CSV');
  }

  private async saveToLocalPath(
    multipartFile: MultipartFile,
    mimeTypesRegex?: RegExp,
    validationErrorMessage?: string,
  ): Promise<UploadResponseModel | null> {
    // https://backend.cafe/fastify-multipart-upload
    this.logger.verbose(`File received: ${multipartFile.filename} (${multipartFile.mimetype})`);
    if (mimeTypesRegex && !mimeTypesRegex.exec(multipartFile.mimetype)) {
      throw new BadRequestException(validationErrorMessage);
    }

    try {
      const tmpFilename = './tmp/' + this.renameFile(multipartFile.filename);
      const localFile = fs.createWriteStream(tmpFilename);
      await this.pump(multipartFile.file, localFile);
      this.logger.verbose(`File saved localy: ${tmpFilename} (${multipartFile.mimetype})`);

      return {
        filename: multipartFile.filename,
        filepath: tmpFilename,
      };
    } catch (error) {
      this.logger.error(`Error while saving file ${multipartFile.filename}: ${error}`);
      return null;
    }
  }

  deleteFromLocalPath(filePath: string): void {
    fsAsync
      .unlink(filePath)
      .then(() => this.logger.verbose(`File deleted successfully ${filePath}`))
      .catch((error) => this.logger.error(`Error while deleting file ${filePath}: ${error}`));
  }

  readFile(filepath: string, transform: Transform, onData: (data) => Promise<void>, onEnd: () => Promise<void>) {
    fs.createReadStream(filepath).pipe(transform).on('data', onData).on('end', onEnd);
  }

  private renameFile(filename: string) {
    const name = filename.split('.')[0];
    const fileExtName = extname(filename);
    const nowAsString = moment().utc().format('YYYYMMDDHHmmss');
    return `${name}-${nowAsString}${fileExtName}`;
  }
}
