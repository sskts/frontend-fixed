/**
 * UtilModuleテスト
 *
 * @ignore
 */
import * as assert from 'assert';
import * as UtilModule from '../../../app/modules/Util/UtilModule';

describe('UtilModule.timeFormat', () => {
    it('正常', async () => {
        const str = UtilModule.timeFormat('0101');
        assert.equal(str, '01:01');
    });
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

describe('UtilModule.getPerformanceId', () => {
    it('正常', async () => {
        const id = UtilModule.getPerformanceId({
            theaterCode: '118',
            day: '20170329',
            titleCode: '16221',
            titleBranchNum: '0',
            screenCode: '10',
            timeBegin: '1230'
        });
        assert.equal(id, '11820170329162210101230');
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

// describe('UtilModule.getEmailTemplate', () => {
//     it('正常', async () => {
//         const locals = {
//             performance: normalDAta.performance,
//             reserveSeats: normalDAta.reserveSeats,
//             input: normalDAta.input,
//             reserveSeatsString: [],
//             amount: 0,
//             domain: '',
//             moment: moment,
//             timeFormat: UtilModule.timeFormat,
//             __: locales.__
//         };
//         const template = await UtilModule.getEmailTemplate('email/complete/ja', locals);
//         assert(template);
//     });
// });
