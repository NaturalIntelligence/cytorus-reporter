const fs = require("fs");
const path = require("path");

global.__projRootDir = process.cwd();

const absolute = p => path.join(__projRootDir, p);
const readIfExist = (m,otherwise) => fs.existsSync(m) ? require(m) : otherwise;

module.exports = {
    absolute : absolute,
    readIfExist : readIfExist
}