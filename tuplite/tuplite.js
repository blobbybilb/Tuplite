"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TupliteTable = exports.TupliteDB = void 0;
var utils_1 = require("./utils");
var TupliteDB = /** @class */ (function () {
    function TupliteDB(wrapper) {
        this.dbWrapper = wrapper;
    }
    TupliteDB.open = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = TupliteDB.bind;
                        return [4 /*yield*/, (0, utils_1.getCorrectSQLiteWrapper)(path)];
                    case 1: return [2 /*return*/, new (_a.apply(TupliteDB, [void 0, _b.sent()]))()];
                }
            });
        });
    };
    TupliteDB.openWithWrapper = function (wrapper) {
        return new TupliteDB(wrapper);
    };
    TupliteDB.prototype.openTable = function (table) {
        return new TupliteTable(this.dbWrapper, table);
    };
    TupliteDB.prototype.deleteTable = function (table) {
        this.dbWrapper.runQuery("DROP TABLE ".concat(table));
    };
    return TupliteDB;
}());
exports.TupliteDB = TupliteDB;
var TupliteTable = /** @class */ (function () {
    function TupliteTable(dbWrapper, table) {
        this.dbWrapper = dbWrapper;
        this.table = table;
        this.tableExists = this.dbWrapper.tableExists(table);
    }
    TupliteTable.prototype.createTable = function (item) {
        var rowType = (0, utils_1.getRowType)(item);
        var rowItemsString = Object.keys(item).map(function (name, index) { return "".concat(name, " ").concat(rowType[index]); }).join(", ");
        this.dbWrapper.runQuery("CREATE TABLE IF NOT EXISTS ".concat(this.table, " (").concat(rowItemsString, ")"));
        this.tableExists = true;
    };
    TupliteTable.prototype.add = function (item) {
        if (!this.tableExists)
            this.createTable(item);
        var rowNames = Object.keys(item);
        var rowValuesString = Object.values(item).map(function (value) { return typeof value === "string" ? "'".concat(value, "'") : value; }).join(", ");
        var rowNamesString = rowNames.join(", ");
        this.dbWrapper.runQuery("INSERT INTO ".concat(this.table, " (").concat(rowNamesString, ") VALUES (").concat(rowValuesString, ")"));
    };
    TupliteTable.prototype.get = function (query) {
        // query is an object where the keys are the column names
        // and the values can either be a value to match or a function to filter
        if (query === void 0) { query = {}; }
        var queryResult;
        if (Object.values(query).filter(function (value) { return typeof value !== "function"; }).length === 0) {
            queryResult = this.dbWrapper.getAsItems(this.table, "SELECT * FROM ".concat(this.table));
        }
        else {
            var queryKeys = Object.entries(query)
                .filter(function (_a) {
                var _ = _a[0], value = _a[1];
                return typeof value !== "function";
            })
                .map(function (_a) {
                var key = _a[0], _ = _a[1];
                return "".concat(key);
            });
            var queryValuesString = Object.values(query)
                .filter(function (value) { return typeof value !== "function"; })
                .map(function (value) { return typeof value === "string" ? "'".concat(value, "'") : value; }).join(", ");
            var queryKeysString = queryKeys.join(", ");
            queryResult = this.dbWrapper
                .getAsItems(this.table, "SELECT * FROM ".concat(this.table, " WHERE (").concat(queryKeysString, ") = (").concat(queryValuesString, ")"));
        }
        var _loop_1 = function (key, value) {
            if (typeof value === "function") {
                queryResult = queryResult.filter(function (item) { return value(item[key]); });
            }
        };
        for (var _i = 0, _a = Object.entries(query); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            _loop_1(key, value);
        }
        return queryResult;
    };
    TupliteTable.prototype.del = function (item) {
        var queryKeys = Object.keys(item);
        var queryValuesString = Object.values(item).map(function (value) { return typeof value === "string" ? "'".concat(value, "'") : value; }).join(", ");
        if (queryKeys.length === 0) {
            this.dbWrapper.runQuery("DELETE FROM ".concat(this.table));
            return;
        }
        var queryKeysString = queryKeys.join(", ");
        this.dbWrapper.runQuery("DELETE FROM ".concat(this.table, " WHERE ").concat(queryKeysString, " = (").concat(queryValuesString, ")"));
    };
    TupliteTable.prototype.update = function (item, newItem) {
        var oldItems = this.get(item); // TODO ensure this is correct
        this.del(item);
        for (var _i = 0, oldItems_1 = oldItems; _i < oldItems_1.length; _i++) {
            var oldItem = oldItems_1[_i];
            this.add(__assign(__assign({}, oldItem), newItem));
        }
    };
    return TupliteTable;
}());
exports.TupliteTable = TupliteTable;
