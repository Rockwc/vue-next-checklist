const glob = require("glob");
const fs = require("fs");
const path = require("path");
const policy = require("../policy.json");

const chalk = require("chalk");
const escapeRegExp = require("./escapeRegExp");

function matchLine(line, report, lineNo = 0) {
  policy.forEach((rule) => {
    const reg = new RegExp(rule.keyword);
    // const reg = new RegExp(escapeRegExp(rule.keyword));
    const isMatch = line.match(reg);
    if (isMatch) {
      report(lineNo, line, rule);
    }
  });
}

function report(lineNo, line, rule) {
  console.log(chalk.green(`  ${lineNo}:${line}`));
  if(rule.level === 'error'){
    console.log(chalk.red(`  +\t${rule.level}\t${rule.message}`));
  }else {
    console.log(chalk.yellow(`  +\t${rule.level}\t${rule.message}`));
  }
 
  if (rule.reference instanceof Array) {
    rule.reference.forEach((v) => {
      console.log(`  |Reference:\t${v}`);
    });
  } else {
    console.log(`  |Reference:\t${rule.reference}`);
  }
}

module.exports.run = (scanPath = path.resolve("."), pattern = ".{vue,js}") => {
  const list = glob.sync(`${scanPath}/**/*${pattern}`);
  list
    .filter((file) => file.indexOf("node_modules") === -1)
    .forEach((file) => {
      console.log(`Scan: ${path.relative(scanPath, file)}`);
      const source = fs.readFileSync(file).toString();
      const lines = source.split("\n");
      lines.forEach((line, i) => matchLine(line, report, i + 1));
    });
};
module.exports.matchLine = matchLine;
