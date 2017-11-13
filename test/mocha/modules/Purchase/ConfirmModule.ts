/**
 * Purchase.ConfirmModuleテスト
 */
import * as MVTK from '@motionpicture/mvtk-reserve-service';
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as assert from 'assert';
import * as moment from 'moment';
import * as sinon from 'sinon';

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

    it('render エラー セッションなし', async () => {
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

    it('render エラー 期限切れ', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().subtract(1, 'hours')
                }
            }
        };
        const res: any = {
            locals: {}
        };
        const next: any = sinon.spy();
        await ConfirmModule.render(req, res, next);
        assert(next.calledOnce);
    });

    it('render エラー 期限切れ', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().subtract(1, 'hours')
                }
            }
        };
        const res: any = {
            locals: {}
        };
        const next: any = sinon.spy();
        await ConfirmModule.render(req, res, next);
        assert(next.calledOnce);
    });

    it('render エラー アクセス', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours')
                }
            }
        };
        const res: any = {
            locals: {}
        };
        const next: any = sinon.spy();
        await ConfirmModule.render(req, res, next);
        assert(next.calledOnce);
    });

    it('cancelMvtk 正常', async () => {
        const createSeatInfoSyncService = sinon.stub(MVTK.services.seat.seatInfoSync, 'seatInfoSync').returns(
            Promise.resolve({
                zskyykResult: MVTK.services.seat.seatInfoSync.ReservationResult.CancelSuccess
            })
        );
        const req: any = {
            session: {
                purchase: {
                    individualScreeningEvent: {
                        coaInfo: {
                            theaterCode: '123',
                            titleCode: '',
                            titleBranchNum: '',
                            dateJouei: moment().format('YYYYMMDD'),
                            startDate: moment().toDate(),
                            screenCode: '00'
                        },
                        superEvent: {
                            location: {
                                name: { ja: '' }
                            }
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
                }
            }
        };
        const res: any = {
            locals: {},
            json: sinon.spy()
        };
        await ConfirmModule.cancelMvtk(req, res);
        assert.strictEqual(res.json.args[0][0].isSuccess, true);
        createSeatInfoSyncService.restore();
    });

    it('cancelMvtk エラー 取消失敗', async () => {
        const createSeatInfoSyncService = sinon.stub(MVTK.services.seat.seatInfoSync, 'seatInfoSync').returns(
            Promise.resolve({
                zskyykResult: MVTK.services.seat.seatInfoSync.ReservationResult.CancelFailure
            })
        );
        const req: any = {
            session: {
                purchase: {
                    individualScreeningEvent: {
                        coaInfo: {
                            theaterCode: '123',
                            titleCode: '',
                            titleBranchNum: '',
                            dateJouei: moment().format('YYYYMMDD'),
                            startDate: moment().toDate(),
                            screenCode: '00'
                        },
                        superEvent: {
                            location: {
                                name: { ja: '' }
                            }
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
                }
            }
        };
        const res: any = {
            locals: {},
            json: sinon.spy()
        };
        await ConfirmModule.cancelMvtk(req, res);
        assert.strictEqual(res.json.args[0][0].isSuccess, false);
        createSeatInfoSyncService.restore();
    });

    it('cancelMvtk エラー セッションなし', async () => {
        const req: any = {
            session: undefined
        };
        const res: any = {
            locals: {},
            json: sinon.spy()
        };
        await ConfirmModule.cancelMvtk(req, res);
        assert.strictEqual(res.json.args[0][0].isSuccess, false);
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

    it('purchase 正常 ムビチケ', async () => {
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

        const createSeatInfoSyncService = sinon.stub(MVTK.services.seat.seatInfoSync, 'seatInfoSync').returns(
            Promise.resolve({
                zskyykResult: MVTK.services.seat.seatInfoSync.ReservationResult.Success
            })
        );

        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: { id: '' },
                    individualScreeningEvent: {
                        coaInfo: {
                            theaterCode: '123',
                            titleCode: '',
                            titleBranchNum: '',
                            dateJouei: moment().format('YYYYMMDD'),
                            startDate: moment().toDate(),
                            screenCode: '00'
                        },
                        superEvent: {
                            location: {
                                name: { ja: '' }
                            }
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
                    ],
                    profile: {}
                }
            },
            body: {
                transactionId: ''
            },
            __: () => {
                return '';
            },
            headers: { host: '' }
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
        createSeatInfoSyncService.restore();
    });

    it('purchase エラー ムビチケ', async () => {
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

        const createSeatInfoSyncService = sinon.stub(MVTK.services.seat.seatInfoSync, 'seatInfoSync').returns(
            Promise.resolve({
                zskyykResult: MVTK.services.seat.seatInfoSync.ReservationResult.FailureOther
            })
        );

        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: { id: '' },
                    individualScreeningEvent: {
                        coaInfo: {
                            theaterCode: '123',
                            titleCode: '',
                            titleBranchNum: '',
                            dateJouei: moment().format('YYYYMMDD'),
                            startDate: moment().toDate(),
                            screenCode: '00'
                        },
                        superEvent: {
                            location: {
                                name: { ja: '' }
                            }
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
                    ],
                    profile: {}
                }
            },
            body: {
                transactionId: ''
            },
            __: () => {
                return '';
            },
            headers: { host: '' }
        };
        const res: any = {
            locals: {},
            render: () => '',
            json: sinon.spy()
        };
        await ConfirmModule.purchase(req, res);
        assert.strictEqual(res.json.args[0][0].result, null);
        assert.notStrictEqual(res.json.args[0][0].err, null);
        placeOrder.restore();
        place.restore();
        createSeatInfoSyncService.restore();
    });

    it('purchase エラー セッションなし', async () => {
        const req: any = {
            session: undefined,
            __: () => {
                return '';
            }
        };
        const res: any = {
            json: sinon.spy()
        };
        await ConfirmModule.purchase(req, res);
        assert.strictEqual(res.json.args[0][0].result, null);
        assert.notStrictEqual(res.json.args[0][0].err, null);
    });

    it('purchase エラー プロパティ', async () => {
        const req: any = {
            session: {
                purchase: {}
            },
            __: () => {
                return '';
            }
        };
        const res: any = {
            json: sinon.spy()
        };
        await ConfirmModule.purchase(req, res);
        assert.strictEqual(res.json.args[0][0].result, null);
        assert.notStrictEqual(res.json.args[0][0].err, null);
    });

    it('purchase エラー アクセス', async () => {
        const req: any = {
            session: {
                purchase: {
                    transaction: {
                        id: '123'
                    },
                    individualScreeningEvent: {},
                    profile: {},
                    seatReservationAuthorization: {
                        result: {}
                    }
                }
            },
            body: {
                transactionId: '456'
            },
            __: () => {
                return '';
            }
        };
        const res: any = {
            json: sinon.spy()
        };
        await ConfirmModule.purchase(req, res);
        assert.strictEqual(res.json.args[0][0].result, null);
        assert.notStrictEqual(res.json.args[0][0].err, null);
    });

    it('purchase エラー 期限切れ', async () => {
        const req: any = {
            session: {
                purchase: {
                    transaction: {
                        id: ''
                    },
                    individualScreeningEvent: {},
                    profile: {},
                    seatReservationAuthorization: {
                        result: {}
                    },
                    expired: moment().subtract(1, 'hours')
                }
            },
            body: {
                transactionId: ''
            },
            __: () => {
                return '';
            }
        };
        const res: any = {
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

    it('getCompleteData エラー セッションなし', async () => {
        const req: any = {
            session: undefined,
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

    it('getCompleteData エラー completeセッションなし', async () => {
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
