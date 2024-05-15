import { Test, TestingModule } from '@nestjs/testing';
import { CartaDirectaDbService } from './carta-directa-db.service';

describe('CartaDirectaDbService', () => {
  let service: CartaDirectaDbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartaDirectaDbService],
    }).compile();

    service = module.get<CartaDirectaDbService>(CartaDirectaDbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
