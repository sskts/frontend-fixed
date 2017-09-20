/**
 * Fixed.FixedModuleテスト
 */
import * as COA from '@motionpicture/coa-service';
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as assert from 'assert';
import * as sinon from 'sinon';

import * as InquiryLoginForm from '../../../../app/forms/Inquiry/LoginForm';
import * as FixedModule from '../../../../app/modules/Fixed/FixedModule';

describe('Fixed.FixedModule', () => {

    it('settingRender 正常', async () => {
        const organization = sinon.stub(sasaki.service, 'organization').returns({
            searchMovieTheaters: () => {
                return {};
            },
            findMovieTheaterByBranchCode: () => {
                return {
                    location: {
                        name: {
                            ja: '',
                            en: ''
                        }
                    }
                };
            }
        });

        const req: any = {
            session: {}
        };
        const res: any = {
            locals: {},
            render: sinon.spy()
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        await FixedModule.settingRender(req, res, next);
        assert(res.render.calledOnce);

        organization.restore();
    });

    it('settingRender エラー', async () => {
        const req: any = {
            session: undefined
        };
        const res: any = {};
        const next: any = sinon.spy();
        await FixedModule.settingRender(req, res, next);
        assert(next.calledOnce);
    });

    it('stopRender 正常', async () => {
        const req: any = {};
        const res: any = {
            locals: {},
            render: sinon.spy()
        };
        await FixedModule.stopRender(req, res);
        assert(res.render.calledOnce);
    });

    it('getInquiryData 正常', async () => {
        const organization = sinon.stub(sasaki.service, 'organization').returns({
            searchMovieTheaters: () => {
                return {};
            },
            findMovieTheaterByBranchCode: () => {
                return {
                    location: {
                        name: {
                            ja: '',
                            en: ''
                        }
                    }
                };
            }
        });
        const order = sinon.stub(sasaki.service, 'order').returns({
            findByOrderInquiryKey: () => {
                return {
                    orderInquiryKey: {
                        confirmationNumber: ''
                    },
                    acceptedOffers: [{
                        itemOffered: {
                            reservationFor: {
                                workPerformed: {
                                    name: ''
                                },
                                startDate: '',
                                location: {
                                    name: {
                                        ja: '',
                                        en: ''
                                    }
                                },
                                coaInfo: {
                                    dateJouei: ''
                                }
                            },
                            reservedTicket: {
                                coaTicketInfo: {
                                    seatNum: '',
                                    addGlasses: '',
                                    ticketName: '',
                                    salePrice: ''
                                },
                                ticketToken: ''
                            }
                        }
                    }]
                };
            }
        });
        const updReserve = sinon.stub(COA.services.reserve, 'updReserve').returns(
            Promise.resolve({})
        );
        const inquiryLoginForm = sinon.stub(InquiryLoginForm, 'default').returns({});
        const req: any = {
            session: {},
            body: {},
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
            json: sinon.spy()
        };
        await FixedModule.getInquiryData(req, res);
        assert.notStrictEqual(res.json.args[0][0].result, null);

        organization.restore();
        order.restore();
        updReserve.restore();
        inquiryLoginForm.restore();
    });

    it('getInquiryData エラー セッションなし', async () => {
        const req: any = {
            session: undefined,
            body: {}
        };
        const res: any = {
            locals: {},
            json: sinon.spy()
        };
        await FixedModule.getInquiryData(req, res);
        assert.strictEqual(res.json.args[0][0].result, null);
    });

    it('getInquiryData エラー findMovieTheaterByBranchCodeなし', async () => {
        const organization = sinon.stub(sasaki.service, 'organization').returns({
            searchMovieTheaters: () => {
                return {};
            },
            findMovieTheaterByBranchCode: () => {
                return null;
            }
        });

        const req: any = {
            session: undefined,
            body: {}
        };
        const res: any = {
            locals: {},
            json: sinon.spy()
        };
        await FixedModule.getInquiryData(req, res);
        assert.strictEqual(res.json.args[0][0].result, null);

        organization.restore();
    });

    it('getInquiryData バリデーション', async () => {
        const req: any = {
            session: {},
            body: {},
            getValidationResult: () => {
                return Promise.resolve({
                    isEmpty: () => {
                        return false;
                    }
                });
            }
        };
        const res: any = {
            locals: {},
            json: sinon.spy()
        };
        await FixedModule.getInquiryData(req, res);
        assert.strictEqual(res.json.args[0][0].result, null);
    });
});
