import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ConfigurationValidator {
  private readonly logger = new Logger(ConfigurationValidator.name);

  private readonly requiredEnv = ['DATABASE_URL', 'JWT_SECRET'];
  private readonly optionalEnv = ['GEMINI_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'NODE_ENV', 'PORT'];

  validate(): boolean {
    let allValid = true;
    const missingRequired: string[] = [];
    const missingOptional: string[] = [];
    const invalidFormats: string[] = [];

    // 1. Check required exist
    for (const key of this.requiredEnv) {
      if (!process.env[key] || process.env[key].trim() === '') {
        missingRequired.push(key);
        allValid = false;
      }
    }

    // 2. Check optional exist
    for (const key of this.optionalEnv) {
      if (!process.env[key] || process.env[key].trim() === '') {
        missingOptional.push(key);
      }
    }

    // 3. Database URL validation
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && dbUrl.trim() !== '') {
      const dbUrlRegex = /^(postgresql|postgres):\/\/[^:]+:[^@]+@[^/:]+(:\d+)?\/[^?]+(\?.*)?$/;
      if (!dbUrlRegex.test(dbUrl)) {
        invalidFormats.push('DATABASE_URL must be a valid PostgreSQL connection string');
        allValid = false;
      }
    }

    // 4. JWT Secret strength and placeholder checks
    const jwtSecret = process.env.JWT_SECRET;
    const nodeEnv = process.env.NODE_ENV || 'development';
    if (jwtSecret && jwtSecret.trim() !== '') {
      if (jwtSecret === 'fitmate-secret-key-change-in-production-12345') {
        if (nodeEnv === 'production') {
          invalidFormats.push('JWT_SECRET cannot use the default developer placeholder key in production mode');
          allValid = false;
        } else {
          this.logger.warn('STARTUP WARNING: JWT_SECRET uses a default developer key. This is acceptable for development but must be changed in production.');
        }
      }

      if (nodeEnv === 'production' && jwtSecret.length < 32) {
        invalidFormats.push('JWT_SECRET must be at least 32 characters in production mode for cryptographic safety');
        allValid = false;
      } else if (jwtSecret.length < 16) {
        this.logger.warn('STARTUP WARNING: JWT_SECRET is extremely weak (under 16 characters). Recommend upgrading secret strength.');
      }
    }

    // 5. Output results
    if (missingRequired.length > 0) {
      this.logger.error(`CRITICAL STARTUP ERROR: Missing required environment variables: ${missingRequired.join(', ')}`);
    }

    if (invalidFormats.length > 0) {
      this.logger.error(`CRITICAL STARTUP ERROR: Invalid environment variable formats:\n${invalidFormats.map(f => `- ${f}`).join('\n')}`);
    }

    if (missingOptional.length > 0) {
      this.logger.warn(`STARTUP WARNING: Missing optional environment variables (AI services may be limited): ${missingOptional.join(', ')}`);
    }

    if (allValid) {
      this.logger.log('Startup Configuration Check: SUCCESS (all critical environment parameters verified)');
    } else {
      this.logger.error('Startup Configuration Check: FAILED. Terminating application startup.');
    }

    return allValid;
  }

  getMaskedDiagnostics(): Record<string, string> {
    const diagnostics: Record<string, string> = {};
    const allKeys = [...this.requiredEnv, ...this.optionalEnv];

    for (const key of allKeys) {
      const val = process.env[key];
      if (!val) {
        diagnostics[key] = 'NOT_SET';
      } else {
        diagnostics[key] = this.maskSecret(val, key);
      }
    }

    return diagnostics;
  }

  private maskSecret(val: string, key: string): string {
    if (key.toLowerCase().includes('url')) {
      try {
        const parts = val.split('@');
        if (parts.length > 1) {
          const authPart = parts[0].split('//');
          if (authPart.length > 1) {
            const credentials = authPart[1].split(':');
            const password = credentials[1] ? '******' : '';
            return `${authPart[0]}//${credentials[0]}:${password}@${parts[1]}`;
          }
        }
      } catch {}
      return 'MASKED_URL';
    }

    if (val.length <= 8) {
      return '********';
    }

    return `${val.substring(0, 4)}...${val.substring(val.length - 4)}`;
  }
}
export default ConfigurationValidator;
