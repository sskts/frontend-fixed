/**
 * UtilModuleテスト
 *
 * @ignore
 */
import * as assert from 'assert';
import * as UtilModule from '../../../app/modules/Util/UtilModule';

describe('UtilModule.timeFormat', () => {
    // it('正常', async () => {
    //     const date = new Date();
    //     date.setHours(1);
    //     date.setMinutes(1);
    //     const str = UtilModule.timeFormat(date, '20170101');
    //     assert.equal(str, '01:01');
    // });
});

describe('UtilModule.escapeHtml', () => {
    it('正常', async () => {
        const str = UtilModule.escapeHtml('<script>alert(123)</script>');
        assert.equal(str, '&lt;script&gt;alert(123)&lt;/script&gt;');
    });
});

describe('UtilModule.formatPrice', () => {
    it('正常', async () => {
        const num = 10000;
        const price = UtilModule.formatPrice(num);
        assert.equal(price, '10,000');
    });
});

describe('UtilModule.bace64Encode', () => {
    it('正常', async () => {
        const str = UtilModule.bace64Encode('テスト');
        assert.equal(str, '44OG44K544OI');
    });
});

describe('UtilModule.base64Decode', () => {
    it('正常', async () => {
        const str = UtilModule.base64Decode('44OG44K544OI');
        assert.equal(str, 'テスト');
    });
});
