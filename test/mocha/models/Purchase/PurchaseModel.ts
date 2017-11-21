/**
 * Purchase.PurchaseModelテスト
 */
import * as mvtkReserve from '@motionpicture/mvtk-reserve-service';
import * as assert from 'assert';
import * as moment from 'moment';

import { PurchaseModel } from '../../../../app/models/Purchase/PurchaseModel';
import * as MvtkUtilModule from '../../../../app/modules/Purchase/Mvtk/MvtkUtilModule';

describe('Purchase.PurchaseModel', () => {

    it('save 正常', () => {
        const purchaseModel = new PurchaseModel();
        const session: any = {};
        purchaseModel.save(session);
        assert(session.purchase);
    });

    it('accessAuth 正常 PERFORMANCE_STATE', async () => {
        const purchaseModel = new PurchaseModel();
        const accessAuth = purchaseModel.accessAuth(PurchaseModel.PERFORMANCE_STATE);
        assert.strictEqual(accessAuth, false);
    });

    it('accessAuth 正常 SEAT_STATE', async () => {
        const purchaseModel = new PurchaseModel({
            transaction: {}
        });
        const accessAuth = purchaseModel.accessAuth(PurchaseModel.SEAT_STATE);
        assert(accessAuth);
    });

    it('accessAuth エラー SEAT_STATE', async () => {
        const purchaseModel = new PurchaseModel();
        const accessAuth = purchaseModel.accessAuth(PurchaseModel.SEAT_STATE);
        assert.strictEqual(accessAuth, false);
    });

    it('accessAuth 正常 TICKET_STATE', async () => {
        const purchaseModel = new PurchaseModel({
            transaction: {},
            seatReservationAuthorization: {}
        });
        const accessAuth = purchaseModel.accessAuth(PurchaseModel.TICKET_STATE);
        assert(accessAuth);
    });

    it('accessAuth エラー TICKET_STATE', async () => {
        const purchaseModel = new PurchaseModel({
            transaction: {}
        });
        const accessAuth = purchaseModel.accessAuth(PurchaseModel.TICKET_STATE);
        assert.strictEqual(accessAuth, false);
    });

    it('accessAuth 正常 INPUT_STATE', async () => {
        const purchaseModel = new PurchaseModel({
            transaction: {},
            seatReservationAuthorization: {}
        });
        const accessAuth = purchaseModel.accessAuth(PurchaseModel.INPUT_STATE);
        assert(accessAuth);
    });

    it('accessAuth エラー INPUT_STATE', async () => {
        const purchaseModel = new PurchaseModel({
            transaction: {}
        });
        const accessAuth = purchaseModel.accessAuth(PurchaseModel.INPUT_STATE);
        assert.strictEqual(accessAuth, false);
    });

    it('accessAuth 正常 CONFIRM_STATE', async () => {
        const purchaseModel = new PurchaseModel({
            transaction: {},
            seatReservationAuthorization: {},
            profile: {}
        });
        const accessAuth = purchaseModel.accessAuth(PurchaseModel.CONFIRM_STATE);
        assert(accessAuth);
    });

    it('accessAuth エラー CONFIRM_STATE', async () => {
        const purchaseModel = new PurchaseModel({
            transaction: {}
        });
        const accessAuth = purchaseModel.accessAuth(PurchaseModel.CONFIRM_STATE);
        assert.strictEqual(accessAuth, false);

        const purchaseModel2 = new PurchaseModel({
            transaction: {},
            seatReservationAuthorization: {}
        });
        const accessAuth2 = purchaseModel2.accessAuth(PurchaseModel.CONFIRM_STATE);
        assert.strictEqual(accessAuth2, false);
    });

    it('accessAuth 正常 COMPLETE_STATE', async () => {
        const purchaseModel = new PurchaseModel();
        const accessAuth = purchaseModel.accessAuth(PurchaseModel.COMPLETE_STATE);
        assert.strictEqual(accessAuth, false);
    });

    it('isUsedMvtk 正常 ムビチケ対応作品', () => {
        const purchaseModel = new PurchaseModel({
            individualScreeningEvent: {
                superEvent: {
                    coaInfo: {
                        flgMvtkUse: '1',
                        dateMvtkBegin: moment().subtract(1, 'days').format('YYYYMMDD')
                    }
                }
            }
        });

        const isReserveMvtkTicket = purchaseModel.isUsedMvtk();
        assert(isReserveMvtkTicket);
    });

    it('isUsedMvtk 正常 ムビチケ非対応作品', () => {
        const purchaseModel = new PurchaseModel();
        const isReserveMvtkTicket = purchaseModel.isReserveMvtkTicket();
        assert.strictEqual(isReserveMvtkTicket, false);
    });

    it('isReserveMvtkTicket 正常 ムビチケあり', () => {
        const purchaseModel = new PurchaseModel({
            reserveTickets: [{ mvtkNum: '12345678' }]
        });
        const isReserveMvtkTicket = purchaseModel.isReserveMvtkTicket();
        assert(isReserveMvtkTicket);
    });

    it('isReserveMvtkTicket 正常 ムビチケなし', () => {
        const purchaseModel = new PurchaseModel({
            reserveTickets: [{ mvtkNum: '' }]
        });
        const isReserveMvtkTicket = purchaseModel.isReserveMvtkTicket();
        assert.strictEqual(isReserveMvtkTicket, false);

        const purchaseModel2 = new PurchaseModel();
        const isReserveMvtkTicket2 = purchaseModel2.isReserveMvtkTicket();
        assert.strictEqual(isReserveMvtkTicket2, false);
    });

    it('getReserveAmount 正常', () => {
        const purchaseModel = new PurchaseModel({
            reserveTickets: [
                { salePrice: 1000 },
                { salePrice: 1000 }
            ]
        });
        const greserveAmount = purchaseModel.getReserveAmount();
        const answer = 2000;
        assert.strictEqual(greserveAmount, answer);
    });

    it('getReserveAmount 正常 予約中チケットなし', () => {
        const purchaseModel = new PurchaseModel();
        const greserveAmount = purchaseModel.getReserveAmount();
        assert.strictEqual(greserveAmount, 0);
    });

    it('getPrice 正常', () => {
        const purchaseModel = new PurchaseModel({
            reserveTickets: [
                {
                    salePrice: 1000,
                    mvtkSalesPrice: 0
                },
                {
                    salePrice: 0,
                    mvtkSalesPrice: 1000
                }
            ]
        });
        const price = purchaseModel.getPrice();
        const answer = 2000;
        assert.strictEqual(price, answer);
    });

    it('getMvtkPrice 正常', () => {
        const purchaseModel = new PurchaseModel({
            reserveTickets: [
                { mvtkSalesPrice: 1000 },
                { mvtkSalesPrice: 1000 }
            ]
        });
        const mvtkPrice = purchaseModel.getMvtkPrice();
        const answer = 2000;
        assert.strictEqual(mvtkPrice, answer);
    });

    it('getMvtkPrice 正常 予約中チケットなし', () => {
        const purchaseModel = new PurchaseModel();
        const greserveAmount = purchaseModel.getReserveAmount();
        assert.strictEqual(greserveAmount, 0);
    });

    it('isExpired 正常 期限内', () => {
        const purchaseModel = new PurchaseModel({
            expired: moment().add(1, 'hours').toDate()
        });
        const isExpired = purchaseModel.isExpired();
        assert.strictEqual(isExpired, false);
    });

    it('isExpired 正常 期限切れ', () => {
        const purchaseModel = new PurchaseModel({
            expired: moment().subtract(1, 'hours').toDate()
        });
        const isExpired = purchaseModel.isExpired();
        assert(isExpired);
    });

    it('getSalesTickets 正常', () => {
        const purchaseModel = new PurchaseModel({
            individualScreeningEvent: {},
            salesTickets: [
                {
                    ticketCode: '',
                    ticketName: '',
                    ticketNameKana: '',
                    ticketNameEng: '',
                    stdPrice: 0,
                    addPrice: 0,
                    salePrice: 0,
                    ticketNote: '',
                    addGlasses: 100
                }
            ]
        });
        const salesTickets = purchaseModel.getSalesTickets();
        const answer = 2;
        assert(salesTickets.length === answer);
    });

    it('getSalesTickets 正常 ムビチケ併用', () => {
        const purchaseModel = new PurchaseModel({
            individualScreeningEvent: {},
            salesTickets: [
                {
                    ticketCode: '',
                    ticketName: '',
                    ticketNameKana: '',
                    ticketNameEng: '',
                    stdPrice: 0,
                    addPrice: 0,
                    salePrice: 0,
                    ticketNote: '',
                    addGlasses: 100
                }
            ],
            mvtk: [
                {
                    code: '',
                    ykknInfo: {
                        ykknKnshbtsmiNum: 1
                    },
                    ticket: {
                        ticketCode: '',
                        ticketName: '',
                        ticketNameKana: '',
                        ticketNameEng: '',
                        addPrice: 0,
                        addPriceGlasses: 100
                    }
                }
            ]
        });
        const salesTickets = purchaseModel.getSalesTickets();
        const answer = 4;
        assert(salesTickets.length === answer);
    });

    it('createOrderId 正常', () => {
        const purchaseModel = new PurchaseModel({
            individualScreeningEvent: {
                coaInfo: {
                    theaterCode: ''
                }
            },
            seatReservationAuthorization: {
                result: {
                    updTmpReserveSeatResult: {
                        tmpReserveNum: ''
                    }
                }
            }
        });
        purchaseModel.createOrderId();
        assert.notStrictEqual(purchaseModel.orderId, null);
        assert(purchaseModel.orderCount === 1);
    });

    it('createOrderId エラー', () => {
        const purchaseModel = new PurchaseModel();
        purchaseModel.createOrderId();
        assert.strictEqual(purchaseModel.orderId, null);
        assert(purchaseModel.orderCount === 0);
    });

    it('getMvtkfilmCode 正常', () => {
        const purchaseModel = new PurchaseModel({
            individualScreeningEvent: {
                coaInfo: {
                    titleCode: '',
                    titleBranchNum: ''
                }
            }
        });
        const mvtkfilmCode = purchaseModel.getMvtkfilmCode();
        assert.strictEqual(typeof mvtkfilmCode, 'string');
        assert(mvtkfilmCode.length > 0);
    });

    it('getMvtkfilmCode　エラー セッション情報なし', () => {
        const purchaseModel = new PurchaseModel();
        const mvtkfilmCode = purchaseModel.getMvtkfilmCode();
        assert.strictEqual(typeof mvtkfilmCode, 'string');
        assert(mvtkfilmCode.length === 0);
    });

    it('getMvtkSeatInfoSync 正常', () => {
        const data = {
            individualScreeningEvent: {
                coaInfo: {
                    theaterCode: '123',
                    titleCode: '',
                    titleBranchNum: '',
                    dateJouei: moment().format('YYYYMMDD'),
                    startDate: moment().toDate(),
                    screenCode: '00'
                }
            },
            seatReservationAuthorization: {
                result: {
                    updTmpReserveSeatResult: {
                        tmpReserveNum: '123'
                    }
                }
            },
            reserveTickets: [
                { mvtkNum: '123', ticketCode: '100', seatCode: 'Ａー１' },
                { mvtkNum: '123', ticketCode: '100', seatCode: 'Ａー２' },
                { mvtkNum: '123', ticketCode: '200', seatCode: 'Ａー３' },
                { mvtkNum: '', ticketCode: '200', seatCode: 'Ａー４' }
            ],
            mvtk: [
                { code: '123', password: 'MTIzNDU2Nzg=', ticket: { ticketCode: '100' }, ykknInfo: { ykknshTyp: '100' } },
                { code: '123', password: 'MTIzNDU2Nzg=', ticket: { ticketCode: '100' }, ykknInfo: { ykknshTyp: '100' } },
                { code: '123', password: 'MTIzNDU2Nzg=', ticket: { ticketCode: '200' }, ykknInfo: { ykknshTyp: '200' } },
                { code: '789', password: 'MTIzNDU2Nzg=', ticket: { ticketCode: '200' }, ykknInfo: { ykknshTyp: '100' } }
            ]
        };
        const purchaseModel = new PurchaseModel(data);
        const mvtkSeatInfoSync = purchaseModel.getMvtkSeatInfoSync();
        if (mvtkSeatInfoSync === null) {
            throw new Error('mvtkSeatInfoSync === null');
        }
        // tslint:disable:max-line-length no-magic-numbers
        assert.strictEqual(mvtkSeatInfoSync.kgygishCd, MvtkUtilModule.COMPANY_CODE);
        assert.strictEqual(mvtkSeatInfoSync.yykDvcTyp, mvtkReserve.services.seat.seatInfoSync.ReserveDeviceType.EntertainerSitePC);
        assert.strictEqual(mvtkSeatInfoSync.trkshFlg, mvtkReserve.services.seat.seatInfoSync.DeleteFlag.False);
        assert.strictEqual(
            mvtkSeatInfoSync.kgygishSstmZskyykNo,
            `${data.individualScreeningEvent.coaInfo.dateJouei}${data.seatReservationAuthorization.result.updTmpReserveSeatResult.tmpReserveNum}`
        );
        assert.strictEqual(mvtkSeatInfoSync.kgygishUsrZskyykNo, data.seatReservationAuthorization.result.updTmpReserveSeatResult.tmpReserveNum);
        assert.strictEqual(mvtkSeatInfoSync.kijYmd, moment(data.individualScreeningEvent.coaInfo.dateJouei).format('YYYY/MM/DD'));
        assert.strictEqual(mvtkSeatInfoSync.stCd, data.individualScreeningEvent.coaInfo.theaterCode.slice(-2));
        assert.strictEqual(mvtkSeatInfoSync.screnCd, data.individualScreeningEvent.coaInfo.screenCode);
    });

    it('getMvtkSeatInfoSync 正常 ムビチケ着券情報なし', () => {
        const data = {
            individualScreeningEvent: {
                coaInfo: {
                    theaterCode: '123',
                    titleCode: '',
                    titleBranchNum: '',
                    dateJouei: moment().format('YYYYMMDD'),
                    startDate: moment().toDate(),
                    screenCode: '00'
                }
            },
            seatReservationAuthorization: {
                result: {
                    updTmpReserveSeatResult: {
                        tmpReserveNum: '123'
                    }
                }
            },
            reserveTickets: [
                { mvtkNum: '', ticketCode: '100', seatCode: 'Ａー１' },
                { mvtkNum: '', ticketCode: '100', seatCode: 'Ａー２' },
                { mvtkNum: '', ticketCode: '200', seatCode: 'Ａー３' },
                { mvtkNum: '', ticketCode: '200', seatCode: 'Ａー４' }
            ],
            mvtk: []
        };
        const purchaseModel = new PurchaseModel(data);
        const mvtkSeatInfoSync = purchaseModel.getMvtkSeatInfoSync();
        assert.strictEqual(mvtkSeatInfoSync, null);
    });

    it('getMvtkSeatInfoSync エラー セッション情報なし', () => {
        const data = {};
        const purchaseModel = new PurchaseModel(data);
        const mvtkSeatInfoSync = purchaseModel.getMvtkSeatInfoSync();
        assert.strictEqual(mvtkSeatInfoSync, null);
    });
});
