import { Controller } from '@nestjs/common';
import { BusinessService } from './business.service';

@Controller('business')
export default class BusinessController {
  constructor(private readonly businessService: BusinessService) {}
}
