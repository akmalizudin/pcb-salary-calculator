import { Module } from '@nestjs/common';
import { PcbController } from './pcb.controller';
import { PcbService } from './pcb.service';

@Module({
  controllers: [PcbController],
  providers: [PcbService]
})
export class PcbModule {}
