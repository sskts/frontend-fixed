/**
 * 認証
 * @namespace SignInModule
 */
import * as assert from 'assert';
import * as sinon from 'sinon';

import * as SignInModule from '../../../../app/modules/Auth/SignInModule';

describe('SignInModule', () => {

    it('index サインイン 正常', async () => {
        const req: any = {
            query: {
                id: '12345678'
            },
            session: {}
        };
        const res: any = {
            redirect: sinon.spy()
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        await SignInModule.index(req, res, next);
        assert(res.redirect.calledOnce);
    });

    it('index 購入ページへ 正常', async () => {
        const req: any = {
            query: {
                code: '12345678',
                state: '12345678'
            },
            session: {
                auth: {
                    state: '12345678'
                }
            }
        };
        const res: any = {
            redirect: sinon.spy()
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        await SignInModule.index(req, res, next);
        assert(res.redirect.calledOnce);
    });

    it('index エラー', async () => {
        const req: any = {
            session: undefined
        };
        const res: any = {};
        const next: any = sinon.spy();
        await SignInModule.index(req, res, next);
        assert(next.calledOnce);
    });
});
