import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class ProfileRetriever {
  constructor(private readonly usersService: UsersService) {}

  async retrieve(userId: string) {
    try {
      const profile = await this.usersService.getProfile(userId);
      if (!profile) return null;
      return {
        fullName: profile.fullName,
        age: profile.age,
        gender: profile.gender,
        weight: profile.weight,
        height: profile.height,
        activityLevel: profile.activityLevel,
        goal: profile.goal,
      };
    } catch (e) {
      return null;
    }
  }
}
