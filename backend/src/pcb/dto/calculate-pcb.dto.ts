import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class CalculatePcbDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlySalary: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  allowance?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  bonus?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  epfRate?: number;
}
