/**
 * Purchase.InputModuleテスト
 */
import * as sasaki from '@motionpicture/sasaki-api-nodejs';
import * as assert from 'assert';
import * as moment from 'moment';
import * as sinon from 'sinon';

import * as InputForm from '../../../../app/forms/Purchase/InputForm';
import * as InputModule from '../../../../app/modules/Purchase/InputModule';

describe('Purchase.InputModule', () => {

    it('render 正常', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {},
                    seatReservationAuthorization: {}
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
        await InputModule.render(req, res, next);
        assert(res.render.calledOnce);
    });

    it('render エラー', async () => {
        const req: any = {
            session: undefined
        };
        const res: any = {};
        const next: any = sinon.spy();
        await InputModule.render(req, res, next);
        assert(next.calledOnce);
    });

    it('purchaserInformationRegistration 正常', async () => {
        const inputForm = sinon.stub(InputForm, 'default').returns({});
        const placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
            setCustomerContact: () => {
                return Promise.resolve({});
            },
            cancelCreditCardAuthorization: () => {
                return Promise.resolve({});
            },
            createCreditCardAuthorization: () => {
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
                    creditCardAuthorization: {
                        id: ''
                    },
                    reserveTickets: [
                        { salePrice: 1000 }
                    ],
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
                    },
                    orderCount: 0,
                    creditCards: []
                }
            },
            body: {
                transactionId: '',
                gmoTokenObject: JSON.stringify({ token: '' })
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
        await InputModule.purchaserInformationRegistration(req, res, next);
        assert(res.redirect.calledOnce);
        inputForm.restore();
        placeOrder.restore();
    });

    it('purchaserInformationRegistration バリデーション', async () => {
        const inputForm = sinon.stub(InputForm, 'default').returns({});
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: ''
                    },
                    creditCardAuthorization: {
                        id: ''
                    },
                    reserveTickets: [
                        { salePrice: 1000 }
                    ],
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
                    },
                    orderCount: 0,
                    creditCards: []
                }
            },
            body: {
                transactionId: '',
                gmoTokenObject: JSON.stringify({ token: '' })
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
        await InputModule.purchaserInformationRegistration(req, res, next);
        assert(res.render.calledOnce);
        inputForm.restore();
    });

    it('purchaserInformationRegistration エラー', async () => {
        const req: any = {
            session: undefined,
            body: {
                transactionId: '',
                gmoTokenObject: JSON.stringify({ token: '' })
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
        const res: any = {};
        const next: any = sinon.spy();
        await InputModule.purchaserInformationRegistration(req, res, next);
        assert(next.calledOnce);
    });
});
