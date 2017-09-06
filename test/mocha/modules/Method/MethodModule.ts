/**
 * MethodModuleテスト
 */
import * as assert from 'assert';
import * as sinon from 'sinon';

import * as MethodModule from '../../../../app/modules/Method/MethodModule';

describe('MethodModule', () => {

    it('ticketing 正常', async () => {
        const req: any = {};
        const res: any = {
            render: sinon.spy()
        };
        await MethodModule.ticketing(req, res);
        assert(res.render.calledOnce);
    });

    it('entry 正常', async () => {
        const req: any = {};
        const res: any = {
            render: sinon.spy()
        };
        await MethodModule.entry(req, res);
        assert(res.render.calledOnce);
    });

    it('bookmark 正常', async () => {
        const req: any = {};
        const res: any = {
            render: sinon.spy()
        };
        await MethodModule.bookmark(req, res);
        assert(res.render.calledOnce);
    });

});
