/**
 * Purchase.ConfirmModuleテスト
 */
import * as MVTK from '@motionpicture/mvtk-service';
import * as sasaki from '@motionpicture/sasaki-api-nodejs';
import * as assert from 'assert';
import * as moment from 'moment';
import * as sinon from 'sinon';

import { PurchaseModel } from '../../../../app/models/Purchase/PurchaseModel';
import * as ConfirmModule from '../../../../app/modules/Purchase/ConfirmModule';

describe('Purchase.ConfirmModule', () => {

    it('render 正常', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {},
                    seatReservationAuthorization: {},
                    profile: {}
                }
            }
        };
        const res: any = {
            locals: {},
            render: sinon.spy()
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        await ConfirmModule.render(req, res, next);
        assert(res.render.calledOnce);
    });

    it('render エラー', async () => {
        const req: any = {
            session: undefined
        };
        const res: any = {
            locals: {}
        };
        const next: any = sinon.spy();
        await ConfirmModule.render(req, res, next);
        assert(next.calledOnce);
    });

    it('cancelMvtk 正常', async () => {
        const createSeatInfoSyncService = sinon.stub(MVTK, 'createSeatInfoSyncService').returns({
            seatInfoSync: () => {
                return Promise.resolve({
                    zskyykResult: MVTK.SeatInfoSyncUtilities.RESERVATION_CANCEL_SUCCESS
                });
            }
        });
        const getMvtkSeatInfoSync = sinon.stub(PurchaseModel.prototype, 'getMvtkSeatInfoSync').returns({
            knyknrNoInfo: [
                { knshInfo: [] }
            ],
            zskInfo: []
        });
        const req: any = {
            session: {
                purchase: {}
            }
        };
        const res: any = {
            locals: {},
            json: sinon.spy()
        };
        await ConfirmModule.cancelMvtk(req, res);
        assert.strictEqual(res.json.args[0][0].isSuccess, true);
        createSeatInfoSyncService.restore();
        getMvtkSeatInfoSync.restore();
    });

    it('purchase 正常', async () => {
        const placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
            confirm: () => {
                return Promise.resolve({});
            },
            sendEmailNotification: () => {
                return Promise.resolve({});
            }
        });
        const place = sinon.stub(sasaki.service, 'place').returns({
            findMovieTheater: () => {
                return Promise.resolve({});
            }
        });

        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: ''
                    },
                    individualScreeningEvent: {
                        coaInfo: {
                            theaterCode: ''
                        },
                        superEvent: {
                            location: {
                                name: {
                                    ja: ''
                                }
                            }
                        }
                    },
                    profile: {},
                    seatReservationAuthorization: {
                        result: {}
                    },
                    reserveTickets: [
                        {
                            mvtkNum: ''
                        }
                    ]
                }
            },
            body: {
                transactionId: ''
            },
            __: () => {
                return '';
            },
            headers: {
                host: ''
            }
        };
        const res: any = {
            locals: {},
            render: (file: any, locals: any, cb: any) => {
                file = '';
                locals = '';
                cb(null, '');
            },
            json: sinon.spy()
        };
        await ConfirmModule.purchase(req, res);
        assert(res.json.calledOnce);
        assert.notStrictEqual(res.json.args[0][0].result, null);
        assert.strictEqual(res.json.args[0][0].err, null);
        placeOrder.restore();
        place.restore();
    });

    it('purchase エラー', async () => {
        const req: any = {
            session: undefined,
            body: {
                transactionId: ''
            },
            __: () => {
                return '';
            },
            headers: {
                host: ''
            }
        };
        const res: any = {
            locals: {},
            render: () => '',
            json: sinon.spy()
        };
        await ConfirmModule.purchase(req, res);
        assert.strictEqual(res.json.args[0][0].result, null);
        assert.notStrictEqual(res.json.args[0][0].err, null);
    });

    it('getCompleteData 正常', async () => {
        const req: any = {
            session: {
                complete: {}
            }
        };
        const res: any = {
            json: sinon.spy()
        };
        await ConfirmModule.getCompleteData(req, res);
        assert(res.json.calledOnce);
        assert.notStrictEqual(res.json.args[0][0].result, null);
        assert.strictEqual(res.json.args[0][0].err, null);
    });

    it('getCompleteData エラー', async () => {
        const req: any = {
            session: {
                complete: undefined
            },
            __: () => {
                return '';
            }
        };
        const res: any = {
            json: sinon.spy()
        };
        await ConfirmModule.getCompleteData(req, res);
        assert(res.json.calledOnce);
        assert.strictEqual(res.json.args[0][0].result, null);
        assert.notStrictEqual(res.json.args[0][0].err, null);
    });

});
