/**
 * Error.ErrorModuleテスト
 */
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as assert from 'assert';
import * as HTTPStatus from 'http-status';
import * as sinon from 'sinon';

import logger from '../../../../app/middlewares/logger';
import * as ErrorModule from '../../../../app/modules/Error/ErrorModule';
import { AppError, ErrorType } from '../../../../app/modules/Util/ErrorUtilModule';

describe('Error.ErrorModule', () => {

    it('notFoundRender 正常', async () => {
        const req: any = {};
        const res: any = {
            locals: {},
            render: sinon.spy(),
            status: () => {
                return res;
            }
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        await ErrorModule.notFoundRender(req, res, next);
        assert(res.render.calledOnce);
    });

    it('notFoundRender xhr 正常', async () => {
        const req: any = {
            xhr: true
        };
        const res: any = {
            locals: {},
            send: sinon.spy(),
            status: () => {
                return res;
            }
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        await ErrorModule.notFoundRender(req, res, next);
        assert(res.send.calledOnce);
    });

    it('errorRender APPエラー Property', async () => {
        const error = sinon.stub(logger, 'error').returns({});
        const req: any = {
            session: {},
            __: () => {
                return '';
            }
        };
        const res: any = {
            locals: {},
            render: sinon.spy(),
            status: () => {
                return res;
            }
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        const errorType = ErrorType.Property;
        await ErrorModule.errorRender(new AppError(HTTPStatus.BAD_REQUEST, errorType), req, res, next);
        assert(res.render.calledOnce);
        error.restore();
    });

    it('errorRender APPエラー Access', async () => {
        const error = sinon.stub(logger, 'error').returns({});
        const req: any = {
            session: {},
            __: () => {
                return '';
            }
        };
        const res: any = {
            locals: {},
            render: sinon.spy(),
            status: () => {
                return res;
            }
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        const errorType = ErrorType.Access;
        await ErrorModule.errorRender(new AppError(HTTPStatus.BAD_REQUEST, errorType), req, res, next);
        assert(res.render.calledOnce);
        error.restore();
    });

    it('errorRender APPエラー Validation', async () => {
        const error = sinon.stub(logger, 'error').returns({});
        const req: any = {
            session: {},
            __: () => {
                return '';
            }
        };
        const res: any = {
            locals: {},
            render: sinon.spy(),
            status: () => {
                return res;
            }
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        const errorType = ErrorType.Validation;
        await ErrorModule.errorRender(new AppError(HTTPStatus.BAD_REQUEST, errorType), req, res, next);
        assert(res.render.calledOnce);
        error.restore();
    });

    it('errorRender APPエラー Expire', async () => {
        const error = sinon.stub(logger, 'error').returns({});
        const req: any = {
            session: {},
            __: () => {
                return '';
            }
        };
        const res: any = {
            locals: {},
            render: sinon.spy(),
            status: () => {
                return res;
            }
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        const errorType = ErrorType.Expire;
        await ErrorModule.errorRender(new AppError(HTTPStatus.BAD_REQUEST, errorType), req, res, next);
        assert(res.render.calledOnce);
        error.restore();
    });

    it('errorRender APPエラー ExternalModule', async () => {
        const error = sinon.stub(logger, 'error').returns({});
        const req: any = {
            session: {},
            __: () => {
                return '';
            }
        };
        const res: any = {
            locals: {},
            render: sinon.spy(),
            status: () => {
                return res;
            }
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        const errorType = ErrorType.ExternalModule;
        await ErrorModule.errorRender(new AppError(HTTPStatus.BAD_REQUEST, errorType), req, res, next);
        assert(res.render.calledOnce);
        error.restore();
    });

    it('errorRender APIエラー BAD_REQUEST', async () => {
        const error = sinon.stub(logger, 'error').returns({});
        const req: any = {
            session: {},
            __: () => {
                return '';
            }
        };
        const res: any = {
            locals: {},
            render: sinon.spy(),
            status: () => {
                return res;
            }
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        const requestError = new sasaki.transporters.RequestError();
        requestError.errors = [];
        requestError.code = HTTPStatus.BAD_REQUEST;
        await ErrorModule.errorRender(requestError, req, res, next);
        assert(res.render.calledOnce);
        error.restore();
    });

    it('errorRender APIエラー UNAUTHORIZED', async () => {
        const error = sinon.stub(logger, 'error').returns({});
        const req: any = {
            session: {},
            __: () => {
                return '';
            }
        };
        const res: any = {
            locals: {},
            render: sinon.spy(),
            status: () => {
                return res;
            }
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        const requestError = new sasaki.transporters.RequestError();
        requestError.errors = [];
        requestError.code = HTTPStatus.UNAUTHORIZED;
        await ErrorModule.errorRender(requestError, req, res, next);
        assert(res.render.calledOnce);
        error.restore();
    });

    it('errorRender APIエラー FORBIDDEN', async () => {
        const error = sinon.stub(logger, 'error').returns({});
        const req: any = {
            session: {},
            __: () => {
                return '';
            }
        };
        const res: any = {
            locals: {},
            render: sinon.spy(),
            status: () => {
                return res;
            }
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        const requestError = new sasaki.transporters.RequestError();
        requestError.errors = [];
        requestError.code = HTTPStatus.FORBIDDEN;
        await ErrorModule.errorRender(requestError, req, res, next);
        assert(res.render.calledOnce);
        error.restore();
    });

    it('errorRender APIエラー NOT_FOUND', async () => {
        const error = sinon.stub(logger, 'error').returns({});
        const req: any = {
            session: {},
            __: () => {
                return '';
            }
        };
        const res: any = {
            locals: {},
            render: sinon.spy(),
            status: () => {
                return res;
            }
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        const requestError = new sasaki.transporters.RequestError();
        requestError.errors = [];
        requestError.code = HTTPStatus.NOT_FOUND;
        await ErrorModule.errorRender(requestError, req, res, next);
        assert(res.render.calledOnce);
        error.restore();
    });

    it('errorRender APIエラー INTERNAL_SERVER_ERROR', async () => {
        const error = sinon.stub(logger, 'error').returns({});
        const req: any = {
            session: {},
            __: () => {
                return '';
            }
        };
        const res: any = {
            locals: {},
            render: sinon.spy(),
            status: () => {
                return res;
            }
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        const requestError = new sasaki.transporters.RequestError();
        requestError.errors = [];
        requestError.code = HTTPStatus.INTERNAL_SERVER_ERROR;
        await ErrorModule.errorRender(requestError, req, res, next);
        assert(res.render.calledOnce);
        error.restore();
    });

    it('errorRender APIエラー SERVICE_UNAVAILABLE', async () => {
        const error = sinon.stub(logger, 'error').returns({});
        const req: any = {
            session: {},
            __: () => {
                return '';
            }
        };
        const res: any = {
            locals: {},
            render: sinon.spy(),
            status: () => {
                return res;
            }
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        const requestError = new sasaki.transporters.RequestError();
        requestError.errors = [];
        requestError.code = HTTPStatus.SERVICE_UNAVAILABLE;
        await ErrorModule.errorRender(requestError, req, res, next);
        assert(res.render.calledOnce);
        error.restore();
    });

    it('errorRender defaultエラー', async () => {
        const error = sinon.stub(logger, 'error').returns({});
        const req: any = {
            session: {},
            __: () => {
                return '';
            }
        };
        const res: any = {
            locals: {},
            render: sinon.spy(),
            status: () => {
                return res;
            }
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        await ErrorModule.errorRender(new Error(), req, res, next);
        assert(res.render.calledOnce);
        error.restore();
    });

    it('errorRender xhr 正常', async () => {
        const error = sinon.stub(logger, 'error').returns({});
        const req: any = {
            session: {},
            xhr: true,
            __: () => {
                return '';
            }
        };
        const res: any = {
            locals: {},
            send: sinon.spy(),
            status: () => {
                return res;
            }
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        const errorType = ErrorType.Access;
        await ErrorModule.errorRender(new AppError(HTTPStatus.BAD_REQUEST, errorType), req, res, next);
        assert(res.send.calledOnce);
        error.restore();
    });
});
