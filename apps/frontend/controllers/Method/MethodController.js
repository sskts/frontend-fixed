"use strict";
const BaseController_1 = require("../BaseController");
class MethodController extends BaseController_1.default {
    ticketing() {
        return this.res.render('method/ticketing');
    }
    entry() {
        return this.res.render('method/entry');
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MethodController;
