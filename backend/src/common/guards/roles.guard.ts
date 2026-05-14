import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const TREE_ID_KEY = 'treeId';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Check if user has required role
    if (requiredRoles.includes(user.role)) {
      return true;
    }

    // Check tree-specific permissions
    const treeId = this.reflector.get<string>(TREE_ID_KEY, context.getHandler());
    if (treeId && user.treeMemberships) {
      const membership = user.treeMemberships.find((m: any) => m.treeId === treeId);
      if (membership && requiredRoles.includes(membership.role)) {
        return true;
      }
    }

    return false;
  }
}
