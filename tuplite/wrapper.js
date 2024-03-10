"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLiteWrapper = void 0;
var SQLiteWrapper = /** @class */ (function () {
    function SQLiteWrapper() {
        var _this = this;
        this.tableExists = function (table) { return _this.listTables().includes(table); };
    }
    return SQLiteWrapper;
}());
exports.SQLiteWrapper = SQLiteWrapper;
