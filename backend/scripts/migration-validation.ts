import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

async function runMigrationValidation() {
  console.log('Starting migration validation checks...');
  let statusOutput = '';
  let seedOutput = '';
  let verified = 'NOT VERIFIED';
  let logs = '';

  try {
    // 1. Check schema status
    console.log('Running: npx prisma migrate status...');
    const statusResult = execSync('npx prisma migrate status --schema=schema.prisma', {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    });
    statusOutput = statusResult;
    verified = 'VERIFIED';
    console.log('Migration status checked successfully.');
  } catch (e) {
    statusOutput = `Failed to run migration status: ${e.message}\n${e.stdout || ''}\n${e.stderr || ''}`;
    console.warn('Migration status check failed (could be due to database availability).');
  }

  try {
    // 2. Dry run seed if user wants to check seed capability
    console.log('Testing seed validation run...');
    const seedResult = execSync('npx prisma db seed --schema=schema.prisma', {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    });
    seedOutput = seedResult;
    console.log('Seed executed successfully.');
  } catch (e) {
    seedOutput = `Failed to execute seed script: ${e.message}\n${e.stdout || ''}\n${e.stderr || ''}`;
    console.warn('Seed execution failed.');
  }

  // 3. Generate report
  const reportPath = path.join(
    'C:\\Users\\Dhruv\\.gemini\\antigravity\\brain\\c51c838f-7b7e-4a6a-b832-5c27066d42ae',
    'migration_validation_report.md'
  );

  const reportContent = `# Database Migration Validation Report

**Verification Status**: ${verified}
**Execution Timestamp**: ${new Date().toISOString()}

## Summary of Migration Checks
* **Prisma Migrations Status Check**: ${verified === 'VERIFIED' ? 'PASS' : 'FAIL / NOT RUNNABLE'}
* **Prisma Seeding Check**: ${seedOutput.includes('completed successfully') ? 'PASS' : 'FAIL / NOT RUNNABLE'}

---

## Migration Status Logs
\`\`\`text
${statusOutput}
\`\`\`

---

## Seed Execution Logs
\`\`\`text
${seedOutput}
\`\`\`
`;

  fs.writeFileSync(reportPath, reportContent, 'utf8');
  console.log(`Migration validation report generated at: ${reportPath}`);
}

runMigrationValidation().catch((e) => {
  console.error('Unhandled error in migration validator:', e);
});
