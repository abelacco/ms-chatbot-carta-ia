// Definición de tipos de respuesta
export const HTTP_RESPONSE = {
  SUCCESS: '1',
  WARNING: '2',
  ERROR: '3',
  INFO: '4',
  HTTP_200_OK: '200',
  PERMISION_ERROR: '401',
  CODE_NOT_DEFINED: '601',
  MALFORMED_JSON: '701',
  ACCESS_DENIED: '403',
};

export class ApiResponse {
  type: string;
  message: string;
  data: any;

  constructor(type: string, message: string, data: any = null) {
    this.type = type;
    this.message = message;
    this.data = data;
  }

  // Método estático para facilitar la creación de respuestas
  static success(message: string, data: any = null): ApiResponse {
    return new ApiResponse(HTTP_RESPONSE.SUCCESS, message, data);
  }

  static warning(message: string, data: any = null): ApiResponse {
    return new ApiResponse(HTTP_RESPONSE.WARNING, message, data);
  }

  static error(message: string, data: any = null): ApiResponse {
    return new ApiResponse(HTTP_RESPONSE.ERROR, message, data);
  }

  static info(message: string, data: any = null): ApiResponse {
    return new ApiResponse(HTTP_RESPONSE.INFO, message, data);
  }

  static httpOk(message: string, data: any = null): ApiResponse {
    return new ApiResponse(HTTP_RESPONSE.HTTP_200_OK, message, data);
  }

  static permissionError(message: string, data: any = null): ApiResponse {
    return new ApiResponse(HTTP_RESPONSE.PERMISION_ERROR, message, data);
  }

  static malformedJson(message: string, data: any = null): ApiResponse {
    return new ApiResponse(HTTP_RESPONSE.MALFORMED_JSON, message, data);
  }

  static accessDenied(message: string, data: any = null): ApiResponse {
    return new ApiResponse(HTTP_RESPONSE.ACCESS_DENIED, message, data);
  }
}
