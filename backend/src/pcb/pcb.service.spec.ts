import { Test, TestingModule } from '@nestjs/testing';
import { PcbService } from './pcb.service';

describe('PcbService', () => {
  let service: PcbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PcbService],
    }).compile();

    service = module.get<PcbService>(PcbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
