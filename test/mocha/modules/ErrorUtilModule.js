"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ErrorUtilModuleテスト
 *
 * @ignore
 */
const assert = require("assert");
const locales_1 = require("../../../apps/frontend/middlewares/locales");
const ErrorUtilModule = require("../../../apps/frontend/modules/Util/ErrorUtilModule");
describe('UtilModule.timeFormat', () => {
    it('正常', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            __: locales_1.default.__,
            __n: locales_1.default.__n
        };
        let err = ErrorUtilModule.getError(req, ErrorUtilModule.ERROR_PROPERTY);
        assert.equal(err.message, 'お手続きの途中でエラーが発生いたしました。<br>お手数をおかけいたしますが、もう一度最初から操作をお願いいたします。');
        err = ErrorUtilModule.getError(req, ErrorUtilModule.ERROR_ACCESS);
        assert.equal(err.message, 'お手続きの途中でエラーが発生いたしました。<br>お手数をおかけいたしますが、もう一度最初から操作をお願いいたします。');
        err = ErrorUtilModule.getError(req, ErrorUtilModule.ERROR_VALIDATION);
        assert.equal(err.message, 'お手続きの途中でエラーが発生いたしました。<br>お手数をおかけいたしますが、もう一度最初から操作をお願いいたします。');
        err = ErrorUtilModule.getError(req, ErrorUtilModule.ERROR_EXPIRE);
        assert.equal(err.message, 'お手続きの有効期限がきれました。<br>お手数をおかけいたしますが、もう一度最初から操作をお願いいたします。');
    }));
});
