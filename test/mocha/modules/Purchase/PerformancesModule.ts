// /**
//  * Purchase.OverlapModuleテスト
//  */
// import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
// import * as assert from 'assert';
// import * as HTTPStatus from 'http-status';
// import * as sinon from 'sinon';
// import * as PerformancesModule from '../../../../app/modules/Purchase/PerformancesModule';

// describe('Purchase.PerformancesModule', () => {

//     it('render 正常', async () => {
//         const placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
//             cancelSeatReservationAuthorization: () => {
//                 return Promise.resolve({});
//             }
//         });
//         const organization = sinon.stub(sasaki.service, 'organization').returns({
//             searchMovieTheaters: () => {
//                 return Promise.resolve({});
//             }
//         });
//         const req: any = {
//             session: {
//                 purchase: {
//                     transaction: {
//                         id: ''
//                     },
//                     seatReservationAuthorization: {
//                         id: ''
//                     }
//                 }
//             }
//         };
//         const res: any = {
//             locals: {},
//             render: sinon.spy()
//         };
//         const next: any = (err: any) => {
//             throw err.massage;
//         };
//         await PerformancesModule.render(req, res, next);
//         assert(res.render.calledOnce);
//         placeOrder.restore();
//         organization.restore();
//     });

//     it('render エラー', async () => {
//         const req: any = {
//             session: undefined
//         };
//         const res: any = {};
//         const next: any = sinon.spy();
//         await PerformancesModule.render(req, res, next);
//         assert(next.calledOnce);
//     });

//     it('getPerformances 正常', async () => {
//         const event = sinon.stub(sasaki.service, 'event').returns({
//             searchIndividualScreeningEvent: () => {
//                 return Promise.resolve({});
//             }
//         });
//         const req: any = {
//             session: {},
//             query: {
//                 theater: '',
//                 day: ''
//             }
//         };
//         const res: any = {
//             locals: {},
//             json: sinon.spy(),
//             status: (code: number) => {
//                 res.statusCode = code;
//             },
//             statusCode: HTTPStatus.OK
//         };
//         await PerformancesModule.getPerformances(req, res);
//         assert(res.json.calledOnce);
//         assert.strictEqual(res.statusCode, HTTPStatus.OK);
//         event.restore();
//     });

//     it('getPerformances エラー', async () => {
//         const req: any = {
//             session: undefined,
//             query: {}
//         };
//         const res: any = {
//             json: sinon.spy(),
//             status: (code: number) => {
//                 res.statusCode = code;
//             },
//             statusCode: HTTPStatus.OK
//         };
//         await PerformancesModule.getPerformances(req, res);
//         assert(res.json.calledOnce);
//         assert.notStrictEqual(res.statusCode, HTTPStatus.OK);
//     });

//     it('getMovieTheaters 正常', async () => {
//         const organization = sinon.stub(sasaki.service, 'organization').returns({
//             searchMovieTheaters: () => {
//                 return Promise.resolve({});
//             }
//         });
//         const req: any = {
//             session: {},
//             query: {}
//         };
//         const res: any = {
//             locals: {},
//             json: sinon.spy(),
//             status: (code: number) => {
//                 res.statusCode = code;
//             },
//             statusCode: HTTPStatus.OK
//         };
//         await PerformancesModule.getMovieTheaters(req, res);
//         assert(res.json.calledOnce);
//         assert.strictEqual(res.statusCode, HTTPStatus.OK);
//         organization.restore();
//     });

//     it('getMovieTheaters エラー', async () => {
//         const req: any = {
//             session: undefined,
//             query: {}
//         };
//         const res: any = {
//             json: sinon.spy(),
//             status: (code: number) => {
//                 res.statusCode = code;
//             },
//             statusCode: HTTPStatus.OK
//         };
//         await PerformancesModule.getMovieTheaters(req, res);
//         assert(res.json.calledOnce);
//         assert.notStrictEqual(res.statusCode, HTTPStatus.OK);
//     });

// });
