const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');

const textReplacements = [
  // 1. Dark neutral text -> Brand Black
  { search: /text-slate-950/g, replace: 'text-[#070707]' },
  { search: /text-slate-900/g, replace: 'text-[#070707]' },
  { search: /text-slate-800/g, replace: 'text-[#070707]' },
  { search: /text-slate-700/g, replace: 'text-[#070707]' },
  { search: /text-neutral-900/g, replace: 'text-[#070707]' },
  { search: /text-neutral-800/g, replace: 'text-[#070707]' },
  { search: /text-neutral-700/g, replace: 'text-[#070707]' },
  { search: /text-gray-900/g, replace: 'text-[#070707]' },
  { search: /text-gray-800/g, replace: 'text-[#070707]' },
  { search: /text-gray-700/g, replace: 'text-[#070707]' },
  { search: /text-\[\#17221B\]/g, replace: 'text-[#070707]' },
  { search: /text-\[\#141413\]/g, replace: 'text-[#070707]' },
  { search: /text-\[\#1F2933\]/g, replace: 'text-[#070707]' },
  { search: /text-black/g, replace: 'text-[#070707]' },

  // 2. Blue links -> Brand Red
  { search: /text-blue-600/g, replace: 'text-[#FE0002]' },
  { search: /text-blue-700/g, replace: 'text-[#FE0002]' },
  { search: /hover:text-blue-600/g, replace: 'hover:text-[#070707]' },
  { search: /hover:text-blue-700/g, replace: 'hover:text-[#070707]' },

  // 3. Rose/Red errors/highlights -> Brand Red
  { search: /text-rose-400/g, replace: 'text-[#FE0002]' },
  { search: /text-rose-500/g, replace: 'text-[#FE0002]' },
  { search: /text-rose-600/g, replace: 'text-[#FE0002]' },
  { search: /text-rose-700/g, replace: 'text-[#FE0002]' },
  { search: /hover:text-rose-600/g, replace: 'hover:text-[#070707]' },
  { search: /hover:text-rose-700/g, replace: 'hover:text-[#070707]' },
  { search: /text-\[\#C8102E\]/g, replace: 'text-[#FE0002]' },
  { search: /decoration-\[\#C8102E\]/g, replace: 'decoration-[#FE0002]' },
  
  // 4. Old Green highlights -> Brand Red
  { search: /text-\[\#176B3A\]/g, replace: 'text-[#FE0002]' }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Skip the BackToTop component because we hand-crafted it and don't want to mess it up
      if (file === 'BackToTop.js') continue;

      let modified = false;
      for (const r of textReplacements) {
        if (content.match(r.search)) {
          content = content.replace(r.search, r.replace);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated text colors in: ${fullPath}`);
      }
    }
  }
}

processDirectory(dir);
console.log('Done replacing text colors!');
