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
 * Error.ErrorModuleテスト
 */
const sasaki = require("@motionpicture/sskts-api-nodejs-client");
const assert = require("assert");
const HTTPStatus = require("http-status");
const sinon = require("sinon");
const logger_1 = require("../../../../app/middlewares/logger");
const ErrorModule = require("../../../../app/modules/Error/ErrorModule");
const ErrorUtilModule_1 = require("../../../../app/modules/Util/ErrorUtilModule");
describe('Error.ErrorModule', () => {
    it('notFoundRender 正常', () => __awaiter(this, void 0, void 0, function* () {
        const req = {};
        const res = {
            locals: {},
            render: sinon.spy(),
            status: () => {
                return res;
            }
        };
        const next = (err) => {
            throw err.massage;
        };
        yield ErrorModule.notFoundRender(req, res, next);
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
        const next = (err) => {
            throw err.massage;
        };
        yield ErrorModule.notFoundRender(req, res, next);
        assert(res.send.calledOnce);
    }));
    it('errorRender APPエラー Property', () => __awaiter(this, void 0, void 0, function* () {
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
        const next = (err) => {
            throw err.massage;
        };
        const errorType = ErrorUtilModule_1.ErrorType.Property;
        yield ErrorModule.errorRender(new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, errorType), req, res, next);
        assert(res.render.calledOnce);
        error.restore();
    }));
    it('errorRender APPエラー Access', () => __awaiter(this, void 0, void 0, function* () {
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
        const next = (err) => {
            throw err.massage;
        };
        const errorType = ErrorUtilModule_1.ErrorType.Access;
        yield ErrorModule.errorRender(new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, errorType), req, res, next);
        assert(res.render.calledOnce);
        error.restore();
    }));
    it('errorRender APPエラー Validation', () => __awaiter(this, void 0, void 0, function* () {
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
        const next = (err) => {
            throw err.massage;
        };
        const errorType = ErrorUtilModule_1.ErrorType.Validation;
        yield ErrorModule.errorRender(new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, errorType), req, res, next);
        assert(res.render.calledOnce);
        error.restore();
    }));
    it('errorRender APPエラー Expire', () => __awaiter(this, void 0, void 0, function* () {
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
        const next = (err) => {
            throw err.massage;
        };
        const errorType = ErrorUtilModule_1.ErrorType.Expire;
        yield ErrorModule.errorRender(new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, errorType), req, res, next);
        assert(res.render.calledOnce);
        error.restore();
    }));
    it('errorRender APPエラー ExternalModule', () => __awaiter(this, void 0, void 0, function* () {
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
        const next = (err) => {
            throw err.massage;
        };
        const errorType = ErrorUtilModule_1.ErrorType.ExternalModule;
        yield ErrorModule.errorRender(new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, errorType), req, res, next);
        assert(res.render.calledOnce);
        error.restore();
    }));
    it('errorRender APIエラー BAD_REQUEST', () => __awaiter(this, void 0, void 0, function* () {
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
        const next = (err) => {
            throw err.massage;
        };
        const requestError = new sasaki.transporters.RequestError();
        requestError.errors = [];
        requestError.code = HTTPStatus.BAD_REQUEST;
        yield ErrorModule.errorRender(requestError, req, res, next);
        assert(res.render.calledOnce);
        error.restore();
    }));
    it('errorRender APIエラー UNAUTHORIZED', () => __awaiter(this, void 0, void 0, function* () {
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
        const next = (err) => {
            throw err.massage;
        };
        const requestError = new sasaki.transporters.RequestError();
        requestError.errors = [];
        requestError.code = HTTPStatus.UNAUTHORIZED;
        yield ErrorModule.errorRender(requestError, req, res, next);
        assert(res.render.calledOnce);
        error.restore();
    }));
    it('errorRender APIエラー FORBIDDEN', () => __awaiter(this, void 0, void 0, function* () {
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
        const next = (err) => {
            throw err.massage;
        };
        const requestError = new sasaki.transporters.RequestError();
        requestError.errors = [];
        requestError.code = HTTPStatus.FORBIDDEN;
        yield ErrorModule.errorRender(requestError, req, res, next);
        assert(res.render.calledOnce);
        error.restore();
    }));
    it('errorRender APIエラー NOT_FOUND', () => __awaiter(this, void 0, void 0, function* () {
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
        const next = (err) => {
            throw err.massage;
        };
        const requestError = new sasaki.transporters.RequestError();
        requestError.errors = [];
        requestError.code = HTTPStatus.NOT_FOUND;
        yield ErrorModule.errorRender(requestError, req, res, next);
        assert(res.render.calledOnce);
        error.restore();
    }));
    it('errorRender APIエラー INTERNAL_SERVER_ERROR', () => __awaiter(this, void 0, void 0, function* () {
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
        const next = (err) => {
            throw err.massage;
        };
        const requestError = new sasaki.transporters.RequestError();
        requestError.errors = [];
        requestError.code = HTTPStatus.INTERNAL_SERVER_ERROR;
        yield ErrorModule.errorRender(requestError, req, res, next);
        assert(res.render.calledOnce);
        error.restore();
    }));
    it('errorRender APIエラー SERVICE_UNAVAILABLE', () => __awaiter(this, void 0, void 0, function* () {
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
        const next = (err) => {
            throw err.massage;
        };
        const requestError = new sasaki.transporters.RequestError();
        requestError.errors = [];
        requestError.code = HTTPStatus.SERVICE_UNAVAILABLE;
        yield ErrorModule.errorRender(requestError, req, res, next);
        assert(res.render.calledOnce);
        error.restore();
    }));
    it('errorRender defaultエラー', () => __awaiter(this, void 0, void 0, function* () {
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
        const next = (err) => {
            throw err.massage;
        };
        yield ErrorModule.errorRender(new Error(), req, res, next);
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
        const next = (err) => {
            throw err.massage;
        };
        const errorType = ErrorUtilModule_1.ErrorType.Access;
        yield ErrorModule.errorRender(new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, errorType), req, res, next);
        assert(res.send.calledOnce);
        error.restore();
    }));
});
