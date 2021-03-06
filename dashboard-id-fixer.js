//Build a mapping between the IDs of default and "fixed" fixture exports for replacement in dashboard exports
//Script takes 3 arguments:
//output directory
//default export visualizations directory
//input json
const fs = require("fs");
const path = require("path");
const _ = require("lodash");

const outputDirectoryPath = process.argv[2];
const defExportVis = process.argv[3];
const inputFilePath = process.argv[4];
console.dir(outputDirectoryPath);
//console.dir(JSON.parse(contents));

String.prototype.mapReplace = function(map) {
    var regex = [];
    for(var key in map)
        regex.push(key.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"));
    return this.replace(new RegExp(regex.join('|'),"g"),function(word){
        return map[word];
    });
};

//Build the mapping between raw ids and new readable types

const fileList = fs.readdirSync(defExportVis);
const filePaths = fileList.map(i => defExportVis+i)
const repMap = {};
filePaths.forEach(function (element) {
  const content = fs.readFileSync(element);
  const visName = [path.basename(element).split('.json')[0]].join('');
  const cont = JSON.parse(content);
  const jsonContent = cont[0];
  const id = jsonContent._id;
  repMap[id] = visName;
});

//Import the dashboard to be corrected

const dashContent = fs.readFileSync(inputFilePath);
const dashJsonContent = JSON.parse(dashContent)[0];
const newPanelIds = dashJsonContent._source.panelsJSON.mapReplace(repMap);
const newDashContent = dashJsonContent;
newDashContent._source.panelsJSON = newPanelIds;
newDashContent._id = ["dashboard:",path.basename(inputFilePath).split('.json')[0]].join('')
newDashContent._index = "{{ kibana.tenancy }}"
newDashContent._type = "doc"
const oldSource = newDashContent._source;
newDashContent._source = {};
newDashContent._source.type = "dashboard";
newDashContent._source.dashboard = oldSource;
const regex = /\"index\":\".*?\"/g;
newDashContent._source.dashboard.kibanaSavedObjectMeta.searchSourceJSON = _.replace(newDashContent._source.dashboard.kibanaSavedObjectMeta.searchSourceJSON,regex,'\"index\": \"{{ fire_department.es_indices.fire-incident }}\"')
//todo: fix variable names in final call
console.dir(path.normalize(["File written to",[outputDirectoryPath,'/',path.basename(inputFilePath).split('.json')[0],"_fixed.json"].join('')].join(' ')))
fs.writeFileSync(path.normalize([outputDirectoryPath,'/',path.basename(inputFilePath).split('.json')[0],"_fixed.json"].join('')), JSON.stringify(newDashContent,null,2))
