/**
 * Inquiry.InquiryModuleテスト
 */
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as assert from 'assert';
import * as sinon from 'sinon';

import * as InquiryLoginForm from '../../../../app/forms/Inquiry/LoginForm';
import * as InquiryModule from '../../../../app/modules/Inquiry/InquiryModule';

describe('Inquiry.InquiryModule', () => {
    let organization: sinon.SinonStub;
    let order: sinon.SinonStub;
    let inquiryLoginForm: sinon.SinonStub;
    beforeEach(() => {
        organization = sinon.stub(sasaki.service, 'organization').returns({
            findMovieTheaterByBranchCode: () => {
                return {
                    location: {
                        name: { ja: '', en: '' }
                    }
                };
            }
        });
        order = sinon.stub(sasaki.service, 'order').returns({
            findByOrderInquiryKey: () => {
                return {
                    orderNumber: ''
                };
            }
        });
        inquiryLoginForm = sinon.stub(InquiryLoginForm, 'default').returns({});
    });
    afterEach(() => {
        organization.restore();
        order.restore();
        inquiryLoginForm.restore();
    });

    it('loginRender 正常', async () => {
        const req: any = {
            query: {
                orderNumber: '118-'
            },
            session: {}
        };
        const res: any = {
            locals: {},
            render: sinon.spy()
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        await InquiryModule.loginRender(req, res, next);
        assert(res.render.calledOnce);
    });

    it('loginRender エラー', async () => {
        const req: any = {
            query: {
                orderNumber: '118-'
            },
            session: undefined
        };
        const res: any = {
            locals: {}
        };
        const next: any = sinon.spy();
        await InquiryModule.loginRender(req, res, next);
        assert(next.calledOnce);
    });

    it('inquiryAuth 正常', async () => {
        const req: any = {
            body: {},
            session: {},
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return true;
                    }
                });
            }
        };
        const res: any = {
            locals: {},
            redirect: sinon.spy()
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        await InquiryModule.inquiryAuth(req, res, next);
        assert(res.redirect.calledOnce);
    });

    it('inquiryAuth バリデーション', async () => {
        const req: any = {
            body: {},
            session: {},
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return false;
                    },
                    mapped: () => {
                        return;
                    }
                });
            }
        };
        const res: any = {
            locals: {},
            render: sinon.spy()
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        await InquiryModule.inquiryAuth(req, res, next);
        assert(res.render.calledOnce);
    });

    it('inquiryAuth エラー', async () => {
        const req: any = {
            body: {},
            session: undefined
        };
        const res: any = {
            locals: {}
        };
        const next: any = sinon.spy();
        await InquiryModule.inquiryAuth(req, res, next);
        assert(next.calledOnce);
    });

    it('confirmRender 正常', async () => {
        const req: any = {
            body: {},
            session: {
                inquiry: {}
            },
            query: {
                theater: ''
            }
        };
        const res: any = {
            locals: {},
            render: sinon.spy()
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        await InquiryModule.confirmRender(req, res, next);
        assert(res.render.calledOnce);
    });

    it('confirmRender リダイレクト', async () => {
        const req: any = {
            body: {},
            session: {},
            params: {
                orderNumber: '1111'
            },
            query: {
                theater: ''
            }
        };
        const res: any = {
            locals: {},
            redirect: sinon.spy()
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        await InquiryModule.confirmRender(req, res, next);
        assert(res.redirect.calledOnce);
    });

    it('confirmRender エラー', async () => {
        const req: any = {
            body: {},
            session: undefined,
            params: {},
            query: {}
        };
        const res: any = {};
        const next: any = sinon.spy();
        await InquiryModule.confirmRender(req, res, next);
        assert(next.calledOnce);
    });

});
