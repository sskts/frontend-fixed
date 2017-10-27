/**
 * Inquiry.InquiryModelテスト
 */
import * as assert from 'assert';

import { InquiryModel } from '../../../../app/models/Inquiry/InquiryModel';

describe('Inquiry.InquiryModel', () => {

    it('constructor 正常', () => {
        const inquiryModel = new InquiryModel({
            movieTheaterOrganization: {},
            order: {},
            login: {}
        });
        assert.notStrictEqual(inquiryModel.movieTheaterOrganization, null);
        assert.notStrictEqual(inquiryModel.order, null);
        assert.notStrictEqual(inquiryModel.login, null);
    });

    it('save 正常', () => {
        const inquiryModel = new InquiryModel();
        const session: any = {};
        inquiryModel.save(session);
        assert(session.inquiry);
    });

});
