/**
 * Purchase.OverlapModuleテスト
 */
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as assert from 'assert';
import * as sinon from 'sinon';

import * as PerformancesModule from '../../../../app/modules/Purchase/PerformancesModule';

describe('Purchase.PerformancesModule', () => {

    it('render 正常', async () => {
        const placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
            cancelSeatReservationAuthorization: () => {
                return Promise.resolve({});
            }
        });
        const organization = sinon.stub(sasaki.service, 'organization').returns({
            searchMovieTheaters: () => {
                return Promise.resolve({});
            }
        });
        const req: any = {
            session: {
                purchase: {
                    transaction: {
                        id: ''
                    },
                    seatReservationAuthorization: {
                        id: ''
                    }
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
        await PerformancesModule.render(req, res, next);
        assert(res.render.calledOnce);
        placeOrder.restore();
        organization.restore();
    });

    it('render エラー', async () => {
        const req: any = {
            session: undefined
        };
        const res: any = {};
        const next: any = sinon.spy();
        await PerformancesModule.render(req, res, next);
        assert(next.calledOnce);
    });

    it('getPerformances 正常', async () => {
        const event = sinon.stub(sasaki.service, 'event').returns({
            searchIndividualScreeningEvent: () => {
                return Promise.resolve({});
            }
        });
        const req: any = {
            session: {},
            body: {
                theater: '',
                day: ''
            }
        };
        const res: any = {
            locals: {},
            json: sinon.spy()
        };
        await PerformancesModule.getPerformances(req, res);
        assert(res.json.calledOnce);
        assert.strictEqual(res.json.args[0][0].error, null);
        assert.notStrictEqual(res.json.args[0][0].result, null);
        event.restore();
    });

    it('getPerformances エラー', async () => {
        const req: any = {
            session: undefined
        };
        const res: any = {
            json: sinon.spy()
        };
        await PerformancesModule.getPerformances(req, res);
        assert(res.json.calledOnce);
        assert.strictEqual(res.json.args[0][0].result, null);
        assert.notStrictEqual(res.json.args[0][0].error, null);
    });

});
