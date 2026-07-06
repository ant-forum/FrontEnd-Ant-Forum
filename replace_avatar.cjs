const fs = require('fs');
const file = 'src/utils/author.js';
const content = fs.readFileSync(file, 'utf8');
fs.writeFileSync(file, content.replace(/"https:\/\/i\.pravatar\.cc\/150\?u=default"/g, '"/src/assets/profile.jpg"'));
console.log('done');
