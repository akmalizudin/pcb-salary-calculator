import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, Max, Min } from 'class-validator';

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

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(12)
  @IsOptional()
  monthNumber?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  ytdGross?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  ytdEpf?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  ytdPcb?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  ytdZakat?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(3)
  @IsOptional()
  deductionCategory?: 1 | 2 | 3;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  includeBonusInSocsoEis?: boolean;
}
