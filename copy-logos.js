import fs from 'fs';
import path from 'path';

const srcDir = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\7bc50443-09da-4fac-8d00-52a053438df7';
const destDir = path.resolve('public');

const files = {
  'media__1781073141692.png': 'mptc.png',
  'media__1781073149150.png': 'cbrd.png',
  'media__1781073156758.png': 'ant.png'
};

for (const [srcName, destName] of Object.entries(files)) {
  const srcPath = path.join(srcDir, srcName);
  const destPath = path.join(destDir, destName);
  
  try {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Successfully copied ${srcName} to ${destName}`);
  } catch (err) {
    console.error(`Failed to copy ${srcName}:`, err.message);
  }
}
