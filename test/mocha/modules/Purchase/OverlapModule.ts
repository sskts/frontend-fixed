/**
 * Purchase.OverlapModuleテスト
 */
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as assert from 'assert';
import * as sinon from 'sinon';

import * as OverlapModule from '../../../../app/modules/Purchase/OverlapModule';

describe('Purchase.OverlapModule', () => {

    it('render 正常', async () => {
        const event = sinon.stub(sasaki.service, 'event').returns({
            findIndividualScreeningEvent: () => {
                return Promise.resolve({});
            }
        });
        const req: any = {
            session: {
                purchase: {
                    individualScreeningEvent: {}
                }
            },
            params: {
                id: ''
            },
            body: {
                performanceId: ''
            }
        };
        const res: any = {
            locals: {},
            render: sinon.spy()
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        await OverlapModule.render(req, res, next);
        assert(res.render.calledOnce);
        event.restore();
    });

    it('render エラー', async () => {
        const req: any = {
            session: undefined
        };
        const res: any = {};
        const next: any = sinon.spy();
        await OverlapModule.render(req, res, next);
        assert(next.calledOnce);
    });

    it('newReserve 正常', async () => {
        const placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
            cancelSeatReservationAuthorization: () => {
                return Promise.resolve({});
            }
        });
        const req: any = {
            session: {
                purchase: {
                    individualScreeningEvent: {},
                    transaction: {
                        id: ''
                    },
                    seatReservationAuthorization: {
                        id: ''
                    }
                }
            },
            params: {
                id: ''
            },
            body: {
                performanceId: ''
            }
        };
        const res: any = {
            locals: {},
            redirect: sinon.spy()
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        await OverlapModule.newReserve(req, res, next);
        assert(res.redirect.calledOnce);
        placeOrder.restore();
    });

    it('newReserve エラー', async () => {
        const req: any = {
            session: undefined,
            params: {
                id: ''
            },
            body: {
                performanceId: ''
            }
        };
        const res: any = {};
        const next: any = sinon.spy();
        await OverlapModule.newReserve(req, res, next);
        assert(next.calledOnce);
    });

    it('prevReserve 正常', async () => {
        const req: any = {
            session: {},
            body: {
                performanceId: ''
            }
        };
        const res: any = {
            locals: {},
            redirect: sinon.spy()
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        await OverlapModule.prevReserve(req, res, next);
        assert(res.redirect.calledOnce);
    });

    it('prevReserve エラー', async () => {
        const req: any = {
            session: undefined
        };
        const res: any = {};
        const next: any = sinon.spy();
        await OverlapModule.prevReserve(req, res, next);
        assert(next.calledOnce);
    });
});
