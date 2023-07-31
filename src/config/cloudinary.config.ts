import { ConfigOptions } from 'cloudinary';
import { appConfig } from './config';

export const cloudinaryConfig: ConfigOptions = {
  cloud_name: appConfig.CLOUDINARY_NAME,
  api_key: appConfig.CLOUDINARY_API_KEY,
  api_secret: appConfig.CLOUDINARY_API_SECRET,
  provisioning_api_key: '',
  provisioning_api_secret: '',
};
