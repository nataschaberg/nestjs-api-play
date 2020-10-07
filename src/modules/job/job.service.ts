import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as UUIDv4 } from 'uuid';
import { eachDayOfInterval } from 'date-fns';
import { Repository } from 'typeorm';
import { Job } from './job.entity';
import { Shift } from '../shift/shift.entity';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  public async getJobs(): Promise<Job[]> {
    return this.jobRepository.find();
  }

  public async getJob(uuid: string): Promise<Job[]> {
    return this.jobRepository.find({
      where: {
        id: uuid,
      },
    });
  }

  public async createJob(
    uuid: string,
    date1: Date,
    date2: Date,
    hourStart: number | undefined,
    hourEnd: number | undefined,
  ): Promise<Job> {
    !hourStart && (hourStart = 8);
    !hourEnd && (hourEnd = 17);

    return this.createJobEntry(uuid, date1, date2, hourStart, hourEnd);
  }

  private async createJobEntry(
    uuid: string,
    date1: Date,
    date2: Date,
    hourStart: number,
    hourEnd: number,
  ): Promise<Job> {
    /**
     * I assume based on your default start and
     * end times that shifst are max 8 hours plus 1 hour break
     */
    const shiftDurationValid =
      hourEnd === hourStart
        ? false
        : hourEnd > hourStart
        ? hourEnd - hourStart <= 9
        : hourEnd + 24 - hourStart <= 9;

    if (!shiftDurationValid)
      throw new NotAcceptableException(
        'Start and end times do not comply to requirements',
      );

    const overnight = hourStart > hourEnd;

    date1.setUTCHours(hourStart);
    date2.setUTCHours(hourEnd);

    const job = new Job();
    job.id = uuid;
    job.companyId = UUIDv4();
    job.startTime = date1;
    job.endTime = date2;

    const intervalArray = eachDayOfInterval({ start: date1, end: date2 });

    job.shifts = intervalArray.map((day, i, array) => {
      if (overnight && i === array.length - 1) return;

      const startTime = new Date(day);
      startTime.setUTCHours(hourStart);

      const endTime = overnight ? new Date(array[i + 1]) : new Date(day);
      endTime.setUTCHours(hourEnd);

      const shift = new Shift();
      shift.id = UUIDv4();
      shift.job = job;
      shift.startTime = startTime;
      shift.endTime = endTime;
      return shift;
    });

    return this.jobRepository.save(job);
  }

  async cancelJob(uuid: string): Promise<void> {
    const job = await this.getJob(uuid);
    this.jobRepository.remove(job[0]);
  }
}
