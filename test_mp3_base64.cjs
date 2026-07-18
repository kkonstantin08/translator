const fs = require('fs');
const buffer = fs.readFileSync('test.mp3');
let binary = '';
const bytes = new Uint8Array(buffer);
for (let i = 0; i < bytes.byteLength; i++) {
  binary += String.fromCharCode(bytes[i]);
}
console.log(btoa(binary).substring(0, 50));
