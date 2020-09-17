# Load Tableau Summary Data

```js
var objData = {};
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

![Result](https://img-blog.csdnimg.cn/20200912143428563.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0JlcnJ5QkM=,size_16,color_FFFFFF,t_70#pic_center)
