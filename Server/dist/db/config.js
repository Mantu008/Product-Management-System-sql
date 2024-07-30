"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("mysql"));
const conn = mysql_1.default.createConnection({
    host: "sql12.freesqldatabase.com",
    user: "sql12722654",
    password: "bANuvZzYGb",
    database: "sql12722654"
});
conn.connect((err) => {
    if (err) {
        console.log("Database Connection Error...");
    }
    else {
        console.log("DataBase Connect SucessFully.....");
    }
});
exports.default = conn;
//# sourceMappingURL=config.js.map