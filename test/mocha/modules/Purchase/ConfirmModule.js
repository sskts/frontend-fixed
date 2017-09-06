"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Purchase.ConfirmModuleテスト
 */
const MVTK = require("@motionpicture/mvtk-service");
const assert = require("assert");
const moment = require("moment");
const sinon = require("sinon");
const PurchaseModel_1 = require("../../../../app/models/Purchase/PurchaseModel");
const ConfirmModule = require("../../../../app/modules/Purchase/ConfirmModule");
describe('Purchase.ConfirmModule', () => {
    let createSeatInfoSyncService;
    let getMvtkSeatInfoSync;
    beforeEach(() => {
        createSeatInfoSyncService = sinon.stub(MVTK, 'createSeatInfoSyncService').returns({
            seatInfoSync: () => {
                return Promise.resolve({
                    zskyykResult: MVTK.SeatInfoSyncUtilities.RESERVATION_CANCEL_SUCCESS
                });
            }
        });
        getMvtkSeatInfoSync = sinon.stub(PurchaseModel_1.PurchaseModel.prototype, 'getMvtkSeatInfoSync').returns({
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
    it('render 正常', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {},
                    seatReservationAuthorization: {},
                    profile: {}
                }
            }
        };
        const res = {
            locals: {},
            render: sinon.spy()
        };
        const next = (err) => {
            throw err.massage;
        };
        yield ConfirmModule.render(req, res, next);
        assert(res.render.calledOnce);
    }));
    it('render エラー', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: undefined
        };
        const res = {
            locals: {}
        };
        const next = sinon.spy();
        yield ConfirmModule.render(req, res, next);
        assert(next.calledOnce);
    }));
    it('reserveMvtk 正常', () => __awaiter(this, void 0, void 0, function* () {
        const req = {
            session: {
                purchase: {}
            }
        };
        const res = {
            locals: {},
            json: sinon.spy()
        };
        yield ConfirmModule.cancelMvtk(req, res);
        assert.strictEqual(res.json.args[0][0].isSuccess, true);
    }));
});
