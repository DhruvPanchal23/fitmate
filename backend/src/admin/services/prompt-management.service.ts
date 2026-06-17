import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminRepository } from '../repositories/admin.repository';
import { AuditService } from './audit.service';

@Injectable()
export class PromptManagementService {
  constructor(
    private readonly adminRepo: AdminRepository,
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService
  ) {}

  async getPrompts(adminUserId: string) {
    return this.adminRepo.getPrompts();
  }

  async createPromptTemplate(key: string, description: string, adminUserId: string) {
    const created = await this.adminRepo.createPromptTemplate(key, description);
    await this.auditService.log({
      adminUserId,
      action: 'prompt:create_template',
      target: `Template key: ${key}`,
      afterValue: created,
    });
    return created;
  }

  async addPromptVersion(key: string, content: string, adminUserId: string, createdByEmail: string) {
    let template = await this.adminRepo.findPromptByKey(key);
    if (!template) {
      const created = await this.adminRepo.createPromptTemplate(key, `Dynamic prompt for ${key}`);
      template = { ...created, versions: [] };
    }

    const nextVersionNumber = template.versions.length > 0 ? template.versions[0].version + 1 : 1;
    const version = await this.adminRepo.addPromptVersion(template.id, content, nextVersionNumber, createdByEmail);

    await this.auditService.log({
      adminUserId,
      action: 'prompt:add_version',
      target: `Template key: ${key}, Version: ${nextVersionNumber}`,
      afterValue: version,
    });
    return version;
  }

  async activatePromptVersion(key: string, versionId: string, adminUserId: string) {
    const template = await this.adminRepo.findPromptByKey(key);
    if (!template) throw new NotFoundException('Prompt template not found');

    const version = template.versions.find(v => v.id === versionId);
    if (!version) throw new NotFoundException('Prompt version not found');

    const updated = await this.adminRepo.activatePromptVersion(template.id, versionId);
    await this.auditService.log({
      adminUserId,
      action: 'prompt:activate_version',
      target: `Template key: ${key}, Version ID: ${versionId}`,
      beforeValue: { activeId: template.activeId },
      afterValue: { activeId: versionId },
    });
    return updated;
  }

  async rollbackPromptVersion(key: string, versionId: string, adminUserId: string) {
    // Rollback is equivalent to activating a past version
    return this.activatePromptVersion(key, versionId, adminUserId);
  }

  async previewPrompt(key: string, versionId: string) {
    const template = await this.adminRepo.findPromptByKey(key);
    if (!template) throw new NotFoundException('Prompt template not found');

    const version = template.versions.find(v => v.id === versionId);
    if (!version) throw new NotFoundException('Prompt version not found');

    return {
      key,
      version: version.version,
      content: version.content,
      renderedPreview: version.content
        .replace('{{userName}}', 'Dhruv')
        .replace('{{userGoal}}', 'fat_loss')
        .replace('{{caloriesTarget}}', '2200'),
    };
  }
}
export default PromptManagementService;
