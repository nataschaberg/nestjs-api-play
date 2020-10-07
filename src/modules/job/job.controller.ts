import {
  Controller,
  Post,
  Delete,
  Body,
  Get,
  Param,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import { v4 as UUIDv4 } from 'uuid';
import { JobService } from './job.service';
import { ResponseDto } from '../../utils/ResponseDto';
import { ValidationPipe } from '../ValidationPipe';
import { JobRequest } from './dto/JobRequest';
import { JobRequestResponse } from './dto/JobRequestResponse';
import { ShiftService } from '../shift/shift.service';

@Controller('job')
export class JobController {
  constructor(
    private readonly jobService: JobService,
    private readonly shiftService: ShiftService,
  ) {}

  @Post()
  async requestJob(
    @Body(new ValidationPipe<JobRequest>())
    dto: JobRequest,
  ): Promise<ResponseDto<JobRequestResponse>> {
    const job = await this.jobService.createJob(
      UUIDv4(),
      dto.start,
      dto.end,
      dto.startHour,
      dto.endHour,
    );
    return new ResponseDto<JobRequestResponse>(new JobRequestResponse(job.id));
  }

  @Get(':jobId')
  async getShifts(
    @Param('jobId', new ParseUUIDPipe()) jobId: string,
  ): Promise<any> {
    const job = await this.jobService.getJob(jobId);
    return job;
  }

  @Delete(':jobId')
  @HttpCode(204)
  async cancelJob(
    @Param('jobId', new ParseUUIDPipe()) jobId: string,
  ): Promise<any> {
    await this.shiftService.cancelShifts(jobId);
    await this.jobService.cancelJob(jobId);
  }
}
