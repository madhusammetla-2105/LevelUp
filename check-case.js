import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      results.push(file);
    }
  });
  return results;
}

const allFiles = walk('./src');
const allFilesLower = allFiles.map(f => f.toLowerCase());

let errors = false;

allFiles.forEach(file => {
  if (!file.endsWith('.js') && !file.endsWith('.jsx')) return;
  const content = fs.readFileSync(file, 'utf8');
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath.startsWith('.')) {
      let resolvedPath = path.resolve(path.dirname(file), importPath);
      // Try with common extensions
      const exts = ['', '.js', '.jsx', '.css', '/index.js', '/index.jsx'];
      let foundExact = false;
      let foundLower = false;
      let lowerMatch = '';
      
      for (const ext of exts) {
        const fullPath = resolvedPath + ext;
        if (allFiles.includes(fullPath)) {
          foundExact = true;
          break;
        }
        if (allFilesLower.includes(fullPath.toLowerCase())) {
          foundLower = true;
          lowerMatch = allFiles.find(f => f.toLowerCase() === fullPath.toLowerCase());
        }
      }
      
      if (!foundExact && foundLower) {
        console.error(`Case mismatch in ${file}: importing '${importPath}' which actually maps to ${lowerMatch}`);
        errors = true;
      }
    }
  }
});

if (!errors) {
  console.log("No case mismatches found.");
}
