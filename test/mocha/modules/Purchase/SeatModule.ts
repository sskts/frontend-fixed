/**
 * Purchase.SeatModuleテスト
 */
import * as COA from '@motionpicture/coa-service';
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as assert from 'assert';
import * as moment from 'moment';
import * as sinon from 'sinon';

import * as SeatForm from '../../../../app/forms/Purchase/SeatForm';
import * as SeatModule from '../../../../app/modules/Purchase/SeatModule';

describe('Purchase.SeatModule', () => {

    it('render 正常', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {},
                    seatReservationAuthorization: {}
                }
            },
            params: {
                id: ''
            }
        };
        const res: any = {
            locals: {},
            render: sinon.spy()
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        await SeatModule.render(req, res, next);
        assert(res.render.calledOnce);
    });

    it('render エラー', async () => {
        const req: any = {
            session: undefined
        };
        const res: any = {};
        const next: any = sinon.spy();
        await SeatModule.render(req, res, next);
        assert(next.calledOnce);
    });

    it('performanceChange 正常', async () => {
        const event = sinon.stub(sasaki.service, 'event').returns({
            findIndividualScreeningEvent: () => {
                return Promise.resolve({});
            }
        });
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {},
                    seatReservationAuthorization: {}
                }
            },
            query: {
                performanceId: ''
            },
            params: {
                id: ''
            }
        };
        const res: any = {
            locals: {},
            json: sinon.spy()
        };
        await SeatModule.performanceChange(req, res);
        assert(res.json.calledOnce);
        assert.strictEqual(res.json.args[0][0].err, null);
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
        await SeatModule.performanceChange(req, res);
        assert(res.json.calledOnce);
        assert.strictEqual(res.json.args[0][0].result, null);
        assert.notStrictEqual(res.json.args[0][0].err, null);
    });

    it('seatSelect 正常', async () => {
        const seatSelect = sinon.stub(SeatForm, 'seatSelect').returns({});
        const placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
            cancelSeatReservationAuthorization: () => {
                return Promise.resolve({});
            },
            createSeatReservationAuthorization: () => {
                return Promise.resolve({});
            }
        });
        const salesTicket = sinon.stub(COA.services.reserve, 'salesTicket').returns(
            Promise.resolve([{
                ticketCode: '',
                ticketName: '',
                ticketNameEng: '',
                ticketNameKana: '',
                stdPrice: '',
                addPrice: '',
                salePrice: ''
            }])
        );
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: ''
                    },
                    seatReservationAuthorization: {},
                    individualScreeningEvent: {
                        identifier: '',
                        coaInfo: {
                            theaterCode: '',
                            dateJouei: '',
                            titleCode: '',
                            titleBranchNum: '',
                            timeBegin: ''
                        }
                    }
                }
            },
            params: {
                id: ''
            },
            body: {
                transactionId: '',
                seats: JSON.stringify({
                    listTmpReserve: [{
                        seatSection: '',
                        seatNum: ''
                    }]
                })
            },
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return true;
                    },
                    mapped: () => {
                        return;
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
        await SeatModule.seatSelect(req, res, next);
        assert(res.redirect.calledOnce);
        seatSelect.restore();
        placeOrder.restore();
        salesTicket.restore();
    });

    it('seatSelect バリデーション', async () => {
        const seatSelect = sinon.stub(SeatForm, 'seatSelect').returns({});
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: ''
                    },
                    individualScreeningEvent: {
                        identifier: '',
                        coaInfo: {
                            theaterCode: '',
                            dateJouei: '',
                            titleCode: '',
                            titleBranchNum: '',
                            timeBegin: ''
                        }
                    }
                }
            },
            params: {
                id: ''
            },
            body: {
                transactionId: ''
            },
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return false;
                    },
                    mapped: () => {
                        return;
                    }
                });
            }
        };
        const res: any = {
            locals: {},
            render: sinon.spy()
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        await SeatModule.seatSelect(req, res, next);
        assert(res.render.calledOnce);
        seatSelect.restore();
    });

    it('seatSelect エラー', async () => {
        const req: any = {
            session: undefined
        };
        const res: any = {};
        const next: any = sinon.spy();
        await SeatModule.seatSelect(req, res, next);
        assert(next.calledOnce);
    });

    it('getScreenStateReserve 正常', async () => {
        const seatSelect = sinon.stub(SeatForm, 'screenStateReserve').returns({});
        const stateReserveSeat = sinon.stub(COA.services.reserve, 'stateReserveSeat').returns(
            Promise.resolve({})
        );
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: ''
                    }
                }
            },
            body: {
                theaterCode: '112',
                dateJouei: '',
                titleCode: '',
                titleBranchNum: '',
                timeBegin: '',
                screenCode: '10'
            },
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return true;
                    },
                    mapped: () => {
                        return;
                    }
                });
            }
        };
        const res: any = {
            locals: {},
            json: sinon.spy()
        };
        await SeatModule.getScreenStateReserve(req, res);
        assert(res.json.calledOnce);
        assert.strictEqual(res.json.args[0][0].err, null);
        assert.notStrictEqual(res.json.args[0][0].result, null);
        seatSelect.restore();
        stateReserveSeat.restore();
    });

    it('getScreenStateReserve バリデーション', async () => {
        const screenStateReserve = sinon.stub(SeatForm, 'screenStateReserve').returns({});
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: ''
                    }
                }
            },
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return false;
                    },
                    mapped: () => {
                        return;
                    }
                });
            }
        };
        const res: any = {
            locals: {},
            json: sinon.spy()
        };
        await SeatModule.getScreenStateReserve(req, res);
        assert(res.json.calledOnce);
        assert.strictEqual(res.json.args[0][0].result, null);
        assert.notStrictEqual(res.json.args[0][0].err, null);
        screenStateReserve.restore();
    });

    it('saveSalesTickets 正常', async () => {
        const salesTickets = sinon.stub(SeatForm, 'salesTickets').returns({});
        const salesTicket = sinon.stub(COA.services.reserve, 'salesTicket').returns(
            Promise.resolve({})
        );
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: ''
                    }
                }
            },
            body: {
                theaterCode: '',
                dateJouei: '',
                titleCode: '',
                titleBranchNum: '',
                timeBegin: ''
            },
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return true;
                    },
                    mapped: () => {
                        return;
                    }
                });
            }
        };
        const res: any = {
            locals: {},
            json: sinon.spy()
        };
        await SeatModule.saveSalesTickets(req, res);
        assert(res.json.calledOnce);
        assert.strictEqual(res.json.args[0][0].err, null);
        salesTickets.restore();
        salesTicket.restore();
    });

    it('saveSalesTickets バリデーション', async () => {
        const salesTickets = sinon.stub(SeatForm, 'salesTickets').returns({});
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: ''
                    }
                }
            },
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return false;
                    },
                    mapped: () => {
                        return;
                    }
                });
            }
        };
        const res: any = {
            locals: {},
            json: sinon.spy()
        };
        await SeatModule.saveSalesTickets(req, res);
        assert(res.json.calledOnce);
        assert.notStrictEqual(res.json.args[0][0].err, null);
        salesTickets.restore();
    });

});
