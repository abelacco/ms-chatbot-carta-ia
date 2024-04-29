import { Test, TestingModule } from '@nestjs/testing';
import { GeneralServicesController } from './general-services.controller';
import { GeneralServicesService } from './general-services.service';

describe('GeneralServicesController', () => {
  let controller: GeneralServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeneralServicesController],
      providers: [GeneralServicesService],
    }).compile();

    controller = module.get<GeneralServicesController>(GeneralServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
