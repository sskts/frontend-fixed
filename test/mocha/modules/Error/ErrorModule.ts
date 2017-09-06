/**
 * ErrorModuleテスト
 */
import * as assert from 'assert';
import * as sinon from 'sinon';

import * as ErrorModule from '../../../../app/modules/Error/ErrorModule';
import * as ErrorUtilModule from '../../../../app/modules/Util/ErrorUtilModule';

describe('ErrorModule', () => {

    it('notFoundRender 正常', async () => {
        const req: any = {};
        const res: any = {
            locals: {},
            render: sinon.spy(),
            status: () => {
                return res;
            }
        };
        await ErrorModule.notFoundRender(req, res);
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
        await ErrorModule.notFoundRender(req, res);
        assert(res.send.calledOnce);
    });

    it('errorRender 正常', async () => {
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
        const errorType = ErrorUtilModule.ErrorType.Access;
        await ErrorModule.errorRender(new ErrorUtilModule.CustomError(errorType, ''), req, res);
        assert(res.render.calledOnce);
    });

    it('errorRender xhr 正常', async () => {
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
        const errorType = ErrorUtilModule.ErrorType.Access;
        await ErrorModule.errorRender(new ErrorUtilModule.CustomError(errorType, ''), req, res);
        assert(res.send.calledOnce);
    });
});
