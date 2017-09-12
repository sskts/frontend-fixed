"use strict";
/**
 * Purchase.CompleteModuleテスト
 */
const assert = require("assert");
const sinon = require("sinon");
const CompleteModule = require("../../../../app/modules/Purchase/CompleteModule");
describe('Purchase.CompleteModule', () => {
    it('render 正常', () => {
        const req = {
            session: {
                complete: {}
            }
        };
        const res = {
            locals: {},
            render: sinon.spy()
        };
        const next = (err) => {
            throw err.massage;
        };
        CompleteModule.render(req, res, next);
        assert(res.render.calledOnce);
    });
    it('render エラー', () => {
        const req = {
            query: {
                orderNumber: '118'
            },
            session: undefined
        };
        const res = {
            locals: {}
        };
        const next = sinon.spy();
        CompleteModule.render(req, res, next);
        assert(next.calledOnce);
    });
});
