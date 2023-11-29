"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSDK = void 0;
const sdk_1 = require("@cinerino/sdk");
function requireSDK(req, __, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            req.cinerino = {
                service: yield (0, sdk_1.loadService)(),
            };
            next();
        }
        catch (error) {
            next(error);
        }
    });
}
exports.requireSDK = requireSDK;
