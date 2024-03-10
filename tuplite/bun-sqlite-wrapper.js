"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BunSQLite = void 0;
var wrapper_1 = require("./wrapper");
var bun_sqlite_1 = require("bun:sqlite");
var BunSQLite = /** @class */ (function (_super) {
    __extends(BunSQLite, _super);
    function BunSQLite(path) {
        var _this = _super.call(this) || this;
        _this.tableExists = function (table) {
            return _this.db.query("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table) ? true : false;
        };
        _this.dbPath = path !== null && path !== void 0 ? path : ":memory:";
        _this.db = new bun_sqlite_1.Database(_this.dbPath, { create: true });
        _this.db.exec("PRAGMA journal_mode = WAL;");
        return _this;
    }
    BunSQLite.prototype.runQuery = function (sql) {
        this.db.query(sql).run();
    };
    BunSQLite.prototype.listTables = function () {
        return this.db.query("SELECT name FROM sqlite_master WHERE type='table'").all().map(function (e) { return e.name; });
    };
    BunSQLite.prototype.getAsItems = function (table, query) {
        return this.db.query(query).all();
    };
    return BunSQLite;
}(wrapper_1.SQLiteWrapper));
exports.BunSQLite = BunSQLite;
