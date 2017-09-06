/**
 * MvtkInputModuleテスト
 */
import * as COA from '@motionpicture/coa-service';
import * as MVTK from '@motionpicture/mvtk-service';
import * as assert from 'assert';
import * as moment from 'moment';
import * as sinon from 'sinon';

import * as MvtkInputForm from '../../../../../app/forms/Purchase/Mvtk/MvtkInputForm';
import * as MvtkInputModule from '../../../../../app/modules/Purchase/Mvtk/MvtkInputModule';

describe('MvtkInputModule', () => {

    let mvtkInputForm: sinon.SinonStub;
    let purchaseNumberAuth: sinon.SinonStub;
    let mvtkTicketcode: sinon.SinonStub;
    // tslint:disable-next-line:max-func-body-length
    beforeEach(() => {
        mvtkInputForm = sinon.stub(MvtkInputForm, 'default').returns({});
        purchaseNumberAuth = sinon.stub(MVTK, 'createPurchaseNumberAuthService').returns({
            purchaseNumberAuth: () => {
                return Promise.resolve([{
                    knyknrNo: '',
                    ykknInfo: [{}]
                }]);
            }
        });
        mvtkTicketcode = sinon.stub(COA.services.master, 'mvtkTicketcode').returns(
            Promise.resolve({})
        );
    });
    afterEach(() => {
        mvtkInputForm.restore();
        purchaseNumberAuth.restore();
        mvtkTicketcode.restore();
    });

    it('render 正常', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {}
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
        await MvtkInputModule.render(req, res, next);
        assert(res.render.calledOnce);
    });

    it('render エラー', async () => {
        const req: any = {
            session: undefined
        };
        const res: any = {};
        const next: any = sinon.spy();
        await MvtkInputModule.render(req, res, next);
        assert(next.calledOnce);
    });

    it('select 正常', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: ''
                    },
                    individualScreeningEvent: {
                        coaInfo: {
                            theaterCode: '',
                            dateJouei: ''
                        }
                    }
                },
                mvtk: []
            },
            body: {
                transactionId: '',
                mvtk: JSON.stringify([{code: '', password: ''}])
            },
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
        await MvtkInputModule.select(req, res, next);
        assert(res.redirect.calledOnce);
    });

    it('select エラー1', async () => {
        const req: any = {
            session: {
                purchase: undefined,
                mvtk: JSON.stringify([{code: '1', password: '1'}])
            }
        };
        const res: any = {};
        const next: any = sinon.spy();
        await MvtkInputModule.select(req, res, next);
        assert(next.calledOnce);
    });

    it('select エラー2', async () => {
        const req: any = {
            session: undefined
        };
        const res: any = {};
        const next: any = sinon.spy();
        await MvtkInputModule.select(req, res, next);
        assert(next.calledOnce);
    });
});
