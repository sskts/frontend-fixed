/**
 * Inquiry.InquiryModuleテスト
 */
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as assert from 'assert';
import * as sinon from 'sinon';

import * as InquiryLoginForm from '../../../../app/forms/Inquiry/LoginForm';
import * as InquiryModule from '../../../../app/modules/Inquiry/InquiryModule';

describe('Inquiry.InquiryModule', () => {
    it('loginRender 正常', async () => {
        const organization = sinon.stub(sasaki.service, 'organization').returns({
            findMovieTheaterByBranchCode: () => {
                return Promise.resolve({
                    location: {
                        name: { ja: '', en: '' }
                    }
                });
            }
        });
        const req: any = {
            query: {
                theater: '118'
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
        organization.restore();
    });

    it('loginRender エラー 劇場コードなし', async () => {
        const req: any = {
            query: {}
        };
        const res: any = {
            render: sinon.spy(),
            status: () => {
                return res;
            }
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        await InquiryModule.loginRender(req, res, next);
        assert(res.render.calledOnce);
    });

    it('loginRender エラー セッションなし', async () => {
        const req: any = {
            query: {
                theater: '118'
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
        const organization = sinon.stub(sasaki.service, 'organization').returns({
            findMovieTheaterByBranchCode: () => {
                return Promise.resolve({
                    location: {
                        name: { ja: '', en: '' }
                    }
                });
            }
        });
        const order = sinon.stub(sasaki.service, 'order').returns({
            findByOrderInquiryKey: () => {
                return Promise.resolve({
                    orderNumber: ''
                });
            }
        });
        const inquiryLoginForm = sinon.stub(InquiryLoginForm, 'default').returns({});
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
        organization.restore();
        order.restore();
        inquiryLoginForm.restore();
    });

    it('inquiryAuth 正常 オーダー情報なし', async () => {
        const organization = sinon.stub(sasaki.service, 'organization').returns({
            findMovieTheaterByBranchCode: () => {
                return Promise.resolve({
                    location: {
                        name: { ja: '', en: '' }
                    }
                });
            }
        });
        const order = sinon.stub(sasaki.service, 'order').returns({
            findByOrderInquiryKey: () => {
                return Promise.resolve(null);
            }
        });
        const inquiryLoginForm = sinon.stub(InquiryLoginForm, 'default').returns({});
        const req: any = {
            body: {},
            session: {},
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return true;
                    }
                });
            },
            __: () => {
                return '';
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
        organization.restore();
        order.restore();
        inquiryLoginForm.restore();
    });

    it('inquiryAuth 正常 バリデーション', async () => {
        const organization = sinon.stub(sasaki.service, 'organization').returns({
            findMovieTheaterByBranchCode: () => {
                return Promise.resolve({
                    location: {
                        name: { ja: '', en: '' }
                    }
                });
            }
        });
        const inquiryLoginForm = sinon.stub(InquiryLoginForm, 'default').returns({});
        const req: any = {
            body: {},
            session: {},
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return false;
                    },
                    mapped: () => {
                        return {};
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
        organization.restore();
        inquiryLoginForm.restore();
    });

    it('inquiryAuth エラー セッションなし', async () => {
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

    it('inquiryAuth エラー 対象劇場なし', async () => {
        const organization = sinon.stub(sasaki.service, 'organization').returns({
            findMovieTheaterByBranchCode: () => {
                return Promise.resolve(null);
            }
        });
        const inquiryLoginForm = sinon.stub(InquiryLoginForm, 'default').returns({});
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
            locals: {}
        };
        const next: any = sinon.spy();
        await InquiryModule.inquiryAuth(req, res, next);
        assert(next.calledOnce);
        organization.restore();
        inquiryLoginForm.restore();
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
