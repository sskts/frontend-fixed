"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * ErrorModuleテスト
 */
const assert = require("assert");
const sinon = require("sinon");
const logger_1 = require("../../../../app/middlewares/logger");
const ErrorModule = require("../../../../app/modules/Error/ErrorModule");
const ErrorUtilModule = require("../../../../app/modules/Util/ErrorUtilModule");
describe('ErrorModule', () => {
    it('notFoundRender 正常', () => __awaiter(this, void 0, void 0, function* () {
        const req = {};
        const res = {
            locals: {},
            render: sinon.spy(),
            status: () => {
                return res;
            }
        };
        yield ErrorModule.notFoundRender(req, res);
        assert(res.render.calledOnce);
    }));
    it('notFoundRender xhr 正常', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            xhr: true
        };
        const res = {
            locals: {},
            send: sinon.spy(),
            status: () => {
                return res;
            }
        };
        yield ErrorModule.notFoundRender(req, res);
        assert(res.send.calledOnce);
    }));
    it('errorRender 正常', () => __awaiter(this, void 0, void 0, function* () {
        const error = sinon.stub(logger_1.default, 'error').returns({});
        const req = {
            session: {},
            __: () => {
                return '';
            }
        };
        const res = {
            locals: {},
            render: sinon.spy(),
            status: () => {
                return res;
            }
        };
        const errorType = ErrorUtilModule.ErrorType.Access;
        yield ErrorModule.errorRender(new ErrorUtilModule.CustomError(errorType, ''), req, res);
        assert(res.render.calledOnce);
        error.restore();
    }));
    it('errorRender xhr 正常', () => __awaiter(this, void 0, void 0, function* () {
        const error = sinon.stub(logger_1.default, 'error').returns({});
        const req = {
            session: {},
            xhr: true,
            __: () => {
                return '';
            }
        };
        const res = {
            locals: {},
            send: sinon.spy(),
            status: () => {
                return res;
            }
        };
        const errorType = ErrorUtilModule.ErrorType.Access;
        yield ErrorModule.errorRender(new ErrorUtilModule.CustomError(errorType, ''), req, res);
        assert(res.send.calledOnce);
        error.restore();
    }));
});
