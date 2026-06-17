import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../logger.service';

@Injectable()
export class BackupService {
  private readonly backupDir = path.join(process.cwd(), 'backups');

  constructor(private readonly prisma: PrismaService) {
    try {
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }
    } catch (err) {
      logger.error('Failed to create backups directory', err);
    }
  }

  async createBackup(type: 'database' | 'prompts' | 'memory' | 'food' | 'config' | 'all'): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const snapshot: any = {
      timestamp: new Date().toISOString(),
      type,
    };

    try {
      if (type === 'database' || type === 'all') {
        snapshot.users = await this.prisma.user.findMany({ include: { profile: true } });
        snapshot.meals = await this.prisma.meal.findMany({ include: { items: true } });
        snapshot.waterLogs = await this.prisma.waterLog.findMany();
        snapshot.supplementLogs = await this.prisma.supplementLog.findMany();
        snapshot.exerciseLogs = await this.prisma.exerciseLog.findMany();
      }

      if (type === 'prompts' || type === 'all') {
        snapshot.promptTemplates = await this.prisma.promptTemplate.findMany();
        snapshot.contentVersions = await this.prisma.contentVersion.findMany();
      }

      if (type === 'memory' || type === 'all') {
        snapshot.userMemories = await this.prisma.userMemory.findMany();
      }

      if (type === 'food' || type === 'all') {
        snapshot.foodCatalog = await this.prisma.food.findMany();
      }

      if (type === 'config' || type === 'all') {
        snapshot.remoteConfigs = await this.prisma.remoteConfig.findMany();
        // Mask env keys
        const env: Record<string, string> = {};
        for (const key of Object.keys(process.env)) {
          const value = process.env[key] || '';
          if (key.includes('KEY') || key.includes('SECRET') || key.includes('PASSWORD') || key.includes('URL')) {
            env[key] = value.substring(0, Math.min(4, value.length)) + '****';
          } else {
            env[key] = value;
          }
        }
        snapshot.env = env;
      }

      const filename = `snapshot-${type}-${timestamp}.json`;
      const filepath = path.join(this.backupDir, filename);
      fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2), 'utf-8');
      logger.log(`Created backup snapshot: ${filepath}`, 'BackupService');
      return filename;
    } catch (error) {
      logger.error(`Failed to create backup type ${type}`, error);
      throw error;
    }
  }

  async listBackups() {
    try {
      if (!fs.existsSync(this.backupDir)) return [];
      const files = fs.readdirSync(this.backupDir);
      return files
        .filter(f => f.startsWith('snapshot-') && f.endsWith('.json'))
        .map(f => {
          const stats = fs.statSync(path.join(this.backupDir, f));
          return {
            filename: f,
            sizeBytes: stats.size,
            createdAt: stats.birthtime,
          };
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (err) {
      logger.error('Failed to list backup directory files', err);
      return [];
    }
  }

  async restoreBackup(filename: string): Promise<{ success: boolean; message: string }> {
    const filepath = path.join(this.backupDir, filename);
    if (!fs.existsSync(filepath)) {
      throw new Error(`Backup snapshot file ${filename} not found`);
    }

    try {
      const content = fs.readFileSync(filepath, 'utf-8');
      const snapshot = JSON.parse(content);

      if (snapshot.users) {
        for (const u of snapshot.users) {
          await this.prisma.user.upsert({
            where: { id: u.id },
            create: {
              id: u.id,
              email: u.email,
              passwordHash: u.passwordHash,
              createdAt: new Date(u.createdAt),
              updatedAt: new Date(u.updatedAt),
            },
            update: {
              email: u.email,
              passwordHash: u.passwordHash,
            },
          });
          if (u.profile) {
            const prof = u.profile;
            await this.prisma.userProfile.upsert({
              where: { userId: u.id },
              create: {
                id: prof.id,
                userId: u.id,
                fullName: prof.fullName,
                gender: prof.gender,
                age: prof.age,
                height: prof.height,
                weight: prof.weight,
                activityLevel: prof.activityLevel,
                goal: prof.goal,
              },
              update: {
                fullName: prof.fullName,
                gender: prof.gender,
                age: prof.age,
                height: prof.height,
                weight: prof.weight,
                activityLevel: prof.activityLevel,
                goal: prof.goal,
              },
            });
          }
        }
      }

      if (snapshot.foodCatalog) {
        for (const f of snapshot.foodCatalog) {
          await this.prisma.food.upsert({
            where: { id: f.id },
            create: {
              id: f.id,
              name: f.name,
              calories: f.calories,
              protein: f.protein,
              carbohydrates: f.carbohydrates,
              fats: f.fats,
              fiber: f.fiber,
              sugar: f.sugar,
              defaultUnit: f.defaultUnit,
              servingSize: f.servingSize,
              source: f.source,
            },
            update: {
              calories: f.calories,
              protein: f.protein,
              carbohydrates: f.carbohydrates,
              fats: f.fats,
            },
          });
        }
      }

      if (snapshot.promptTemplates) {
        for (const t of snapshot.promptTemplates) {
          await this.prisma.promptTemplate.upsert({
            where: { id: t.id },
            create: {
              id: t.id,
              key: t.key,
              description: t.description || null,
              activeId: t.activeId || null,
              createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
              updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(),
            },
            update: {
              description: t.description || null,
              activeId: t.activeId || null,
            },
          });
        }
      }

      if (snapshot.contentVersions) {
        for (const cv of snapshot.contentVersions) {
          await this.prisma.contentVersion.upsert({
            where: { id: cv.id },
            create: {
              id: cv.id,
              promptTemplateId: cv.promptTemplateId,
              version: cv.version,
              content: cv.content,
              createdBy: cv.createdBy,
              isActive: cv.isActive ?? false,
              createdAt: cv.createdAt ? new Date(cv.createdAt) : new Date(),
            },
            update: {
              content: cv.content,
              isActive: cv.isActive ?? false,
            },
          });
        }
      }

      if (snapshot.userMemories) {
        for (const m of snapshot.userMemories) {
          await this.prisma.userMemory.upsert({
            where: { id: m.id },
            create: {
              id: m.id,
              userId: m.userId,
              category: m.category,
              content: m.content,
              isPinned: m.isPinned ?? false,
              isIgnored: m.isIgnored ?? false,
              createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
              updatedAt: m.updatedAt ? new Date(m.updatedAt) : new Date(),
            },
            update: {
              content: m.content,
              isPinned: m.isPinned ?? false,
              isIgnored: m.isIgnored ?? false,
            },
          });
        }
      }

      return {
        success: true,
        message: `Successfully restored snapshot ${filename}`,
      };
    } catch (error) {
      logger.error(`Failed to restore backup snapshot ${filename}`, error);
      throw error;
    }
  }
}
export default BackupService;
