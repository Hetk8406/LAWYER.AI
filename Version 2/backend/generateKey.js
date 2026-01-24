const crypto = require('crypto');

const secretKey = crypto.randomBytes(64).toString('hex');  // 64 bytes, hexadecimal string
console.log(secretKey);
