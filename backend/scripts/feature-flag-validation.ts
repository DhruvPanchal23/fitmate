import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { FeatureFlagService } from '../src/admin/services/feature-flag.service';
import * as fs from 'fs';
import * as path from 'path';

async function validateFeatureFlags() {
  console.log('Bootstrapping NestJS for Feature Flag validation tests...');
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const flagService = app.get(FeatureFlagService);
  
  let verified = 'NOT VERIFIED';
  const testFlagKey = `smoke-test-flag-${Math.random().toString(36).substring(2, 7)}`;
  const results = {
    disabledInaccessible: false,
    enabledAccessible: false,
    targetingRulesCorrect: false,
    rollbackWithoutRestart: false,
  };
  let logs = '';

  try {
    // 1. Create a disabled flag
    console.log(`Creating disabled test flag: ${testFlagKey}`);
    await flagService.createFeatureFlag({
      key: testFlagKey,
      enabled: false,
      description: 'Temporary smoke test feature flag',
    }, 'smoke-test-admin');

    // Assert it is disabled
    const step1 = await flagService.isFeatureEnabled(testFlagKey, 'user-1');
    results.disabledInaccessible = (step1 === false);
    console.log(`Disabled check: ${step1 === false ? 'PASS' : 'FAIL'}`);

    // 2. Enable the flag
    console.log(`Enabling test flag: ${testFlagKey}`);
    await flagService.updateFeatureFlag(testFlagKey, { enabled: true }, 'smoke-test-admin');

    const step2 = await flagService.isFeatureEnabled(testFlagKey, 'user-1');
    results.enabledAccessible = (step2 === true);
    console.log(`Enabled check: ${step2 === true ? 'PASS' : 'FAIL'}`);

    // 3. Test Targeting rules
    console.log('Testing targeting rules (userId constraints)...');
    await flagService.updateFeatureFlag(testFlagKey, {
      rules: JSON.stringify({ userIds: ['allowed-user-123'] }),
    }, 'smoke-test-admin');

    const allowedCheck = await flagService.isFeatureEnabled(testFlagKey, 'allowed-user-123');
    const blockedCheck = await flagService.isFeatureEnabled(testFlagKey, 'other-user');
    results.targetingRulesCorrect = (allowedCheck === true && blockedCheck === false);
    console.log(`Targeting check: ${results.targetingRulesCorrect ? 'PASS' : 'FAIL'}`);

    // 4. Test Rollback without reboot
    console.log('Testing rollback (disabling flag)...');
    await flagService.updateFeatureFlag(testFlagKey, { enabled: false, rules: '' }, 'smoke-test-admin');
    
    const step4 = await flagService.isFeatureEnabled(testFlagKey, 'user-1');
    results.rollbackWithoutRestart = (step4 === false);
    console.log(`Rollback check: ${step4 === false ? 'PASS' : 'FAIL'}`);

    if (
      results.disabledInaccessible &&
      results.enabledAccessible &&
      results.targetingRulesCorrect &&
      results.rollbackWithoutRestart
    ) {
      verified = 'VERIFIED';
    }
  } catch (error) {
    console.error('Feature Flag validation encountered an error:', error);
    logs = error.stack || error.message;
  } finally {
    // Clean up
    try {
      const prisma = app.get('PrismaService');
      await prisma.featureFlag.delete({ where: { key: testFlagKey } });
      console.log('Cleaned up test feature flag from DB.');
    } catch {}
    await app.close();
  }

  // Generate Report
  const reportPath = path.join(
    'C:\\Users\\Dhruv\\.gemini\\antigravity\\brain\\c51c838f-7b7e-4a6a-b832-5c27066d42ae',
    'feature_flag_validation.md'
  );

  const reportContent = `# Feature Flag Validation Report

**Verification Status**: ${verified}
**Execution Timestamp**: ${new Date().toISOString()}

## Feature Flag Test Cases Matrix

| Test Case | Description | Expected | Actual | Result |
| :--- | :--- | :---: | :---: | :---: |
| **Disabled Inaccessible** | Disabled feature flags block user entry | \`false\` | \`${!results.disabledInaccessible}\` | ${results.disabledInaccessible ? 'PASS' : 'FAIL'} |
| **Enabled Accessible** | Enabled feature flags allow user entry | \`true\` | \`${results.enabledAccessible}\` | ${results.enabledAccessible ? 'PASS' : 'FAIL'} |
| **Targeting Rules** | Only target specified userIds | \`true\` (allowed) / \`false\` (other) | \`${results.targetingRulesCorrect}\` | ${results.targetingRulesCorrect ? 'PASS' : 'FAIL'} |
| **Rollback Without Restart** | Disabling flag applies immediately | \`false\` | \`${!results.rollbackWithoutRestart}\` | ${results.rollbackWithoutRestart ? 'PASS' : 'FAIL'} |

---

## Validation Summary
* **Outcome**: **${verified === 'VERIFIED' ? 'PASS' : 'FAIL'}**
* **Verification Detail**: Asserts that dynamic feature gates from the Admin Portal sync directly into backend validation pipes without requiring thread reboots.

${logs ? `\`\`\`text\n${logs}\n\`\`\`` : ''}
`;

  fs.writeFileSync(reportPath, reportContent, 'utf8');
  console.log(`Feature Flag validation report generated at: ${reportPath}`);
}

validateFeatureFlags().catch((e) => {
  console.error('Unhandled error in feature flag validator:', e);
});
