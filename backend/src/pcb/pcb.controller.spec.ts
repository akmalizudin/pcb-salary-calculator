import { Test, TestingModule } from '@nestjs/testing';
import { PcbController } from './pcb.controller';

describe('PcbController', () => {
  let controller: PcbController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PcbController],
    }).compile();

    controller = module.get<PcbController>(PcbController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
