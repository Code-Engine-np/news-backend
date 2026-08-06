import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@/common/interfaces/env.interface';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService<AppConfig, true>) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME', {
        infer: true,
      }),
      api_key: this.configService.get('CLOUDINARY_API_KEY', {
        infer: true,
      }),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET', {
        infer: true,
      }),
    });
  }

  generateUploadSignature(folder = 'Best_News_Assets') {
    const timestamp = Math.round(Date.now() / 1000);
    const params = { timestamp, folder };

    const signature = cloudinary.utils.api_sign_request(
      params,
      this.configService.get('CLOUDINARY_API_SECRET', {
        infer: true,
      }),
    );

    return {
      timestamp,
      signature,
      apiKey: this.configService.get('CLOUDINARY_API_KEY', { infer: true }),
      cloudName: this.configService.get('CLOUDINARY_CLOUD_NAME', {
        infer: true,
      }),
      folder,
    };
  }

  generateDeleteSignature(publicId: string) {
    const timestamp = Math.round(Date.now() / 1000);

    // Must match exactly what you send in FormData
    const paramsToSign = { public_id: publicId, timestamp };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      this.configService.get('CLOUDINARY_API_SECRET', { infer: true }),
    );

    return {
      timestamp,
      signature,
      publicId, // send back so frontend uses the exact same value
      apiKey: this.configService.get('CLOUDINARY_API_KEY', { infer: true }),
      cloudName: this.configService.get('CLOUDINARY_CLOUD_NAME', {
        infer: true,
      }),
    };
  }
}
