const fs = require('fs');

const raw = fs.readFileSync('scripts/raw_channels.csv', 'utf8');
const lines = raw.split('\n').filter(l => l.trim().length > 0);

console.log(`Total input lines: ${lines.length}`);

// Check protocols
let httpCount = 0;
let httpsCount = 0;
let ipCount = 0;
let domainCount = 0;

for (const line of lines) {
  const parts = line.split(',');
  const url = parts.slice(1).join(',').trim();
  if (url.startsWith('https://')) httpsCount++;
  else if (url.startsWith('http://')) httpCount++;
  
  if (url.match(/https?:\/\/\d+\.\d+\.\d+\.\d+/)) ipCount++;
  else domainCount++;
}

console.log(`HTTPS URLs: ${httpsCount}`);
console.log(`HTTP URLs: ${httpCount}`);
console.log(`Direct IP URLs: ${ipCount}`);
console.log(`Domain Name URLs: ${domainCount}`);
