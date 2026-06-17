import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_PERMISSION_KEY } from '../decorators/require-permission.decorator';

@Injectable()
export class AdminRbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<string>(
      REQUIRE_PERMISSION_KEY,
      [context.getHandler(), context.getClass()]
    );

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user is authenticated and is an admin
    if (!user || !user.isAdmin) {
      throw new ForbiddenException('Access denied. Admin credentials required.');
    }

    // If no specific permission is required, just being admin is enough
    if (!requiredPermission) {
      return true;
    }

    // Check if user has the specific required permission
    const hasPermission = user.permissions && user.permissions.includes(requiredPermission);
    if (!hasPermission) {
      throw new ForbiddenException(`Access denied. Required permission: ${requiredPermission}`);
    }

    return true;
  }
}
export default AdminRbacGuard;
