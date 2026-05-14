import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

export interface PersonData {
  id: string;
  firstName: string;
  lastName: string;
  gender?: string;
  birthDate?: Date | null;
  deathDate?: Date | null;
  isLiving?: boolean;
  phone?: string | null;
  address?: string | null;
  [key: string]: any;
}

// Skip privacy interceptor for specific routes
export const SKIP_PRIVACY_KEY = 'skipPrivacy';

@Injectable()
export class PrivacyInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_PRIVACY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skip) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return next.handle().pipe(
      map((data) => {
        // Handle array or single object
        if (Array.isArray(data)) {
          return data.map((item) => this.sanitizePerson(item, user));
        }
        return this.sanitizePerson(data, user);
      }),
    );
  }

  private sanitizePerson(data: any, user: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // Check if this looks like a person object
    if (!data.firstName && !data.lastName) {
      return data;
    }

    const isLiving = data.isLiving ?? true;
    const isSelf = user && data.id === user.personId;
    const isFamilyMember = user && user.treeId === data.treeId;

    // Create sanitized copy
    const sanitized = { ...data };

    if (isSelf || !isLiving) {
      // Show full data for self or deceased persons
      return sanitized;
    }

    if (isFamilyMember) {
      // Partial sanitization for family members
      if (sanitized.birthDate) {
        // Show only year
        sanitized.birthDate = new Date(
          new Date(sanitized.birthDate).getFullYear(),
          0,
          1,
        );
      }
      if (sanitized.phone) {
        // Mask middle digits
        sanitized.phone = sanitized.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
      }
      if (sanitized.address) {
        // Show only city level
        sanitized.address = sanitized.address.split('').slice(0, 3).join('') + '**';
      }
    } else {
      // Strong anonymization for public/non-members
      sanitized.firstName = sanitized.firstName.charAt(0) + '**';
      sanitized.birthDate = null;
      sanitized.deathDate = null;
      sanitized.phone = null;
      sanitized.address = null;
      sanitized.biography = null;
    }

    return sanitized;
  }
}
