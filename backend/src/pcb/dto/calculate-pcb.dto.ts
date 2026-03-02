import { Type } from "class-transformer";
import { IsNumber, IsOptional, Min } from "class-validator";

export class CalculatePcbDto {
  // monthlySalary: number;
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
  
  epfRate?: number;
}
