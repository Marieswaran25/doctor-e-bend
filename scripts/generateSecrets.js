const Cipher = require("crypto");

const createSecret = (length = 32) => {
    return Cipher.randomBytes(length).toString("hex");
}

console.log(createSecret(256));
console.log(createSecret(256));