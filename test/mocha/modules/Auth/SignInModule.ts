/**
 * Auth.SignInModuleテスト
 */
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as assert from 'assert';
import * as sinon from 'sinon';

import { MemberType } from '../../../../app/models/Auth/AuthModel';
import * as SignInModule from '../../../../app/modules/Auth/SignInModule';

describe('Auth.SignInModule', () => {

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
        const auth = sinon.stub(sasaki.auth.OAuth2.prototype, 'getToken').returns(
            Promise.resolve({})
        );
        const req: any = {
            query: {
                code: '',
                state: ''
            },
            session: {
                auth: {
                    state: '',
                    codeVerifier: '',
                    memberType: MemberType.Member
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
        auth.restore();
    });

    it('index エラー セッションなし', async () => {
        const req: any = {
            session: undefined,
            query: {
                code: '',
                state: ''
            }
        };
        const res: any = {};
        const next: any = sinon.spy();
        await SignInModule.index(req, res, next);
        assert(next.calledOnce);
    });

    it('index エラー state不整合', async () => {
        const req: any = {
            session: {
                auth: {
                    state: '123'
                }
            },
            query: {
                code: '',
                state: '456'
            }
        };
        const res: any = {};
        const next: any = sinon.spy();
        await SignInModule.index(req, res, next);
        assert(next.calledOnce);
    });
});
