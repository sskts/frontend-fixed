/**
 * Purchase.TransactionModuleテスト
 */
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as assert from 'assert';
import * as moment from 'moment';
import * as sinon from 'sinon';

import * as TransactionModule from '../../../../app/modules/Purchase/TransactionModule';

describe('Purchase.TransactionModule', () => {

    it('start 正常', async () => {
        const event = sinon.stub(sasaki.service, 'event').returns({
            findIndividualScreeningEvent: () => {
                return Promise.resolve({
                    coaInfo: {
                        theaterCode: '',
                        rsvStartDate: moment().subtract(1, 'days').format('YYYYMMDD')
                    },
                    startDate: moment().add(1, 'days').toDate()
                });
            }
        });
        const organization = sinon.stub(sasaki.service, 'organization').returns({
            findMovieTheaterByBranchCode: () => {
                return Promise.resolve({
                    id: ''
                });
            }
        });
        const placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
            start: () => {
                return Promise.resolve({});
            }
        });
        const req: any = {
            session: {},
            body: {
                performanceId: ''
            }
        };
        const res: any = {
            json: sinon.spy()
        };
        await TransactionModule.start(req, res);
        assert(res.json.calledOnce);
        assert.notStrictEqual(res.json.args[0][0].redirect, null);
        event.restore();
        organization.restore();
        placeOrder.restore();
    });

    it('start 正常 重複確認へ', async () => {
        const event = sinon.stub(sasaki.service, 'event').returns({
            findIndividualScreeningEvent: () => {
                return Promise.resolve({
                    coaInfo: {
                        theaterCode: '',
                        rsvStartDate: moment().subtract(1, 'days').format('YYYYMMDD')
                    },
                    startDate: moment().add(1, 'days').toDate()
                });
            }
        });
        const req: any = {
            session: {
                purchase: {
                    transaction: {},
                    seatReservationAuthorization: {}
                }
            },
            body: {
                performanceId: ''
            }
        };
        const res: any = {
            json: sinon.spy()
        };
        await TransactionModule.start(req, res);
        assert(res.json.calledOnce);
        assert.notStrictEqual(res.json.args[0][0].redirect, null);
        event.restore();
    });

    it('start エラー セッションなし', async () => {
        const req: any = {
            session: undefined
        };
        const res: any = {
            json: sinon.spy()
        };
        await TransactionModule.start(req, res);
        assert(res.json.calledOnce);
        assert.strictEqual(res.json.args[0][0].redirect, null);
    });

    it('start エラー セッションなし', async () => {
        const event = sinon.stub(sasaki.service, 'event').returns({
            findIndividualScreeningEvent: () => {
                return Promise.resolve(null);
            }
        });
        const req: any = {
            session: {},
            body: {
                performanceId: ''
            }
        };
        const res: any = {
            json: sinon.spy()
        };
        await TransactionModule.start(req, res);
        assert(res.json.calledOnce);
        assert.strictEqual(res.json.args[0][0].redirect, null);
        event.restore();
    });

    it('start エラー APIエラー', async () => {
        const event = sinon.stub(sasaki.service, 'event').returns({
            findIndividualScreeningEvent: () => {
                return Promise.reject({});
            }
        });
        const req: any = {
            session: {},
            body: {
                performanceId: ''
            }
        };
        const res: any = {
            json: sinon.spy()
        };
        await TransactionModule.start(req, res);
        assert(res.json.calledOnce);
        assert.strictEqual(res.json.args[0][0].redirect, null);
        event.restore();
    });

    it('start エラー 開始可能日前', async () => {
        const event = sinon.stub(sasaki.service, 'event').returns({
            findIndividualScreeningEvent: () => {
                return Promise.resolve({
                    coaInfo: {
                        theaterCode: '',
                        rsvStartDate: moment().add(1, 'days').format('YYYYMMDD')
                    }
                });
            }
        });
        const req: any = {
            session: {},
            body: {
                performanceId: ''
            }
        };
        const res: any = {
            json: sinon.spy()
        };
        await TransactionModule.start(req, res);
        assert(res.json.calledOnce);
        assert.strictEqual(res.json.args[0][0].redirect, null);
        event.restore();
    });

    it('start エラー 終了可能日後', async () => {
        const event = sinon.stub(sasaki.service, 'event').returns({
            findIndividualScreeningEvent: () => {
                return Promise.resolve({
                    coaInfo: {
                        theaterCode: '',
                        rsvStartDate: moment().subtract(1, 'days').format('YYYYMMDD')
                    },
                    startDate: moment().subtract(1, 'hours').toDate()
                });
            }
        });
        const req: any = {
            session: {},
            body: {
                performanceId: ''
            }
        };
        const res: any = {
            json: sinon.spy()
        };
        await TransactionModule.start(req, res);
        assert(res.json.calledOnce);
        assert.strictEqual(res.json.args[0][0].redirect, null);
        event.restore();
    });

    it('start エラー 対象劇場なし', async () => {
        const event = sinon.stub(sasaki.service, 'event').returns({
            findIndividualScreeningEvent: () => {
                return Promise.resolve({
                    coaInfo: {
                        theaterCode: '',
                        rsvStartDate: moment().subtract(1, 'days').format('YYYYMMDD')
                    },
                    startDate: moment().add(1, 'hours').toDate()
                });
            }
        });
        const organization = sinon.stub(sasaki.service, 'organization').returns({
            findMovieTheaterByBranchCode: () => {
                return Promise.resolve(null);
            }
        });
        const req: any = {
            session: {},
            body: {
                performanceId: ''
            }
        };
        const res: any = {
            json: sinon.spy()
        };
        await TransactionModule.start(req, res);

        event.restore();
        organization.restore();

        assert(res.json.calledOnce);
        assert.strictEqual(res.json.args[0][0].redirect, null);
    });

});
