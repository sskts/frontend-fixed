/**
 * Util.UtilModuleテスト
 *
 * @ignore
 */
import * as assert from 'assert';
import * as moment from 'moment';
import * as sinon from 'sinon';

import * as UtilModule from '../../../../app/modules/Util/UtilModule';

describe('Util.UtilModule', () => {

    it('setLocals 正常', () => {
        const req: any = {
            cookies: {}
        };
        const res: any = {
            locals: {}
        };
        const next: any = sinon.spy();
        UtilModule.setLocals(req, res, next);
        assert(next.calledOnce);
    });

    it('isApp 正常 アプリ', () => {
        const req: any = {
            cookies: {
                applicationData: JSON.stringify({ viewType: 'app' })
            }
        };
        const isApp = UtilModule.isApp(req);
        assert.strictEqual(isApp, true);
    });

    it('isApp 正常 アプリでない', () => {
        const req: any = {
            cookies: {}
        };
        const isApp = UtilModule.isApp(req);
        assert.strictEqual(isApp, false);
    });

    it('timeFormat 正常', () => {
        const date = new Date();
        date.setHours(1);
        date.setMinutes(1);
        const str = UtilModule.timeFormat(date, moment().format('YYYYMMDD'));
        assert.equal(str, '01:01');
    });

    it('escapeHtml 正常', async () => {
        const str = UtilModule.escapeHtml('<script>alert(123)</script>');
        assert.equal(str, '&lt;script&gt;alert(123)&lt;/script&gt;');
    });

    it('formatPrice 正常', async () => {
        const num = 10000;
        const price = UtilModule.formatPrice(num);
        assert.equal(price, '10,000');
    });

    it('bace64Encode 正常', async () => {
        const str = UtilModule.bace64Encode('テスト');
        assert.equal(str, '44OG44K544OI');
    });

    it('base64Decode 正常', async () => {
        const str = UtilModule.base64Decode('44OG44K544OI');
        assert.equal(str, 'テスト');
    });

    it('getEmailTemplate 正常', async () => {
        const res: any = {
            render: sinon.spy()
        };
        const file = '';
        const locals = {};
        await UtilModule.getEmailTemplate(res, file, locals);
        assert(res.render.calledOnce);
    });

});
