import { PipeTransform, ArgumentMetadata, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class SanitizationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'body' && value && typeof value === 'object') {
      return this.sanitizeObject(value);
    }
    return value;
  }

  private sanitizeObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (obj !== null && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key of Object.keys(obj)) {
        sanitized[key] = this.sanitizeObject(obj[key]);
      }
      return sanitized;
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    return obj;
  }

  private sanitizeString(str: string): string {
    let cleaned = str.trim();

    // 1. XSS Script Tag Sanitization
    cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''); // remove script tags
    cleaned = cleaned.replace(/on\w+\s*=/gi, 'blocked_attr='); // disable handlers like onerror, onload, onclick
    cleaned = cleaned.replace(/javascript:/gi, 'blocked_js:'); // disable javascript pseudo-protocol

    // 2. Simple SQL Injection pattern scrubbing
    // Prisma uses parameterized queries, making raw SQL injection impossible on standard ORM calls.
    // However, we scrub common query breaker tokens to be absolutely secure.
    cleaned = cleaned.replace(/UNION\s+SELECT/gi, 'UNION_SELECT');
    cleaned = cleaned.replace(/--/g, '__'); // block SQL comment sequences

    return cleaned;
  }
}
export default SanitizationPipe;
