/**
 * routesテスト
 *
 * @ignore
 */
// tslint:disable:no-backbone-get-set-outside-model
// import * as assert from 'assert';
// import * as httpStatus from 'http-status';
import * as supertest from 'supertest';
import * as app from '../../../apps/frontend/app';

describe('GET /inquiry/login', () => {
    it('login', async () => {
        await supertest(app)
            .get('/create/session')
            .query({
                session: {
                    inquiry: {
                        theater_code: '118',
                        reserve_num: '59',
                        tel_num: '09040007648',
                        tel_num2222: '09040007648'
                    }
                }
            });
    });
});

// describe('POST /inquiry/login', () => {
//     it('auth', async () => {
//         await supertest(app)
//             .post('/inquiry/login')
//             .send({
//                 theater_code: '118',
//                 reserve_num: '531',
//                 tel_num: '09040007648'
//             })
//             .expect(httpStatus.FOUND)
//             .then((response) => {
//                 assert(response.body);
//             });
//     });
// });

// describe('GET /:transactionId/', () => {
//     it('index', async () => {
//         await supertest(app)
//             .get('/inquiry/58d1194a512cf514f44acdff/')
//             .expect(httpStatus.OK)
//             .then((response) => {
//                 assert(response);
//             });
//     });
// });
