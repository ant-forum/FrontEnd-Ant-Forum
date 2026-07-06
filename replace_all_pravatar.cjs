const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src', function(filePath) {
  if (filePath.endsWith('.js') || filePath.endsWith('.vue')) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('pravatar.cc')) {
      const newContent = content.replace(/['"`]https:\/\/i\.pravatar\.cc\/[^'"`]+['"`]/g, '"/src/assets/profile.jpg"');
      fs.writeFileSync(filePath, newContent);
      console.log('Updated ' + filePath);
    }
  }
});
console.log('Done');
