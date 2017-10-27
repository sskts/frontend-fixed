"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Inquiry.InquiryModelテスト
 */
const assert = require("assert");
const InquiryModel_1 = require("../../../../app/models/Inquiry/InquiryModel");
describe('Inquiry.InquiryModel', () => {
    it('constructor 正常', () => {
        const inquiryModel = new InquiryModel_1.InquiryModel({
            movieTheaterOrganization: {},
            order: {},
            login: {}
        });
        assert.notStrictEqual(inquiryModel.movieTheaterOrganization, null);
        assert.notStrictEqual(inquiryModel.order, null);
        assert.notStrictEqual(inquiryModel.login, null);
    });
    it('save 正常', () => {
        const inquiryModel = new InquiryModel_1.InquiryModel();
        const session = {};
        inquiryModel.save(session);
        assert(session.inquiry);
    });
});
