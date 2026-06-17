import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RecommendationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findRecommendations(userId: string) {
    return this.prisma.recommendation.findMany({
      where: {
        userId,
        implemented: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async saveRecommendations(userId: string, recommendations: { title: string; description: string; type: string }[]) {
    // Overwrite old unimplemented recommendations to prevent bloat
    await this.prisma.recommendation.deleteMany({
      where: {
        userId,
        implemented: false,
      },
    });

    return Promise.all(
      recommendations.map((rec) =>
        this.prisma.recommendation.create({
          data: {
            userId,
            title: rec.title,
            description: rec.description,
            type: rec.type,
          },
        })
      )
    );
  }

  async markImplemented(recId: string) {
    return this.prisma.recommendation.update({
      where: { id: recId },
      data: { implemented: true },
    });
  }
}
export default RecommendationRepository;
