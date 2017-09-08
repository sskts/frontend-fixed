/**
 * Purchase.TicketModuleテスト
 */
import * as sasaki from '@motionpicture/sasaki-api-nodejs';
import * as assert from 'assert';
import * as moment from 'moment';
import * as sinon from 'sinon';

import * as TicketForm from '../../../../app/forms/Purchase/TicketForm';
import { PurchaseModel } from '../../../../app/models/Purchase/PurchaseModel';
import * as TicketModule from '../../../../app/modules/Purchase/TicketModule';

describe('Purchase.TicketModule', () => {

    it('render 正常', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {},
                    individualScreeningEvent: {},
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
        await TicketModule.render(req, res, next);
        assert(res.render.calledOnce);
    });

    it('render エラー', async () => {
        const req: any = {
            session: undefined
        };
        const res: any = {};
        const next: any = sinon.spy();
        await TicketModule.render(req, res, next);
        assert(next.calledOnce);
    });

    // tslint:disable-next-line:max-func-body-length
    it('ticketSelect 正常', async () => {
        const getMvtkSeatInfoSync = sinon.stub(PurchaseModel.prototype, 'getMvtkSeatInfoSync').returns({
            knyknrNoInfo: [
                { knshInfo: [] }
            ],
            zskInfo: []
        });
        const ticketForm = sinon.stub(TicketForm, 'default').returns({});
        const placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
            createSeatReservationAuthorization: () => {
                return Promise.resolve({});
            },
            cancelSeatReservationAuthorization: () => {
                return Promise.resolve({});
            },
            cancelMvtkAuthorization: () => {
                return Promise.resolve({});
            },
            createMvtkAuthorization: () => {
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
                    individualScreeningEvent: {},
                    seatReservationAuthorization: {
                        id: ''
                    },
                    mvtkAuthorization: {
                        id: ''
                    },
                    salesTickets: [
                        {
                            ticketCode: '',
                            limitUnit: '001',
                            limitCount: 1
                        }
                    ],
                    mvtk: [
                        {
                            code: '1',
                            ticket: {
                                ticketCode: '',
                                ticketName: '',
                                ticketNameEng: '',
                                ticketNameKana: '',
                                addPrice: 0,
                                addPriceGlasses: 0
                            },
                            ykknInfo: {
                                kijUnip: '0',
                                eishhshkTyp: '0',
                                dnshKmTyp: '',
                                znkkkytsknGkjknTyp: '',
                                ykknshTyp: '',
                                knshknhmbiUnip: '0'
                            }
                        }
                    ]
                }
            },
            body: {
                transactionId: '',
                reserveTickets: JSON.stringify([
                    {
                        mvtkNum: '1',
                        section: '',
                        ticketCode: '',
                        glasses: false,
                        ticketName: ''
                    },
                    {
                        mvtkNum: '',
                        section: '',
                        ticketCode: '',
                        glasses: false,
                        ticketName: ''
                    }
                ])
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
        await TicketModule.ticketSelect(req, res, next);
        assert(res.redirect.calledOnce);
        ticketForm.restore();
        placeOrder.restore();
        getMvtkSeatInfoSync.restore();
    });

    it('ticketSelect 制限単位バリデーション', async () => {
        const getMvtkSeatInfoSync = sinon.stub(PurchaseModel.prototype, 'getMvtkSeatInfoSync').returns({
            knyknrNoInfo: [
                { knshInfo: [] }
            ],
            zskInfo: []
        });
        const ticketForm = sinon.stub(TicketForm, 'default').returns({});
        const placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
            createSeatReservationAuthorization: () => {
                return Promise.resolve({});
            },
            cancelSeatReservationAuthorization: () => {
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
                    individualScreeningEvent: {},
                    seatReservationAuthorization: {
                        id: ''
                    },
                    mvtkAuthorization: {
                        id: ''
                    },
                    salesTickets: [
                        {
                            ticketCode: '',
                            limitUnit: '001',
                            limitCount: 2
                        }
                    ]
                }
            },
            body: {
                transactionId: '',
                reserveTickets: JSON.stringify([
                    {
                        mvtkNum: '',
                        section: '',
                        ticketCode: '',
                        glasses: false,
                        ticketName: ''
                    }
                ])
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
            render: sinon.spy()
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        await TicketModule.ticketSelect(req, res, next);
        assert(res.render.calledOnce);
        ticketForm.restore();
        placeOrder.restore();
        getMvtkSeatInfoSync.restore();
    });

    it('ticketSelect エラー', async () => {
        const req: any = {
            session: undefined
        };
        const res: any = {};
        const next: any = sinon.spy();
        await TicketModule.ticketSelect(req, res, next);
        assert(next.calledOnce);
    });

});
