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
 * UtilModuleテスト
 *
 * @ignore
 */
const assert = require("assert");
const UtilModule = require("../../../apps/frontend/modules/Util/UtilModule");
describe('UtilModule.timeFormat', () => {
    it('正常', () => __awaiter(this, void 0, void 0, function* () {
        const str = UtilModule.timeFormat('0101');
        assert.equal(str, '01:01');
    }));
});
describe('UtilModule.escapeHtml', () => {
    it('正常', () => __awaiter(this, void 0, void 0, function* () {
        const str = UtilModule.escapeHtml('<script>alert(123)</script>');
        assert.equal(str, '&lt;script&gt;alert(123)&lt;/script&gt;');
    }));
});
describe('UtilModule.formatPrice', () => {
    it('正常', () => __awaiter(this, void 0, void 0, function* () {
        const num = 10000;
        const price = UtilModule.formatPrice(num);
        assert.equal(price, '10,000');
    }));
});
describe('UtilModule.getPerformanceId', () => {
    it('正常', () => __awaiter(this, void 0, void 0, function* () {
        const id = UtilModule.getPerformanceId({
            theaterCode: '118',
            day: '20170329',
            titleCode: '16221',
            titleBranchNum: '0',
            screenCode: '10',
            timeBegin: '1230'
        });
        assert.equal(id, '11820170329162210101230');
    }));
});
describe('UtilModule.bace64Encode', () => {
    it('正常', () => __awaiter(this, void 0, void 0, function* () {
        const str = UtilModule.bace64Encode('テスト');
        assert.equal(str, '44OG44K544OI');
    }));
});
describe('UtilModule.base64Decode', () => {
    it('正常', () => __awaiter(this, void 0, void 0, function* () {
        const str = UtilModule.base64Decode('44OG44K544OI');
        assert.equal(str, 'テスト');
    }));
});
