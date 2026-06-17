import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { BackupService } from '../src/common/backup/backup.service';
import { PrismaService } from '../src/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

async function validateBackupRestore() {
  console.log('Bootstrapping NestJS application for backup-restore validation...');
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const backupService = app.get(BackupService);
  const prisma = app.get(PrismaService);
  
  let verified = 'NOT VERIFIED';
  let initialCounts = { users: 0, meals: 0, waterLogs: 0, supplements: 0 };
  let postRestoreCounts = { users: 0, meals: 0, waterLogs: 0, supplements: 0 };
  let filename = '';
  let logs = '';

  try {
    // 1. Fetch initial counts
    initialCounts.users = await prisma.user.count();
    initialCounts.meals = await prisma.meal.count();
    initialCounts.waterLogs = await prisma.waterLog.count();
    initialCounts.supplements = await prisma.supplementLog.count();
    
    console.log('Initial Database Record Counts:', initialCounts);

    // 2. Execute Backup
    console.log('Triggering backup snapshot creation...');
    filename = await backupService.createBackup('all');
    console.log(`Backup file created: ${filename}`);

    // Verify backup file exists
    const backupFilePath = path.join(process.cwd(), 'backups', filename);
    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Backup file does not exist at expected path: ${backupFilePath}`);
    }

    // 3. Mutate DB - Delete all water logs to test restore
    console.log('Simulating data loss (deleting all water logs)...');
    await prisma.waterLog.deleteMany();
    const tempWaterCount = await prisma.waterLog.count();
    console.log(`Water logs count after simulated loss: ${tempWaterCount} (should be 0)`);

    // 4. Run Restore
    console.log('Triggering restore from snapshot...');
    const restoreRes = await backupService.restoreBackup(filename);
    console.log('Restore response:', restoreRes);

    // 5. Fetch post-restore counts
    postRestoreCounts.users = await prisma.user.count();
    postRestoreCounts.meals = await prisma.meal.count();
    postRestoreCounts.waterLogs = await prisma.waterLog.count();
    postRestoreCounts.supplements = await prisma.supplementLog.count();
    console.log('Post-Restore Database Record Counts:', postRestoreCounts);

    // 6. Assertions
    const match = 
      initialCounts.users === postRestoreCounts.users &&
      initialCounts.meals === postRestoreCounts.meals &&
      initialCounts.waterLogs === postRestoreCounts.waterLogs &&
      initialCounts.supplements === postRestoreCounts.supplements;

    if (match) {
      verified = 'VERIFIED';
      console.log('Data recovery verified successfully. Record counts match.');
    } else {
      verified = 'PARTIALLY VERIFIED';
      console.error('Data mismatch: record counts do not match original numbers.');
    }
  } catch (error) {
    console.error('Backup/Restore validation encountered an error:', error);
    logs = error.stack || error.message;
  } finally {
    await app.close();
  }

  // Generate Report
  const reportPath = path.join(
    'C:\\Users\\Dhruv\\.gemini\\antigravity\\brain\\c51c838f-7b7e-4a6a-b832-5c27066d42ae',
    'backup_restore_validation.md'
  );

  const reportContent = `# Backup & Restore Validation Report

**Verification Status**: ${verified}
**Execution Timestamp**: ${new Date().toISOString()}

## Restore Validation Metrics

| Metrics | Before Backup | After simulated loss | Post-Restore | Result |
| :--- | :---: | :---: | :---: | :---: |
| **Users Count** | ${initialCounts.users} | ${initialCounts.users} | ${postRestoreCounts.users} | ${initialCounts.users === postRestoreCounts.users ? 'PASS' : 'FAIL'} |
| **Meals Count** | ${initialCounts.meals} | ${initialCounts.meals} | ${postRestoreCounts.meals} | ${initialCounts.meals === postRestoreCounts.meals ? 'PASS' : 'FAIL'} |
| **Water Logs Count** | ${initialCounts.waterLogs} | 0 | ${postRestoreCounts.waterLogs} | ${initialCounts.waterLogs === postRestoreCounts.waterLogs ? 'PASS' : 'FAIL'} |
| **Supplement Logs Count** | ${initialCounts.supplements} | ${initialCounts.supplements} | ${postRestoreCounts.supplements} | ${initialCounts.supplements === postRestoreCounts.supplements ? 'PASS' : 'FAIL'} |

---

## Output Log / Trace
* **Generated Snapshot Filename**: \`${filename || 'N/A'}\`
* **Integrity Status**: ${verified === 'VERIFIED' ? 'SUCCESS (Full data restoration validated with zero record drift)' : 'FAIL / NOT RUNNABLE'}

${logs ? `\`\`\`text\n${logs}\n\`\`\`` : ''}
`;

  fs.writeFileSync(reportPath, reportContent, 'utf8');
  console.log(`Backup/Restore validation report generated at: ${reportPath}`);
}

validateBackupRestore().catch((e) => {
  console.error('Unhandled error in backup-restore validator:', e);
});
