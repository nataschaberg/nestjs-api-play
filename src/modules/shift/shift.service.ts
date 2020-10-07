import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Shift } from './shift.entity';

@Injectable()
export class ShiftService {
  constructor(
    @InjectRepository(Shift)
    private readonly repository: Repository<Shift>,
  ) {}

  public async getShifts(jobId: string): Promise<Shift[]> {
    return this.repository.find({
      where: {
        jobId,
      },
    });
  }
  public async addShift(jobId: string, newShift: Shift): Promise<void> {
    const shifts = await this.getShifts(jobId);
    shifts.concat(newShift);
    this.repository.save(shifts);
  }

  public async cancelShifts(jobId: string): Promise<void> {
    const shifts = await this.getShifts(jobId);
    shifts.forEach(shift => this.repository.remove(shift));
  }

  public async cancelShift(shiftId: string): Promise<void> {
    const shift = await this.repository.find({
      where: {
        id: shiftId,
      },
    });
    this.repository.remove(shift);
  }

  public async bookTalent(shiftId: string, talent: string): Promise<void> {
    const shift = await this.repository.findOne(shiftId);
    shift.talentId = talent;
    this.repository.save(shift);
  }

  public async cancelTalent(shiftId: string): Promise<void> {
    const shift = await this.repository.findOne(shiftId);
    shift.talentId = null;
    this.repository.save(shift);
  }

  public async updateTalent(
    talentId: string,
    newTalentId: string | undefined,
  ): Promise<void> {
    const shifts = await this.repository.find({
      where: {
        talentId,
      },
    });

    shifts
      .filter(shift => shift.startTime > new Date())
      .forEach(shift =>
        this.repository.update(
          { id: shift.id },
          { talentId: newTalentId || null },
        ),
      );
  }
}
