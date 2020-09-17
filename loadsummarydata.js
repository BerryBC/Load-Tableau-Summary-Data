/*
 * @Descripttion: Convert tableau summary data turn to data table
 * @Author: BerryBC
 * @Date: 2020-09-14 21:02:34
 * @LastEditors: BerryBC
 * @LastEditTime: 2020-09-16 20:13:12
 * @Version: 1.3
 */

// 定义一个构造函数
function tLoadSD() {
    // -----------------------------
    // --------初始化变量------------
    // -----------------------------
    // 所有数据的存放位置
    this.source = [];
    // 定义一个字典对象，以匹配 Tableau 上读取数据时的行标题
    this.dimToRow = {};
    // 定义排序状态
    this.sortAD = 2;
    // 定义排序状态
    this.sortInt = 1;
    // 当前列数
    this.nowColNum = 1;
    // 最大列数
    this.maxColNum = 1;


    // -----------------------------------
    // --------匹配初始化输入变量-----------
    // -----------------------------------
    // 定义 Worksheet 的列队
    this.wsCfg = [];
    // 定义有多少张 Workbook 已经读取完
    this.checkWorksheetOK = [];
    // Workbook 中列对应 内存中数据表 的列数
    this.colMap = {};
    // Workbook 中列对应 内存中数据表 的列数
    this.colTitle = [];

    // -----------------------------
    // --------定义函数--------------
    // -----------------------------

    this.loadCfg = function(arrColTitle, arrWS) {
        // 定义 Worksheet 的列队
        this.wsCfg = arrWS;
        // 定义有多少张 Workbook 已经读取完
        this.checkWorksheetOK = Array(this.wsCfg.length).fill(false);
        // Workbook 中列对应 内存中数据表 的列数
        this.colMap = arrColTitle;
        // 读取最大列数
        this.maxColNum = Object.keys(arrColTitle).length + 1;
        // 把 Dict 内容放到 Columns 列表
        var arrKeys = Object.keys(arrColTitle);
        var arrVals = Object.values(arrColTitle);
        for (var intI = 0; intI < arrVals.length; intI++) {
            this.colTitle[arrVals[intI] - 1] = arrKeys[intI];
        };
    };


    /**
     * @name: initMySelf
     * @msg: 定义放空自我的函数
     */
    this.initMySelf = function() {
        this.source = [];
        this.dimToRow = {};
        this.nowColNum = 1;
        this.checkWorksheetOK = Array(this.wsCfg.length).fill(false);
    };


    /**
     * @name: creatNewWS
     * @msg: 返回一个空的 WorkSheet 配置表
     * @return {JSON} 
     *          {
     *              wsName: string Worksheet 名字,
     *              rowTitle: Array 行标题别名,
     *              colTitle: Array 列标题别名,
     *              valueName: string 值标题名字
     *          }
     */
    this.creatNewWS = function() {
        var objNewWSCfg = {};
        objNewWSCfg.wsName = "";
        objNewWSCfg.rowTitle = [];
        objNewWSCfg.colTitle = [];
        objNewWSCfg.valueName = "";
        return objNewWSCfg;
    };



    /**
     * @name: sortData
     * @msg: 对数据进行排序
     * @param {number} intCol 需要处理的列
     * @param {Function} funCB Callback 函数
     */
    this.sortData = function(intCol, funCB) {
        console.log(intCol);
        this.sortAD++;
        this.sortAD = this.sortAD % 3;
        // 判断当前是升序还是降序
        if (this.sortAD == 1) {
            // 定义排序函数
            function forDataSort(a, b) {
                var dblA = a[intCol];
                var dblB = b[intCol];
                if (typeof(dblA) == "undefined") {
                    dblA = 0;
                };
                if (typeof(dblB) == "undefined") {
                    dblB = 0;
                };
                return dblA - dblB;
            };
            this.source.sort(forDataSort);
        } else if (this.sortAD == 0) {
            function forDataSort(a, b) {
                var dblA = a[intCol];
                var dblB = b[intCol];
                if (typeof(dblA) == "undefined") {
                    dblA = 0.000001;
                };
                if (typeof(dblB) == "undefined") {
                    dblB = 0.000001;
                };
                return dblB - dblA;
            };
            this.source.sort(forDataSort);
        } else {
            if (typeof(this.source[0][0]) == "number") {
                function forDataSort(a, b) {
                    var dblA = a[0];
                    var dblB = b[0];
                    if (typeof(dblA) == "undefined") {
                        dblA = 0.000001;
                    };
                    if (typeof(dblB) == "undefined") {
                        dblB = 0.000001;
                    };
                    return dblA - dblB;
                };
                this.source.sort(forDataSort);
            } else {
                this.source.sort(function(a, b) { return a[0].localeCompare(b[0]) });
            };
        };
        // 如果当前是升序,则下一次点击时降序
        funCB();
    };


    /**
     * @name: funFixReservedWords
     * @msg: 对不同语言保留字的匹配
     * @param {string} strTitle 输入行列标题
     * @return {string} 返回统一后的关键字 
     */
    function funFixReservedWords(strTitle) {
        var strReturn = strTitle;
        var arrMN = ["measure names", "度量名称", "度量名稱"];
        var arrMV = ["measure values", "度量值", "度量值"];
        if (arrMN.indexOf(strTitle) >= 0) {
            strReturn = "measure names";
        };
        if (arrMV.indexOf(strTitle) >= 0) {
            strReturn = "measure values";
        };
        return strReturn;
    };



    /**
     * @name: funLoadDataFromWorksheet
     * @msg: 从 Tableau 工作表获取信息变为 真·数组 形式
     * @param {string}  strWorksheetName 工作表名字
     * @param {string}  strValueField 值的字段名
     * @param {Array <string>}  arrRowField 行标题字段名
     * @param {Array <string>}  arrColField 行标题字段名
     * @param {Function}  funCB callback 函数
     */
    function funLoadDataFromWorksheet(that, strWorksheetName, strValueField, arrRowField, arrColField, intNowWS, funCB) {
        // 读取工作薄信息(工作薄处理完的信息 - getSummaryDataAsync() 函数)
        tableau.extensions.dashboardContent.dashboard.worksheets.find(function(w) { if (w.name === strWorksheetName) { return true; }; }).getSummaryDataAsync().then(function(worksheetData) {
            // 值所在的 Tableau 原始 Data 中的数组位置
            var arrIntDim = [];
            var arrIntCol = [];
            var intVal = 0;


            // 因不同语言的 Tableau 字段会不同，所以需要使用函数把不同语言的预留字段统一，并进行小写处理
            var strValueName = funFixReservedWords(strValueField.toLowerCase());
            // 循环读取每个列字段名

            // 此处进行列标题维度汇总
            for (var intJ = 0; intJ < arrRowField.length; intJ++) {
                for (var intI = 0; intI < worksheetData.columns.length; intI++) {
                    // 因不同语言的 Tableau 字段会不同，所以需要使用函数把不同语言的预留字段统一，并进行小写处理
                    var strNowColName = funFixReservedWords(worksheetData.columns[intI].fieldName.toLowerCase());
                    var strShowRowName = funFixReservedWords(arrRowField[intJ].toLowerCase());
                    if (strNowColName == strShowRowName) {
                        arrIntDim.push(intI);
                    };
                };
            };


            // 此处进行列标题维度汇总
            for (var intJ = 0; intJ < arrColField.length; intJ++) {
                for (var intI = 0; intI < worksheetData.columns.length; intI++) {
                    // 因不同语言的 Tableau 字段会不同，所以需要使用函数把不同语言的预留字段统一，并进行小写处理
                    var strNowColName = funFixReservedWords(worksheetData.columns[intI].fieldName.toLowerCase());
                    var strShowColName = funFixReservedWords(arrColField[intJ].toLowerCase());
                    if (strNowColName == strShowColName) {
                        arrIntCol.push(intI);
                    };
                };
            };

            for (var intI = 0; intI < worksheetData.columns.length; intI++) {
                // 因不同语言的 Tableau 字段会不同，所以需要使用函数把不同语言的预留字段统一，并进行小写处理
                var strNowColName = funFixReservedWords(worksheetData.columns[intI].fieldName.toLowerCase());
                // 此处进行值的位置查询
                if (strNowColName == strValueName) {
                    intVal = intI;
                };
            };

            // 对每个值进行查询处理
            for (var intI = 0; intI < worksheetData.data.length; intI++) {
                // 读取每一颗数据
                var eleRow = worksheetData.data[intI];
                // 读取行标题，行标题必须使用 FromattedValue ，不然用户自定义的 “别名” 无法生效

                var strRow = "";
                var arrRow = [];
                // 列标题位置查找
                for (var intJ = 0; intJ < arrIntDim.length; intJ++) {
                    arrRow.push(eleRow[arrIntDim[intJ]].formattedValue);
                };
                strRow = arrRow.join("-");

                var strCol = "";
                var arrCol = [];
                // 列标题位置查找
                for (var intJ = 0; intJ < arrIntCol.length; intJ++) {
                    arrCol.push(eleRow[arrIntCol[intJ]].formattedValue);
                };
                strCol = arrCol.join("-");


                // 读取当前数据行的数据
                var dblVal = eleRow[intVal].value;

                // 如果前期未存在该行标题
                if (typeof(that.dimToRow[strRow]) == "undefined") {
                    var intNowStore = that.source.length;
                    // 创建空白行数据
                    var arrNewStoreInfo = new Array(that.colMap.length);
                    // 行标题先存入
                    arrNewStoreInfo[0] = strRow;
                    // 把行标题跟存放在数组中的数据存入字典
                    that.dimToRow[strRow] = intNowStore;
                    // 存入数据
                    that.source.push(arrNewStoreInfo);
                };
                // Tableau 中 空数据 为 null 字符，改为 undefined
                if (dblVal == "%null%") {
                    dblVal = undefined;
                };

                if (typeof(that.colMap[strCol]) != "undefined") {
                    // 存入数据值
                    that.source[that.dimToRow[strRow]][that.colMap[strCol]] = dblVal;
                };
            };
            // 回调函数
            funCheckToList(that, intNowWS, funCB);
        });
    };


    /**
     * @name: funCheckToList
     * @msg: 检查是否已经读取完所有工作薄的内容
     * @param {number} intWS 第几个 Worksheet
     * @param {Function} funCB 回调函数
     */
    function funCheckToList(that, intWS, funCB) {
        var bolAllOK = true;
        that.checkWorksheetOK[intWS] = true;
        // 有一个工作薄未读取完均继续等待
        for (var intI = 0; intI < that.checkWorksheetOK.length; intI++) {
            bolAllOK = bolAllOK && that.checkWorksheetOK[intI];
        };
        if (bolAllOK) {
            funCB();
        };
    };

    /**
     * @name: ConvToTable
     * @msg: 开始转换数据
     * @param {Function} funCB 回调函数
     */
    this.ConvToTable = function(funCB) {
        var that = this;
        this.initMySelf();
        for (var intK = 0; intK < that.wsCfg.length; intK++) {
            funLoadDataFromWorksheet(that, that.wsCfg[intK].wsName, that.wsCfg[intK].valueName, that.wsCfg[intK].rowTitle, that.wsCfg[intK].colTitle, intK, funCB);
        };
    };


    this.LoadCol = function(funCB) {
        var that = this;
        // 清空行标题
        that.colMap = {};
        that.colTitle = [];
        that.maxColNum = 1;
        that.initMySelf();
        for (var intK = 0; intK < that.wsCfg.length; intK++) {
            funLoadColFromWorksheet(that, that.wsCfg[intK].wsName, that.wsCfg[intK].colTitle, intK, function() {
                // 设置最大列数
                that.maxColNum = that.colTitle.length + 1;
                funCB();
            })
        };
    };


    /**
     * @name: funLoadColFromWorksheet
     * @msg: 从 Tableau 工作表获取各行标题
     * @param {string}  strWorksheetName 工作表名字
     * @param {Array <string>}  arrColField 行标题字段名
     * @param {Function}  funCB callback 函数
     */
    function funLoadColFromWorksheet(that, strWorksheetName, arrColField, intNowWS, funCB) {
        tableau.extensions.dashboardContent.dashboard.worksheets.find(w => w.name === strWorksheetName).getSummaryDataAsync().then(function(worksheetData) {
            var arrTotalTitle = [];

            for (var intJ = 0; intJ < worksheetData.data.length; intJ++) {
                var arrRaw = [];
                for (var intI = 0; intI < arrColField.length; intI++) {
                    var intField = worksheetData.columns.find(function(column) { return column.fieldName == arrColField[intI] }).index;
                    arrRaw.push(worksheetData.data[intJ][intField].formattedValue);
                };
                arrTotalTitle.push(arrRaw.join("-"));
            };

            var arrUnique = arrTotalTitle.filter(function(el, i, arr) { return arr.indexOf(el) === i });

            for (let intI = 0; intI < arrUnique.length; intI++) {
                that.colMap[arrUnique[intI].toString()] = that.nowColNum;
                that.colTitle.push(arrUnique[intI].toString());
                that.nowColNum++;

            };

            // 回调函数
            funCheckToList(that, intNowWS, funCB);
        });
    };



    // 祈愿之前，请放空自我
    this.initMySelf();
};