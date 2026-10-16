const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');

const replacements = [
  // English
  { search: /Burayu City Administration/gi, replace: 'Burayu MESOB' },

  // Afaan Oromo
  { search: /Bulchiinsa Magaalaa Burraayyuu/gi, replace: 'Burraayyuu MESOB' },
  { search: /Bulchiinsa Magaalaa Buraayyuu/gi, replace: 'Buraayyuu MESOB' },

  // Amharic
  { search: /የቡራዩ መሶብ ከተማ አስተዳደር/g, replace: 'የቡራዩ መሶብ' },
  { search: /ቡራዩ መሶብ ከተማ አስተዳደር/g, replace: 'የቡራዩ መሶብ' },
  { search: /የቡራዩ ከተማ አስተዳደር/g, replace: 'የቡራዩ መሶብ' },
  { search: /ቡራዩ ከተማ አስተዳደር/g, replace: 'የቡራዩ መሶብ' },
  { search: /የቡራዩ ክፍለ ከተማ አስተዳደር/g, replace: 'የቡራዩ መሶብ' },
  { search: /ቡራዩ ክፍለ ከተማ አስተዳደር/g, replace: 'የቡራዩ መሶብ' }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (/\.(js|jsx|ts|tsx|json)$/.test(file)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      for (const r of replacements) {
        if (content.match(r.search)) {
          content = content.replace(r.search, r.replace);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(dir);
console.log('Done!');
