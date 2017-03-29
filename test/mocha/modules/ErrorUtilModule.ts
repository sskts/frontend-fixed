/**
 * ErrorUtilModuleテスト
 *
 * @ignore
 */
import * as assert from 'assert';
import locales from '../../../apps/frontend/middlewares/locales';
import * as ErrorUtilModule from '../../../apps/frontend/modules/Util/ErrorUtilModule';

describe('UtilModule.timeFormat', () => {
    it('正常', async () => {
        const req = {
            __: locales.__,
            __n: locales.__n
        };
        let err = ErrorUtilModule.getError(<any>req, ErrorUtilModule.ERROR_PROPERTY);
        assert.equal(err.message, 'お手続きの途中でエラーが発生いたしました。<br>お手数をおかけいたしますが、もう一度最初から操作をお願いいたします。');

        err = ErrorUtilModule.getError(<any>req, ErrorUtilModule.ERROR_ACCESS);
        assert.equal(err.message, 'お手続きの途中でエラーが発生いたしました。<br>お手数をおかけいたしますが、もう一度最初から操作をお願いいたします。');

        err = ErrorUtilModule.getError(<any>req, ErrorUtilModule.ERROR_VALIDATION);
        assert.equal(err.message, 'お手続きの途中でエラーが発生いたしました。<br>お手数をおかけいたしますが、もう一度最初から操作をお願いいたします。');

        err = ErrorUtilModule.getError(<any>req, ErrorUtilModule.ERROR_EXPIRE);
        assert.equal(err.message, 'お手続きの有効期限がきれました。<br>お手数をおかけいたしますが、もう一度最初から操作をお願いいたします。');
    });
});
