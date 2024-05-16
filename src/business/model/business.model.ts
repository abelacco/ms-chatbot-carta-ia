import { CoverageDto } from '../dto/coverage.dto';

export class BusinessModel {
  businessName: string;
  email: string;
  password: string;
  businessId: string;
  chatbotNumber: string;
  adminPhone: string;
  businessHours: string[];
  isActive: boolean;
  address: string;
  slogan: string;
  phoneId: string;
  accessToken: string;
  coverage: any[];
  paymentDetails: {
    paymentMethodName: string;
    available: boolean;
    accountNumber: string;
    accountName: string;
  }[];

  constructor(data: any) {
    this.businessName = data.businessName;
    this.email = data.email;
    this.password = data.password;
    this.businessId = data.businessId;
    this.chatbotNumber = data.chatbotNumber;
    this.adminPhone = data.adminPhone;
    this.businessHours = data.businessHours;
    this.isActive = data.isActive;
    this.address = data.address;
    this.slogan = data.slogan;
    this.phoneId = '';
    this.coverage = data.coverage;
    this.accessToken = '';
    this.paymentDetails = data.paymentDetails;
  }
}
