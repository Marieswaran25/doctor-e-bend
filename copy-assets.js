const fs = require('fs');
const path = require('path');

const folders = ['templates', 'openapi'];

console.log('Copying assets...');

folders.forEach(folder => {
    const source = path.join(__dirname, 'src', folder);
    const destination = path.join(__dirname, 'dist', folder);

    function copyDir(src, dest) {
        if (!fs.existsSync(src)) {
            console.warn(`Source folder "${src}" does not exist, skipping.`);
            return;
        }
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src, { withFileTypes: true }).forEach(dirent => {
            console.log(`Copying ${dirent.name}`);
            const srcPath = path.join(src, dirent.name);
            const destPath = path.join(dest, dirent.name);
            console.log(`Copying ${srcPath} to ${destPath}`);
            if (dirent.isDirectory()) {
                copyDir(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        });
    }

    copyDir(source, destination);
});

console.log('Assets copied.');