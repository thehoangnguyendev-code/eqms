import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const zipName = 'dist.zip';
const distDir = 'dist';

// Check if dist exists
if (!fs.existsSync(distDir)) {
  console.error(`Error: "${distDir}" folder not found. Please run "npm run build" first.`);
  process.exit(1);
}

// ALWAYS DELETE THE OLD ZIP FIRST
if (fs.existsSync(zipName)) {
  console.log(`Removing existing ${zipName}...`);
  fs.unlinkSync(zipName);
}

console.log(`Creating fresh ${zipName} at root (together with "${distDir}" folder)...`);

try {
  if (process.platform === 'win32') {
    // Windows PowerShell - Use full path to avoid ambiguity
    // -Path ${distDir}\\* means zipping contents of dist
    // -DestinationPath ${zipName} puts it in current working directory (root)
    execSync(`powershell -command "Compress-Archive -Path ${distDir} -DestinationPath ${zipName} -Update"`, { stdio: 'inherit' });
  } else {
    // Linux/Mac
    execSync(`zip -r ${zipName} ${distDir}`, { stdio: 'inherit' });
  }
  console.log(`\x1b[32mSuccessfully archived ${distDir} to ${zipName}\x1b[0m`);
} catch (error) {
  console.error('Archive operation failed:', error.message);
  process.exit(1);
}
