/**
 * Purchase.ConfirmModuleテスト
 */
import * as MVTK from '@motionpicture/mvtk-service';
import * as assert from 'assert';
import * as moment from 'moment';
import * as sinon from 'sinon';

import { PurchaseModel } from '../../../../app/models/Purchase/PurchaseModel';
import * as ConfirmModule from '../../../../app/modules/Purchase/ConfirmModule';

describe('Purchase.ConfirmModule', () => {
    let createSeatInfoSyncService: sinon.SinonStub;
    let getMvtkSeatInfoSync: sinon.SinonStub;
    beforeEach(() => {
        createSeatInfoSyncService = sinon.stub(MVTK, 'createSeatInfoSyncService').returns({
            seatInfoSync: () => {
                return Promise.resolve({
                    zskyykResult: MVTK.SeatInfoSyncUtilities.RESERVATION_CANCEL_SUCCESS
                });
            }
        });
        getMvtkSeatInfoSync = sinon.stub(PurchaseModel.prototype, 'getMvtkSeatInfoSync').returns({
            knyknrNoInfo: [
                { knshInfo: [] }
            ],
            zskInfo: []
        });
    });
    afterEach(() => {
        createSeatInfoSyncService.restore();
        getMvtkSeatInfoSync.restore();
    });

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

    it('reserveMvtk 正常', async () => {
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
    });

});
