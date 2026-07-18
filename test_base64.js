const buffer = new Uint8Array([104, 101, 108, 108, 111]).buffer;
let binary = '';
const bytes = new Uint8Array(buffer);
for (let i = 0; i < bytes.byteLength; i++) {
  binary += String.fromCharCode(bytes[i]);
}
console.log(btoa(binary));
