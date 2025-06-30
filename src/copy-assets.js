const fs = require('fs');
const path = require('path');

const folders = ['templates'];

folders.forEach(folder => {
    const source = path.join(__dirname, folder);
    const destination = path.join(__dirname, '..', 'dist', folder);

    // Recursively copy function
    function copyDir(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src, { withFileTypes: true }).forEach(dirent => {
            const srcPath = path.join(src, dirent.name);
            const destPath = path.join(dest, dirent.name);
            if (dirent.isDirectory()) {
                copyDir(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        });
    }

    copyDir(source, destination);
});
