/**
 * Purchase.InputModuleテスト
 */
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as assert from 'assert';
import { PhoneNumberUtil } from 'google-libphonenumber';
import * as moment from 'moment';
import * as sinon from 'sinon';
import * as InputForm from '../../../../app/forms/Purchase/InputForm';
import { MemberType } from '../../../../app/models/Auth/AuthModel';
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

    it('render 正常 再表示', async () => {
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
        await InputModule.render(req, res, next);
        assert(res.render.calledOnce);
    });

    it('render 正常 会員', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {},
                    seatReservationAuthorization: {},
                    profile: {}
                },
                auth: {
                    memberType: MemberType.Member
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

    it('render エラー セッションなし', async () => {
        const req: any = {
            session: undefined
        };
        const res: any = {};
        const next: any = sinon.spy();
        await InputModule.render(req, res, next);
        assert(next.calledOnce);
    });

    it('render エラー 期限切れ', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().subtract(1, 'hours').toDate()
                }
            }
        };
        const res: any = {};
        const next: any = sinon.spy();
        await InputModule.render(req, res, next);
        assert(next.calledOnce);
    });

    it('render エラー アクセス', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate()
                }
            }
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
        const phoneNumberUtil = sinon.stub(PhoneNumberUtil, 'getInstance').returns({
            parse: () => {
                return {};
            },
            isValidNumber: () => {
                return true;
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
        phoneNumberUtil.restore();
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

    it('purchaserInformationRegistration バリデーション 電話番号', async () => {
        const inputForm = sinon.stub(InputForm, 'default').returns({});
        const phoneNumberUtil = sinon.stub(PhoneNumberUtil, 'getInstance').returns({
            parse: () => {
                return {};
            },
            isValidNumber: () => {
                return false;
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
            },
            __: () => {
                return '';
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
        phoneNumberUtil.restore();
    });

    it('purchaserInformationRegistration エラー セッションなし', async () => {
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

    it('purchaserInformationRegistration エラー 期限切れ', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().subtract(1, 'hours').toDate()
                }
            }
        };
        const res: any = {};
        const next: any = sinon.spy();
        await InputModule.purchaserInformationRegistration(req, res, next);
        assert(next.calledOnce);
    });

    it('purchaserInformationRegistration エラー transactionなし', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate()
                }
            }
        };
        const res: any = {};
        const next: any = sinon.spy();
        await InputModule.purchaserInformationRegistration(req, res, next);
        assert(next.calledOnce);
    });

    it('purchaserInformationRegistration エラー 取引id不整合', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: '123'
                    }
                }
            },
            body: {
                transactionId: '456'
            }
        };
        const res: any = {};
        const next: any = sinon.spy();
        await InputModule.purchaserInformationRegistration(req, res, next);
        assert(next.calledOnce);
    });

    it('purchaserInformationRegistration 正常 クレジットカード処理失敗', async () => {
        const inputForm = sinon.stub(InputForm, 'default').returns({});
        const placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
            setCustomerContact: () => {
                return Promise.resolve({});
            },
            cancelCreditCardAuthorization: () => {
                return Promise.resolve({});
            },
            createCreditCardAuthorization: () => {
                return Promise.reject(new Error());
            }
        });
        const phoneNumberUtil = sinon.stub(PhoneNumberUtil, 'getInstance').returns({
            parse: () => {
                return {};
            },
            isValidNumber: () => {
                return true;
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
            },
            __: () => {
                return '';
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
        placeOrder.restore();
        phoneNumberUtil.restore();
    });

    it('purchaserInformationRegistrationOfMember 正常', async () => {
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
        const person = sinon.stub(sasaki.service, 'person').returns({
            deleteCreditCard: () => {
                return Promise.resolve({});
            },
            addCreditCard: () => {
                return Promise.resolve({});
            }
        });
        const phoneNumberUtil = sinon.stub(PhoneNumberUtil, 'getInstance').returns({
            parse: () => {
                return {};
            },
            isValidNumber: () => {
                return true;
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
                    creditCards: [{}],
                    profile: {}
                },
                auth: {
                    memberType: MemberType.Member
                }
            },
            body: {
                transactionId: '',
                creditCardRegistration: true,
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
        await InputModule.purchaserInformationRegistrationOfMember(req, res, next);
        assert(res.redirect.calledOnce);
        inputForm.restore();
        placeOrder.restore();
        person.restore();
        phoneNumberUtil.restore();
    });

    it('purchaserInformationRegistrationOfMember バリデーション', async () => {
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
                    creditCards: [],
                    profile: {}
                },
                auth: {
                    memberType: MemberType.Member
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
        await InputModule.purchaserInformationRegistrationOfMember(req, res, next);
        assert(res.render.calledOnce);
        inputForm.restore();
    });

    it('purchaserInformationRegistrationOfMember バリデーション 電話番号', async () => {
        const inputForm = sinon.stub(InputForm, 'default').returns({});
        const phoneNumberUtil = sinon.stub(PhoneNumberUtil, 'getInstance').returns({
            parse: () => {
                return {};
            },
            isValidNumber: () => {
                return false;
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
                    creditCards: [],
                    profile: {}
                },
                auth: {
                    memberType: MemberType.Member
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
            },
            __: () => {
                return '';
            }
        };
        const res: any = {
            locals: {},
            render: sinon.spy()
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        await InputModule.purchaserInformationRegistrationOfMember(req, res, next);
        assert(res.render.calledOnce);
        inputForm.restore();
        phoneNumberUtil.restore();
    });

    it('purchaserInformationRegistrationOfMember エラー セッションなし', async () => {
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
        await InputModule.purchaserInformationRegistrationOfMember(req, res, next);
        assert(next.calledOnce);
    });

    it('purchaserInformationRegistrationOfMember エラー 非会員', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().subtract(1, 'hours').toDate()
                },
                auth: {
                    memberType: MemberType.NonMember
                }
            }
        };
        const res: any = {};
        const next: any = sinon.spy();
        await InputModule.purchaserInformationRegistrationOfMember(req, res, next);
        assert(next.calledOnce);
    });

    it('purchaserInformationRegistrationOfMember エラー 期限切れ', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().subtract(1, 'hours').toDate()
                },
                auth: {
                    memberType: MemberType.Member
                }
            }
        };
        const res: any = {};
        const next: any = sinon.spy();
        await InputModule.purchaserInformationRegistrationOfMember(req, res, next);
        assert(next.calledOnce);
    });

    it('purchaserInformationRegistrationOfMember エラー transactionなし', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate()
                },
                auth: {
                    memberType: MemberType.Member
                }
            }
        };
        const res: any = {};
        const next: any = sinon.spy();
        await InputModule.purchaserInformationRegistrationOfMember(req, res, next);
        assert(next.calledOnce);
    });

    it('purchaserInformationRegistrationOfMember エラー 取引id不整合', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: '123'
                    },
                    profile: {}
                },
                auth: {
                    memberType: MemberType.Member
                }
            },
            body: {
                transactionId: '456'
            }
        };
        const res: any = {};
        const next: any = sinon.spy();
        await InputModule.purchaserInformationRegistrationOfMember(req, res, next);
        assert(next.calledOnce);
    });

    it('purchaserInformationRegistrationOfMember 正常 クレジットカード処理失敗', async () => {
        const inputForm = sinon.stub(InputForm, 'default').returns({});
        const placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
            setCustomerContact: () => {
                return Promise.resolve({});
            },
            cancelCreditCardAuthorization: () => {
                return Promise.resolve({});
            },
            createCreditCardAuthorization: () => {
                return Promise.reject(new Error());
            }
        });
        const phoneNumberUtil = sinon.stub(PhoneNumberUtil, 'getInstance').returns({
            parse: () => {
                return {};
            },
            isValidNumber: () => {
                return true;
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
                    creditCards: [],
                    profile: {}
                },
                auth: {
                    memberType: MemberType.Member
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
            },
            __: () => {
                return '';
            }
        };
        const res: any = {
            locals: {},
            render: sinon.spy()
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        await InputModule.purchaserInformationRegistrationOfMember(req, res, next);
        assert(res.render.calledOnce);
        inputForm.restore();
        placeOrder.restore();
        phoneNumberUtil.restore();
    });
});
