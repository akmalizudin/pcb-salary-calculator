import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PcbModule } from './pcb/pcb.module';

@Module({
  imports: [PcbModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
