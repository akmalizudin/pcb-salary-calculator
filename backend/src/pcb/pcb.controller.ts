import { Body, Controller, Get, Post } from '@nestjs/common';
import { PcbService } from './pcb.service';
import { CalculatePcbDto } from './dto/calculate-pcb.dto';

@Controller('pcb')
export class PcbController {
  constructor(private readonly pcbService: PcbService) {}

  @Get('test')
  test() {
    return { message: 'PCB Controller is working!' };
  }

  @Post('calculate')
  calculate(@Body() dto: CalculatePcbDto) {
    return this.pcbService.calculate(dto);
  }
}
