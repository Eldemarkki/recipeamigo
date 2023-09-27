const { readFileSync, writeFileSync } = require("fs");

const file = readFileSync("./docs/timelog.md");
const allLines = file.toString().trim().split("\n");
const lines = allLines.filter((line) => /\d{1,2}\.\d{1,2}\.\d{4}/.test(line));
const hours = lines.map((line) => Number(line.split("|")[2].trim()));
const sum = hours.reduce((acc, curr) => acc + curr, 0);

const totalLines = allLines.filter((line) => /Total/.test(line));
const longestLine = Math.max(...lines.map((line) => line.length));

if (totalLines.length === 0) {
  allLines.push(
    `| Total     | ${sum.toString().padEnd(5, " ")} | ${" ".repeat(
      longestLine - 24,
    )} |`,
  );
} else {
  allLines[
    allLines.indexOf(totalLines[totalLines.length - 1])
  ] = `| Total     | ${sum.toString().padEnd(5, " ")} | ${" ".repeat(
    longestLine - 24,
  )} |`;
}
allLines.push("");

const newFile = allLines.join("\n");

writeFileSync("./docs/timelog.md", newFile);
