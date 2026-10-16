const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');
const textClasses = new Set();

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(/text-[a-zA-Z0-9-\[\]#]+/g);
      if (matches) {
        matches.forEach(m => textClasses.add(m));
      }
    }
  }
}

processDirectory(dir);
console.log(Array.from(textClasses).sort().join('\n'));
