import { Test, TestingModule } from '@nestjs/testing';
import { GeneralServicesService } from './general-services.service';

describe('GeneralServicesService', () => {
  let service: GeneralServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeneralServicesService],
    }).compile();

    service = module.get<GeneralServicesService>(GeneralServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
