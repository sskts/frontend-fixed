// /**
//  * routesテスト
//  *
//  * @ignore
//  */
// // tslint:disable:no-backbone-get-set-outside-model
// import * as assert from 'assert';
// import * as httpStatus from 'http-status';
// import * as supertest from 'supertest';
// import * as app from '../../../apps/frontend/app';
// describe('GET /performances', () => {
//     it('index', async () => {
//         await supertest(app)
//             .get('/performances')
//             .expect(httpStatus.OK)
//             .then((response) => {
//                 assert(response);
//             });
//     });
// });
// describe('POST /performances', () => {
//     it('getPerformances', async () => {
//         await supertest(app)
//             .post('/performances')
//             .set('Accept', 'application/json')
//             .send({
//                 theater: '118',
//                 day: '20170321'
//             })
//             .expect(httpStatus.OK)
//             .expect('Content-Type', /json/)
//             .then((response) => {
//                 assert(!response.body.error);
//                 assert(Array.isArray(response.body.result));
//             });
//     });
// });
