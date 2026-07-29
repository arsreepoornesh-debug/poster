const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'assets', 'images');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// Transparent 1x1 pixel PNG
const buf = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

for (let i = 1; i <= 8; i++) {
    fs.writeFileSync(path.join(dir, `hero-${i}.png`), buf);
}
console.log("Placeholder images created successfully");
