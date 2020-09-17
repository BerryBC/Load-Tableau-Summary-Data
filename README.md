# Load Tableau Summary Data

## Introduction

When using tableau extension, how to convert tableau summary data to 2D array requires complex conversion.

This package can easily merge multiple worksheets with the same dimension into corresponding two-dimensional arrays.



## Use

In the extension:

HTML, first load the tabelau extension plug-in, and then load this plug-in.
```html
...
	<!-- First load the tabelau extension plug-in, and then load this plug-in -->
    <script src="./thirdpt/tableau.extensions.1.4.0.min.js"></script>
	<script src="./secondpt/loadsummarydata.js?t=202009151521"></script>
...

```

----
Load the configuration according to the settings of tableau worksheet. If the configuration of the worksheet is as follows:
![Config](https://img-blog.csdnimg.cn/20200917212409697.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0JlcnJ5QkM=,size_16,color_FFFFFF,t_70#pic_center)
JS code is as follows:

```js
var objData = {};
objData.tLoadData = new tLoadSD();
var jsonFormated = [
    { wsName: "Cat_Sales", valueName: "Measure Values", rowTitle: ["City","State/Province"] , colTitle: ["Sub-Category","Category"] },
    { wsName: "Sales_Gth", valueName: "Measure Values", rowTitle: ["City","State/Province"] , colTitle: ["YEAR(Ship Date)"] }
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

![Haha](https://img-blog.csdnimg.cn/20200823185644776.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0JlcnJ5QkM=,size_16,color_FFFFFF,t_70#pic_center#pic_center)

## How to use it

#### loadCfg(jsonColTitle, arrWS)

- JSON `jsonColTitle` column title and corresponding column number

- Array < JSON > ` arraws ` worksheet



Follow up operations can only be carried out after configuration. The 'arrcoltitle' can not be configured first. If not, the header of each worksheet can be obtained automatically through the function

- Do not configure column header information for the time being
```js
var jsonFormated = [
    { wsName: "Cat_Sales", valueName: "Measure Values", rowTitle: ["City","State/Province"] , colTitle: ["Sub-Category","Category"] },
    { wsName: "Sales_Gth", valueName: "Measure Values", rowTitle: ["City","State/Province"] , colTitle: ["YEAR(Ship Date)"] }
  ];
objData.tLoadData.loadCfg([], jsonFormated);
```

- Configure column header information
```js
var arrForCol={};
objForCol["TOTAL SALES"] = 1;
objForCol["VS. LY%  "] = 2;
objForCol["VS. BUD%"] = 3;
var jsonFormated = [
    { wsName: "Cat_Sales", valueName: "Measure Values", rowTitle: ["City","State/Province"] , colTitle: ["Sub-Category","Category"] },
    { wsName: "Sales_Gth", valueName: "Measure Values", rowTitle: ["City","State/Province"] , colTitle: ["YEAR(Ship Date)"] }
  ];
objData.tLoadData.loadCfg(arrForCol, jsonFormated);
```


#### LoadCol(funCB)
- Function `funCB` Callback function

Get column header
```js
    objData.tLoadData.LoadCol(function() {
    	console.log(objData.tLoadData);
    });
```
![List](https://img-blog.csdnimg.cn/2020091721514652.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0JlcnJ5QkM=,size_16,color_FFFFFF,t_70#pic_center)


#### ConvToTable(funCB)
- Function `funCB` Callback function

Get content value
```js
    objData.tLoadData.ConvToTable(function() {
    	console.log(objData.tLoadData);
    });
```
![Content](https://img-blog.csdnimg.cn/20200917215636341.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0JlcnJ5QkM=,size_16,color_FFFFFF,t_70#pic_center)

#### sortData(intCol,funCB)
- number `intCol` Column position
- Function `funCB` callback function

Global sort based on the data for a specific column.
