const { readFileSync, writeFileSync } = require("fs");

const file = readFileSync("./tuntikirjanpito.md");
const allLines = file.toString().trim().split("\n");
const lines = allLines.filter((line) => /\d{1,2}\.\d{1,2}\.\d{4}/.test(line));
const hours = lines.map((line) => Number(line.split("|")[2].trim()));
const sum = hours.reduce((acc, curr) => acc + curr, 0);

const yhteensaLines = allLines.filter((line) => /Yhteensä/.test(line));
const longestLine = Math.max(...lines.map((line) => line.length));

if (yhteensaLines.length === 0) {
  allLines.push(
    `| Yhteensä  | ${sum.toString().padEnd(6, " ")} | ${" ".repeat(
      longestLine - 25,
    )} |`,
  );
} else {
  allLines[
    allLines.indexOf(yhteensaLines[yhteensaLines.length - 1])
  ] = `| Yhteensä  | ${sum.toString().padEnd(6, " ")} | ${" ".repeat(
    longestLine - 25,
  )} |`;
}
allLines.push("");

const newFile = allLines.join("\n");

writeFileSync("./tuntikirjanpito.md", newFile);
