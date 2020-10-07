import {
  IsNotEmpty,
  IsDate,
  IsUUID,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class JobRequest {
  @IsNotEmpty()
  @IsUUID(4)
  companyId: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  start: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  end: Date;

  @IsNumber()
  @IsOptional()
  startHour: number;

  @IsNumber()
  @IsOptional()
  endHour: number;
}
