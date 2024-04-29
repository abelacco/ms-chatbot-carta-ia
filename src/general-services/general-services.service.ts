import { Injectable } from '@nestjs/common';
import { CreateGeneralServiceDto } from './dto/create-general-service.dto';
import { UpdateGeneralServiceDto } from './dto/update-general-service.dto';
import { DOCUMENT_IDENTIFIERS } from 'src/common/constants';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './types/cloudinary-response';
const streamifier = require('streamifier');

@Injectable()
export class GeneralServicesService {
  private apiKey: string;
  private urlApiPeruService: string;

  constructor() {
    this.apiKey = process.env.API_PERU_KEY;
    this.urlApiPeruService = process.env.URL_API_PERU_SERVICE;
  }

  async findDocument(document: string) {
    const tipo =
      document.length === DOCUMENT_IDENTIFIERS.DNI_LENGTH
        ? DOCUMENT_IDENTIFIERS.DNI_TYPE
        : DOCUMENT_IDENTIFIERS.RUC_TYPE;
    try {
      const url = `${this.urlApiPeruService}${tipo}/${document}?token=${this.apiKey}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return error;
    }
  }

  async uploadFromURL(imageUrl: string): Promise<CloudinaryResponse> {
    const whatsAppToken = process.env.CURRENT_ACCESS_TOKEN;
    // Descargar la imagen de la URL
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: { Authorization: `Bearer ${whatsAppToken}` },
    });
    const imageBuffer = Buffer.from(response.data, 'binary');

    // Subir el buffer a Cloudinary
    return this.uploadToCloudinary(imageBuffer);
  }

  private uploadToCloudinary(imageBuffer: Buffer): Promise<CloudinaryResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        (error: CloudinaryResponse, result: CloudinaryResponse) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        },
      );
      streamifier.createReadStream(imageBuffer).pipe(stream);
    });
  }

  async getWhatsappMediaUrl(imageId: string) {
    try {
      const getImage = await axios.get(
        `https://graph.facebook.com/v16.0/${imageId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CURRENT_ACCESS_TOKEN}`,
          },
        },
      );
      const imageUrl = getImage.data.url; // No necesitas await aquí
      return imageUrl;
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw error; // O maneja el error aquí de alguna manera.
    }
  }

  create(createGeneralServiceDto: CreateGeneralServiceDto) {
    return 'This action adds a new generalService';
  }

  findAll() {
    return `This action returns all generalServices`;
  }

  findOne(id: number) {
    return `This action returns a #${id} generalService`;
  }

  update(id: number, updateGeneralServiceDto: UpdateGeneralServiceDto) {
    return `This action updates a #${id} generalService`;
  }

  remove(id: number) {
    return `This action removes a #${id} generalService`;
  }
}
