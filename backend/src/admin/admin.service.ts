import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminRepository } from './repositories/admin.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepo: AdminRepository,
    private readonly jwtService: JwtService
  ) {}

  async seedRBAC() {
    await this.adminRepo.seedRBAC();
    return { success: true, message: 'RBAC seeded successfully' };
  }

  async registerAdmin(dto: { email: string; passwordHash: string; fullName: string; roleName: string }) {
    const existing = await this.adminRepo.findAdminUserByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Admin email is already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.passwordHash, salt);

    // Find roleId by roleName
    let role = await this.adminRepo.prisma.role.findUnique({
      where: { name: dto.roleName },
    });

    if (!role) {
      // If roles aren't seeded yet, seed them first
      await this.seedRBAC();
      role = await this.adminRepo.prisma.role.findUnique({
        where: { name: dto.roleName },
      });
      if (!role) {
        // fallback
        role = await this.adminRepo.prisma.role.findFirst() || await this.adminRepo.prisma.role.create({
          data: { name: dto.roleName },
        });
      }
    }

    const created = await this.adminRepo.createAdminUser({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      roleId: role.id,
    });

    return {
      success: true,
      adminUserId: created.id,
    };
  }

  async loginAdmin(dto: { email: string; password?: string }) {
    const admin = await this.adminRepo.findAdminUserByEmail(dto.email);
    if (!admin) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    if (dto.password) {
      const matched = await bcrypt.compare(dto.password, admin.passwordHash);
      if (!matched) {
        throw new UnauthorizedException('Invalid admin credentials');
      }
    }

    const permissions = admin.role.permissions.map(p => p.action);
    const payload = {
      sub: admin.id,
      email: admin.email,
      isAdmin: true,
      role: admin.role.name,
      permissions,
    };

    return {
      token: this.jwtService.sign(payload),
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role.name,
        permissions,
      },
    };
  }

  async getAdminProfile(id: string) {
    const admin = await this.adminRepo.findAdminUserById(id);
    if (!admin) throw new UnauthorizedException('Admin profile not found');
    return admin;
  }
}
export default AdminService;
