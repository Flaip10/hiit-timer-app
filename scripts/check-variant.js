#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const BASE_ID = 'dev.filipemendes.arctimer';
const VARIANTS = {
  production:  { id: BASE_ID,                regenCmd: 'npm run native:generate' },
  development: { id: `${BASE_ID}.dev`,       regenCmd: 'npm run native:generate:dev' },
  preview:     { id: `${BASE_ID}.preview`,   regenCmd: 'npm run native:generate:preview' },
};

const target = process.argv[2] ?? 'production';
if (!VARIANTS[target]) {
  console.error(`[guard] Unknown variant "${target}". Expected: ${Object.keys(VARIANTS).join(', ')}.`);
  process.exit(2);
}
const { id: EXPECTED_ID, regenCmd } = VARIANTS[target];
const errors = [];

const iosDir = path.join(__dirname, '..', 'ios');
if (fs.existsSync(iosDir)) {
  const pbxFiles = fs.readdirSync(iosDir)
    .filter((f) => f.endsWith('.xcodeproj'))
    .map((f) => path.join(iosDir, f, 'project.pbxproj'));
  for (const pbx of pbxFiles) {
    const content = fs.readFileSync(pbx, 'utf8');
    const ids = [...content.matchAll(/PRODUCT_BUNDLE_IDENTIFIER = ([^;]+);/g)]
      .map((m) => m[1].trim().replace(/^"|"$/g, ''));
    const bad = ids.filter((id) => id && id !== EXPECTED_ID);
    if (bad.length) {
      errors.push(
        `iOS bundle id is "${bad[0]}" (expected "${EXPECTED_ID}"). Run: ${regenCmd}`
      );
    }
  }
}

const gradle = path.join(__dirname, '..', 'android', 'app', 'build.gradle');
if (fs.existsSync(gradle)) {
  const content = fs.readFileSync(gradle, 'utf8');
  const m = content.match(/applicationId\s+['"]([^'"]+)['"]/);
  if (m && m[1] !== EXPECTED_ID) {
    errors.push(
      `Android applicationId is "${m[1]}" (expected "${EXPECTED_ID}"). Run: ${regenCmd}`
    );
  }
}

if (errors.length) {
  console.error(
    `\n[guard:${target}-variant] FAILED:\n` +
      errors.map((e) => '  • ' + e).join('\n') +
      '\n'
  );
  process.exit(1);
}
console.log(`[guard:${target}-variant] OK — native projects are on the ${target} variant.`);
