import { IsUUID, IsOptional } from 'class-validator';

export class CancelTalentRequest {
  @IsUUID(4)
  @IsOptional()
  newTalent: string;
}
