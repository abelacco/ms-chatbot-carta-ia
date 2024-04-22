import { Test, TestingModule } from '@nestjs/testing';
import { FlowsController } from './flows.controller';
import { FlowsService } from './flows.service';

describe('FlowsController', () => {
  let controller: FlowsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlowsController],
      providers: [FlowsService],
    }).compile();

    controller = module.get<FlowsController>(FlowsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
