/**
 * Purchase.TicketModuleテスト
 */
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as assert from 'assert';
import * as moment from 'moment';
import * as sinon from 'sinon';

import * as TicketForm from '../../../../app/forms/Purchase/TicketForm';
import { MemberType } from '../../../../app/models/Auth/AuthModel';
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

    it('render 正常 会員', async () => {
        const person = sinon.stub(sasaki.service, 'person').returns({
            getContacts: () => {
                return Promise.resolve({
                    familyName: '',
                    givenName: '',
                    email: '',
                    emailConfirm: '',
                    telephone: ''
                });
            },
            findCreditCards: () => {
                return Promise.resolve([
                    { deleteFlag: '0' }
                ]);
            }
        });
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {},
                    individualScreeningEvent: {},
                    seatReservationAuthorization: {}
                },
                auth: {
                    memberType: MemberType.Member
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
        person.restore();
    });

    it('render エラー セッションなし', async () => {
        const req: any = {
            session: undefined
        };
        const res: any = {};
        const next: any = sinon.spy();
        await TicketModule.render(req, res, next);
        assert(next.calledOnce);
    });

    it('render エラー プロパティ', async () => {
        const req: any = {
            session: {}
        };
        const res: any = {};
        const next: any = sinon.spy();
        await TicketModule.render(req, res, next);
        assert(next.calledOnce);
    });

    it('render エラー 期限切れ', async () => {
        const req: any = {
            session: {
                purchase: {
                    individualScreeningEvent: {},
                    expired: moment().subtract(1, 'hours')
                }
            }
        };
        const res: any = {};
        const next: any = sinon.spy();
        await TicketModule.render(req, res, next);
        assert(next.calledOnce);
    });

    it('render エラー アクセス', async () => {
        const req: any = {
            session: {
                purchase: {
                    individualScreeningEvent: {},
                    expired: moment().add(1, 'hours')
                }
            }
        };
        const res: any = {};
        const next: any = sinon.spy();
        await TicketModule.render(req, res, next);
        assert(next.calledOnce);
    });

    // tslint:disable-next-line:max-func-body-length
    it('ticketSelect 正常', async () => {
        const ticketForm = sinon.stub(TicketForm, 'default').returns({});
        const placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
            changeSeatReservationOffers: () => {
                return Promise.resolve({
                    result: {
                        updTmpReserveSeatResult: {
                            tmpReserveNum: '123'
                        }
                    }
                });
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
                    seatReservationAuthorization: {},
                    mvtkAuthorization: {
                        id: ''
                    },
                    salesTickets: [
                        { ticketCode: '100', limitUnit: '001', limitCount: 1, mvtkNum: '' },
                        { ticketCode: '200', limitUnit: '001', limitCount: 1, mvtkNum: '200' }
                    ],
                    mvtk: [
                        {
                            code: '200',
                            password: 'MTIzNDU2Nzg=',
                            ticket: {
                                ticketCode: '200',
                                ticketName: '',
                                ticketNameEng: '',
                                ticketNameKana: '',
                                addPrice: 0,
                                addPriceGlasses: 0
                            },
                            ykknInfo: {
                                kijUnip: '0',
                                eishhshkTyp: '100',
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
                    { mvtkNum: '', section: '', ticketCode: '100', glasses: false, ticketName: '', seatCode: 'Ａー１' },
                    { mvtkNum: '200', section: '', ticketCode: '200', glasses: false, ticketName: '', seatCode: 'Ａー２' }
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
    });

    it('ticketSelect エラー セッションなし', async () => {
        const req: any = {
            session: undefined
        };
        const res: any = {};
        const next: any = sinon.spy();
        await TicketModule.ticketSelect(req, res, next);
        assert(next.calledOnce);
    });

    it('ticketSelect エラー 期限切れ', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().subtract(1, 'hours')
                }
            }
        };
        const res: any = {};
        const next: any = sinon.spy();
        await TicketModule.ticketSelect(req, res, next);
        assert(next.calledOnce);
    });

    it('ticketSelect エラー プロパティ', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours')
                }
            }
        };
        const res: any = {};
        const next: any = sinon.spy();
        await TicketModule.ticketSelect(req, res, next);
        assert(next.calledOnce);
    });

    it('ticketSelect エラー 取引ID不整合', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours'),
                    transaction: {
                        id: '123'
                    },
                    individualScreeningEvent: {},
                    seatReservationAuthorization: {}
                }
            },
            body: {
                transactionId: '456'
            }
        };
        const res: any = {};
        const next: any = sinon.spy();
        await TicketModule.ticketSelect(req, res, next);
        assert(next.calledOnce);
    });

});
