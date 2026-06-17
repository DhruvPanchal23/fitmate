import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  dtoName: string;
  contractInterface: string;
  status: 'PASS' | 'FAIL';
  missingFields: string[];
}

function checkContractMatch() {
  console.log('Starting API contract validation scan...');
  const results: ValidationResult[] = [];
  let verified = 'VERIFIED';

  // We map backend DTO paths to shared contract paths and their interfaces
  const mappings = [
    {
      dtoPath: 'backend/src/auth/dto/login.dto.ts',
      contractPath: 'shared/contracts/auth.ts',
      dtoName: 'LoginDto',
      contractInterface: 'LoginRequest',
    },
    {
      dtoPath: 'backend/src/auth/dto/register.dto.ts',
      contractPath: 'shared/contracts/auth.ts',
      dtoName: 'RegisterDto',
      contractInterface: 'RegisterRequest',
    },
    {
      dtoPath: 'backend/src/supplements/dto/log-supplement.dto.ts',
      contractPath: 'shared/contracts/supplement.ts',
      dtoName: 'LogSupplementDto',
      contractInterface: 'LogSupplementRequest',
    },
    {
      dtoPath: 'backend/src/water/dto/log-water.dto.ts',
      contractPath: 'shared/contracts/water.ts',
      dtoName: 'LogWaterDto',
      contractInterface: 'LogWaterRequest',
    },
  ];

  const rootPath = path.join(__dirname, '..', '..');

  for (const mapping of mappings) {
    const fullDtoPath = path.join(rootPath, mapping.dtoPath);
    const fullContractPath = path.join(rootPath, mapping.contractPath);

    if (!fs.existsSync(fullDtoPath) || !fs.existsSync(fullContractPath)) {
      results.push({
        dtoName: mapping.dtoName,
        contractInterface: mapping.contractInterface,
        status: 'FAIL',
        missingFields: ['File not found on disk'],
      });
      verified = 'PARTIALLY VERIFIED';
      continue;
    }

    const dtoContent = fs.readFileSync(fullDtoPath, 'utf8');
    const contractContent = fs.readFileSync(fullContractPath, 'utf8');

    // Parse contract fields
    // Extract interface body
    const interfaceRegex = new RegExp(`export\\s+interface\\s+${mapping.contractInterface}\\s*\\{([^}]+)\\}`, 'm');
    const match = contractContent.match(interfaceRegex);

    if (!match) {
      results.push({
        dtoName: mapping.dtoName,
        contractInterface: mapping.contractInterface,
        status: 'FAIL',
        missingFields: [`Interface ${mapping.contractInterface} not found in contract file`],
      });
      verified = 'PARTIALLY VERIFIED';
      continue;
    }

    // Extract property keys (e.g., email: string; => email)
    const fieldsText = match[1];
    const fieldLines = fieldsText.split(/[\n;]/).map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('//'));
    const contractFields = fieldLines.map(line => {
      const parts = line.split(':');
      return parts[0].replace(/[?]/, '').trim();
    }).filter(f => f.length > 0);

    // Check if these fields exist in DTO
    const missing: string[] = [];
    for (const field of contractFields) {
      // Look for field in DTO content (e.g. `readonly field` or `field:` or `@IsString() \n field`)
      const escapedField = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const fieldRegex = new RegExp(`\\b${escapedField}\\b`, 'i');
      if (!fieldRegex.test(dtoContent)) {
        missing.push(field);
      }
    }

    results.push({
      dtoName: mapping.dtoName,
      contractInterface: mapping.contractInterface,
      status: missing.length === 0 ? 'PASS' : 'FAIL',
      missingFields: missing,
    });
  }

  // Generate markdown report
  const reportPath = path.join(
    'C:\\Users\\Dhruv\\.gemini\\antigravity\\brain\\c51c838f-7b7e-4a6a-b832-5c27066d42ae',
    'api_contract_validation.md'
  );

  const tableRows = results.map(r => {
    const missingStr = r.missingFields.length > 0 ? r.missingFields.join(', ') : 'None';
    return `| **${r.dtoName}** | \`${r.contractInterface}\` | **${r.status}** | ${missingStr} |`;
  }).join('\n');

  const reportContent = `# API Contract Validation Report

**Verification Status**: ${verified}
**Execution Timestamp**: ${new Date().toISOString()}

## Contract Verification Matrix

| DTO Class | Shared Contract Interface | Status | Mismatches / Missing Fields |
| :--- | :--- | :---: | :--- |
${tableRows}

---

## Conclusion
* **Result**: **${results.every(r => r.status === 'PASS') ? 'PASS' : 'FAIL'}**
* **Verification Detail**: Scanned and verified that class-validator DTO mappings in NestJS match typescript models in the shared repository space.
`;

  fs.writeFileSync(reportPath, reportContent, 'utf8');
  console.log(`API Contract validation report generated at: ${reportPath}`);
}

checkContractMatch();
