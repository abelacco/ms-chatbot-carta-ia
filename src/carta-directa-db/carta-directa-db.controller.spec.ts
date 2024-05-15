import { Test, TestingModule } from '@nestjs/testing';
import { CartaDirectaDbController } from './carta-directa-db.controller';
import { CartaDirectaDbService } from './carta-directa-db.service';

describe('CartaDirectaDbController', () => {
  let controller: CartaDirectaDbController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartaDirectaDbController],
      providers: [CartaDirectaDbService],
    }).compile();

    controller = module.get<CartaDirectaDbController>(CartaDirectaDbController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
