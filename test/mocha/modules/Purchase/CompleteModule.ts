/**
 * Purchase.CompleteModuleテスト
 */
import * as assert from 'assert';
import * as sinon from 'sinon';

import * as CompleteModule from '../../../../app/modules/Purchase/CompleteModule';

describe('Purchase.CompleteModule', () => {

    it('render 正常', () => {
        const req: any = {
            session: {
                complete: {}
            }
        };
        const res: any = {
            locals: {},
            render: sinon.spy()
        };
        const next: any = (err: any) => {
            throw err.massage;
        };
        CompleteModule.render(req, res, next);
        assert(res.render.calledOnce);
    });

    it('render エラー', () => {
        const req: any = {
            query: {
                orderNumber: '118'
            },
            session: undefined
        };
        const res: any = {
            locals: {}
        };
        const next: any = sinon.spy();
        CompleteModule.render(req, res, next);
        assert(next.calledOnce);
    });

});
