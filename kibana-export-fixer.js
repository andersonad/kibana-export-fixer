//takes 2 arguments: first is output file directory, second is input file
const fs = require("fs");
const path = require("path");
// process.argv.forEach(function (val, index, array) {
//   console.log(index + ': ' + val);
// });

const outputDirectoryPath = process.argv[2];
const jsonFilename = path.basename(process.argv[3]);
const contents = fs.readFileSync(process.argv[3]);
const jsonContent = JSON.parse(contents);
const newContent = jsonContent[0];

newContent._index = ".kibana_{{ FireDepartment.firecares_id }}";
newContent._type = "doc";
newContent._id = ["visualization:",jsonFilename.split('.json')[0]].join('');
const oldSource = newContent._source;
newContent._source = {};
newContent._source.type = "visualization";
newContent._source.visualization = oldSource;
fs.writeFile([outputDirectoryPath,jsonFilename.split('.json')[0],"_fixed.json"].join(''), JSON.stringify(newContent,null,2), (err) => {
  if (err) throw err;
  console.log(['Fixed file output to ', outputDirectoryPath,jsonFilename].join(''));
});
