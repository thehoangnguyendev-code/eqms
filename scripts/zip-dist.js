import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const zipName = 'dist.zip';
const distDir = 'dist';

// Check if dist exists
if (!fs.existsSync(distDir)) {
  console.error(`Error: "${distDir}" folder not found. Run "npm run build" first.`);
  process.exit(1);
}

// Remove old zip if exists
if (fs.existsSync(zipName)) {
  try {
    fs.unlinkSync(zipName);
    console.log(`\x1b[33mRemoved existing ${zipName}\x1b[0m`);
  } catch (e) {
    console.error(`Warning: Could not remove old ${zipName}. It might be in use.`);
  }
}

console.log(`Zipping "${distDir}" to "${zipName}"...`);

try {
  if (process.platform === 'win32') {
    // Windows PowerShell
    execSync(`powershell -command "Compress-Archive -Path ${distDir}\\* -DestinationPath ${zipName} -Force"`);
  } else {
    // Linux/Mac
    execSync(`zip -r ${zipName} ${distDir}`);
  }
  console.log(`\x1b[32mSuccessfully created ${zipName}\x1b[0m`);
} catch (error) {
  console.error('Failed to zip:', error.message);
  process.exit(1);
}
