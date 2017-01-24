"use strict";
class ExtError extends Error {
    constructor(message, type) {
        super(message);
        this.type = (type) ? type : type;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ExtError;
