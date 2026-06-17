import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface PromptConfig {
  systemPrompt: string;
  developerPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

@Injectable()
export class PromptRegistryService {
  constructor(private readonly prisma: PrismaService) {}

  async getPrompts() {
    return this.prisma.promptTemplate.findMany({
      orderBy: { key: 'asc' },
      include: {
        versions: {
          orderBy: { version: 'desc' },
        },
      },
    });
  }

  async getActivePrompt(key: string): Promise<PromptConfig & { version: number }> {
    const template = await this.prisma.promptTemplate.findUnique({
      where: { key },
      include: {
        versions: {
          where: { isActive: true },
          take: 1,
        },
      },
    });

    if (!template || template.versions.length === 0) {
      // Return hardcoded system default configuration if none is in the database yet
      return {
        systemPrompt: 'You are FitMate AI Coach, a supportive fitness and nutrition advisor. Guide the user safely.',
        developerPrompt: 'Output response as JSON with answer, suggestedFoods, suggestedMeals, estimatedMacros, warnings, and followUpQuestions.',
        model: 'gemini-2.5-flash',
        temperature: 0.2,
        maxTokens: 2048,
        version: 0,
      };
    }

    const activeVer = template.versions[0];
    try {
      const config = JSON.parse(activeVer.content) as PromptConfig;
      return {
        ...config,
        version: activeVer.version,
      };
    } catch {
      // Fallback if content is raw string
      return {
        systemPrompt: activeVer.content,
        version: activeVer.version,
      };
    }
  }

  async createPromptTemplate(key: string, description?: string) {
    return this.prisma.promptTemplate.create({
      data: {
        key,
        description,
      },
    });
  }

  async addPromptVersion(key: string, config: PromptConfig, createdBy: string) {
    let template = await this.prisma.promptTemplate.findUnique({
      where: { key },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    if (!template) {
      template = await this.prisma.promptTemplate.create({
        data: { key, description: `Prompt registry template for ${key}` },
        include: { versions: true },
      });
    }

    const nextVer = template.versions.length > 0 ? template.versions[0].version + 1 : 1;
    const content = JSON.stringify(config);

    return this.prisma.contentVersion.create({
      data: {
        promptTemplateId: template.id,
        version: nextVer,
        content,
        createdBy,
        isActive: false,
      },
    });
  }

  async activatePromptVersion(key: string, versionId: string) {
    const template = await this.prisma.promptTemplate.findUnique({ where: { key } });
    if (!template) throw new NotFoundException('Prompt template not found');

    // Inactivate all versions under this template
    await this.prisma.contentVersion.updateMany({
      where: { promptTemplateId: template.id },
      data: { isActive: false },
    });

    // Activate selected
    await this.prisma.contentVersion.update({
      where: { id: versionId },
      data: { isActive: true },
    });

    // Update template active link
    return this.prisma.promptTemplate.update({
      where: { id: template.id },
      data: { activeId: versionId },
    });
  }
}
export default PromptRegistryService;
