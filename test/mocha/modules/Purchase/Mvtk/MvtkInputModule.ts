/**
 * Purchase.Mvtk.MvtkInputModuleテスト
 */
import * as COA from '@motionpicture/coa-service';
import * as MVTK from '@motionpicture/mvtk-service';
import * as assert from 'assert';
import * as moment from 'moment';
import * as sinon from 'sinon';

import * as MvtkInputForm from '../../../../../app/forms/Purchase/Mvtk/MvtkInputForm';
import * as MvtkInputModule from '../../../../../app/modules/Purchase/Mvtk/MvtkInputModule';

describe('Purchase.Mvtk.MvtkInputModule', () => {

    it('render 正常', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {}
                },
                mvtk: []
            }
        };
        const res: any = {
            locals: {},
            render: sinon.spy()
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        await MvtkInputModule.render(req, res, next);
        assert(res.render.calledOnce);
    });

    it('render エラー セッションなし', async () => {
        const req: any = {
            session: undefined
        };
        const res: any = {};
        const next: any = sinon.spy();
        await MvtkInputModule.render(req, res, next);
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
        const res: any = {};
        const next: any = sinon.spy();
        await MvtkInputModule.render(req, res, next);
        assert(next.calledOnce);
    });

    it('render エラー プロパティ', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours')
                }
            }
        };
        const res: any = {};
        const next: any = sinon.spy();
        await MvtkInputModule.render(req, res, next);
        assert(next.calledOnce);
    });

    it('select 正常', async () => {
        const mvtkInputForm = sinon.stub(MvtkInputForm, 'default').returns({});
        const purchaseNumberAuth = sinon.stub(MVTK, 'createPurchaseNumberAuthService').returns({
            purchaseNumberAuth: () => {
                return Promise.resolve([{
                    knyknrNo: '',
                    ykknInfo: [{}]
                }]);
            }
        });
        const mvtkTicketcode = sinon.stub(COA.services.master, 'mvtkTicketcode').returns(
            Promise.resolve({})
        );

        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: ''
                    },
                    individualScreeningEvent: {
                        coaInfo: {
                            theaterCode: '',
                            dateJouei: ''
                        }
                    }
                },
                mvtk: []
            },
            body: {
                transactionId: '',
                mvtk: JSON.stringify([{ code: '', password: '' }])
            },
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return true;
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
        await MvtkInputModule.select(req, res, next);
        assert(res.redirect.calledOnce);
        mvtkInputForm.restore();
        purchaseNumberAuth.restore();
        mvtkTicketcode.restore();
    });

    it('select 正常 ムビチケ認証失敗', async () => {
        const mvtkInputForm = sinon.stub(MvtkInputForm, 'default').returns({});
        const purchaseNumberAuth = sinon.stub(MVTK, 'createPurchaseNumberAuthService').returns({
            purchaseNumberAuth: () => {
                return Promise.resolve([{
                    knyknrNoMkujyuCd: {},
                    ykknInfo: []
                }]);
            }
        });
        const mvtkTicketcode = sinon.stub(COA.services.master, 'mvtkTicketcode').returns(
            Promise.resolve({})
        );

        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: ''
                    },
                    individualScreeningEvent: {
                        coaInfo: {
                            theaterCode: '',
                            dateJouei: ''
                        }
                    }
                },
                mvtk: []
            },
            body: {
                transactionId: '',
                mvtk: JSON.stringify([{ code: '', password: '' }])
            },
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return true;
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
        await MvtkInputModule.select(req, res, next);
        assert(res.render.calledOnce);
        mvtkInputForm.restore();
        purchaseNumberAuth.restore();
        mvtkTicketcode.restore();
    });

    it('select エラー ムビチケ認証失敗', async () => {
        const mvtkInputForm = sinon.stub(MvtkInputForm, 'default').returns({});
        const purchaseNumberAuth = sinon.stub(MVTK, 'createPurchaseNumberAuthService').returns({
            purchaseNumberAuth: () => {
                return Promise.reject({});
            }
        });
        const mvtkTicketcode = sinon.stub(COA.services.master, 'mvtkTicketcode').returns(
            Promise.resolve({})
        );

        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: ''
                    },
                    individualScreeningEvent: {
                        coaInfo: {
                            theaterCode: '',
                            dateJouei: ''
                        }
                    }
                },
                mvtk: []
            },
            body: {
                transactionId: '',
                mvtk: JSON.stringify([{ code: '', password: '' }])
            },
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return true;
                    }
                });
            }
        };
        const res: any = {};
        const next: any = sinon.spy();
        await MvtkInputModule.select(req, res, next);
        assert(next.calledOnce);
        mvtkInputForm.restore();
        purchaseNumberAuth.restore();
        mvtkTicketcode.restore();
    });

    it('select エラー セッションなし', async () => {
        const req: any = {
            session: undefined
        };
        const res: any = {};
        const next: any = sinon.spy();
        await MvtkInputModule.select(req, res, next);
        assert(next.calledOnce);
    });

    it('select エラー 期限切れ', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().subtract(1, 'hours').toDate()
                }
            }
        };
        const res: any = {};
        const next: any = sinon.spy();
        await MvtkInputModule.select(req, res, next);
        assert(next.calledOnce);
    });

    it('select エラー プロパティ', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate()
                }
            }
        };
        const res: any = {};
        const next: any = sinon.spy();
        await MvtkInputModule.select(req, res, next);
        assert(next.calledOnce);
    });

    it('select エラー 取引ID不整合', async () => {
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: '123'
                    },
                    individualScreeningEvent: {}
                }
            },
            body: {
                transactionId: '456'
            }
        };
        const res: any = {};
        const next: any = sinon.spy();
        await MvtkInputModule.select(req, res, next);
        assert(next.calledOnce);
    });

    it('select エラー バリデーション', async () => {
        const mvtkInputForm = sinon.stub(MvtkInputForm, 'default').returns({});
        const req: any = {
            session: {
                purchase: {
                    expired: moment().add(1, 'hours').toDate(),
                    transaction: {
                        id: ''
                    },
                    individualScreeningEvent: {}
                }
            },
            body: {
                transactionId: ''
            },
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return false;
                    }
                });
            }
        };
        const res: any = {};
        const next: any = sinon.spy();
        await MvtkInputModule.select(req, res, next);
        assert(next.calledOnce);
        mvtkInputForm.restore();
    });
});
