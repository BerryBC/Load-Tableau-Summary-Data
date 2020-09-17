# Load Tableau Summary Data

```js
objData.tLoadData = new tLoadSD();
var jsonFormated = [
    { wsName: "SK SALES-TTL", valueName: "Measure Values", rowTitle: ["City"] , colTitle: ["Measure Names"] }
  ];

$(function() {
    tableau.extensions.initializeAsync().then(function() {
        objData.tLoadData.loadCfg([], jsonFormated);.
        objData.tLoadData.LoadCol(function() {
            objData.tLoadData.ConvToTable(function() {
                console.log(objData.tLoadData.source);
            });
        });
    };
};

```
