// /**
//  * routesテスト
//  *
//  * @ignore
//  */
// // tslint:disable:no-backbone-get-set-outside-model
// import * as httpStatus from 'http-status';
// import * as supertest from 'supertest';
// import * as app from '../../../app/app';

// describe('GET /inquiry/login', () => {
//     it('login NOT FOUND', async () => {
//         await supertest(app)
//             .get('/inquiry/login')
//             .query({
//                 session: {
//                     inquiry: {
//                         theaterCode: '118',
//                         reserveNum: '',
//                         telNum: ''
//                     }
//                 }
//             })
//             .expect(httpStatus.NOT_FOUND);
//     });
// });

// describe('POST /inquiry/login', () => {

//     it('auth 予約番号なし', async () => {
//         await supertest(app)
//             .post('/inquiry/login?theater=118')
//             .send({
//                 theaterCode: '118',
//                 reserveNum: '',
//                 telNum: '09040007648'
//             })
//             .expect(httpStatus.OK);
//     });

//     it('auth 電話番号なし', async () => {
//         await supertest(app)
//             .post('/inquiry/login?theater=118')
//             .send({
//                 theaterCode: '118',
//                 reserveNum: '531',
//                 telNum: ''
//             })
//             .expect(httpStatus.OK);
//     });
// });
