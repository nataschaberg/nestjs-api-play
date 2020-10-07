import {
  Controller,
  Delete,
  Body,
  Get,
  Param,
  Patch,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ResponseDto } from '../../utils/ResponseDto';
import { GetShiftsResponse } from './dto/GetShiftsResponse';
import { GetShiftResponse } from './dto/GetShiftResponse';
import { ShiftService } from './shift.service';
import { ValidationPipe } from '../ValidationPipe';
import { BookTalentRequest } from './dto/BookTalentRequest';
import { CancelTalentRequest } from './dto/CancelTalentRequest';

@Controller('shift')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Get(':jobId')
  async getShifts(
    @Param('jobId', new ParseUUIDPipe()) jobId: string,
  ): Promise<ResponseDto<GetShiftsResponse>> {
    const shifts = await this.shiftService.getShifts(jobId);
    return new ResponseDto<GetShiftsResponse>(
      new GetShiftsResponse(
        shifts.map(shift => {
          return new GetShiftResponse(
            shift.id,
            shift.talentId,
            shift.jobId,
            shift.startTime,
            shift.endTime,
          );
        }),
      ),
    );
  }

  @Patch(':shiftId/book')
  @HttpCode(204)
  async bookTalent(
    @Param('shiftId', new ParseUUIDPipe()) shiftId: string,
    @Body(new ValidationPipe<BookTalentRequest>()) dto: BookTalentRequest,
  ): Promise<void> {
    this.shiftService.bookTalent(shiftId, dto.talent);
  }

  @Delete(':shiftId')
  @HttpCode(204)
  async cancelShift(
    @Param('shiftId', new ParseUUIDPipe()) shiftId: string,
  ): Promise<void> {
    this.shiftService.cancelShift(shiftId);
  }

  @Patch(':talentId/cancel')
  @HttpCode(204)
  async cancelTalent(
    @Param('talentId', new ParseUUIDPipe()) talentId: string,
    @Body(new ValidationPipe<CancelTalentRequest>()) dto: CancelTalentRequest,
  ): Promise<void> {
    this.shiftService.updateTalent(talentId, dto.newTalent);
  }
}
