"use strict";
const request = require('request');
class Service {
    constructor(wsdl) {
        this.wsdl = wsdl;
    }
    request(url, options, cb) {
        request(url, options, cb);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Service;
