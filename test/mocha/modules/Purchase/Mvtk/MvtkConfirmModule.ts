/**
 * Purchase.Mvtk.MvtkConfirmModuleテスト
 */
import * as assert from 'assert';
import * as moment from 'moment';
import * as sinon from 'sinon';

import * as MvtkConfirmModule from '../../../../../app/modules/Purchase/Mvtk/MvtkConfirmModule';

describe('Purchase.Mvtk.MvtkConfirmModule', () => {

    it('render 正常', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate()
                },
                mvtk: []
            }
        };
        const res: any = {
            locals: {},
            render: sinon.spy()
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        await MvtkConfirmModule.render(req, res, next);
        assert(res.render.calledOnce);
    });

    it('render 正常 ムビチケなし', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate()
                },
                mvtk: null
            }
        };
        const res: any = {
            locals: {},
            redirect: sinon.spy()
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        await MvtkConfirmModule.render(req, res, next);
        assert(res.redirect.calledOnce);
    });

    it('render エラー', async () => {
        const req: any = {
            session: undefined
        };
        const res: any = {
            locals: {},
            redirect: sinon.spy()
        };
        const next: any = sinon.spy();
        await MvtkConfirmModule.render(req, res, next);
        assert(next.calledOnce);
    });

    it('submit 正常', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: '12345678'
                    }
                },
                mvtk: []
            },
            body: {
                transactionId: '12345678'
            }
        };
        const res: any = {
            locals: {},
            redirect: sinon.spy()
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        await MvtkConfirmModule.submit(req, res, next);
        assert(res.redirect.calledOnce);
    });

    it('submit エラー', async () => {
        const req: any = {
            session: undefined
        };
        const res: any = {
            locals: {},
            redirect: sinon.spy()
        };
        const next: any = sinon.spy();
        await MvtkConfirmModule.render(req, res, next);
        assert(next.calledOnce);
    });
});
