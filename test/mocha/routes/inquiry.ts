/**
 * routesテスト
 *
 * @ignore
 */
// tslint:disable:no-backbone-get-set-outside-model
import * as httpStatus from 'http-status';
import * as supertest from 'supertest';
import * as app from '../../../app/app';

describe('GET /inquiry/login', () => {
    it('login NOT FOUND', async () => {
        await supertest(app)
            .get('/inquiry/login')
            .query({
                session: {
                    inquiry: {
                        theater_code: '118',
                        reserve_num: '',
                        tel_num: ''
                    }
                }
            })
            .expect(httpStatus.NOT_FOUND);
    });
});

describe('POST /inquiry/login', () => {

    it('auth 予約番号なし', async () => {
        await supertest(app)
            .post('/inquiry/login?theater=118')
            .send({
                theater_code: '118',
                reserve_num: '',
                tel_num: '09040007648'
            })
            .expect(httpStatus.OK);
    });

    it('auth 電話番号なし', async () => {
        await supertest(app)
            .post('/inquiry/login?theater=118')
            .send({
                theater_code: '118',
                reserve_num: '531',
                tel_num: ''
            })
            .expect(httpStatus.OK);
    });
});
