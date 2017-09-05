/**
 * routesテスト
 *
 * @ignore
 */
// tslint:disable:no-backbone-get-set-outside-model
import * as sasaki from '@motionpicture/sasaki-api-nodejs';
import * as assert from 'assert';
import * as httpStatus from 'http-status';
import * as sinon from 'sinon';
import * as supertest from 'supertest';
import * as app from '../../../app/app';

describe('スケジュール選択', () => {
    let placeOrder: sinon.SinonStub;
    beforeEach(() => {
        placeOrder = sinon.stub(sasaki.service.transaction, 'placeOrder').returns({
            cancelSeatReservationAuthorization: () => {
                return;
            }
        });
    });
    afterEach(() => {
        placeOrder.restore();
    });

    it('render', async () => {
        await supertest(app)
            .get('/purchase/performances')
            .expect(httpStatus.OK)
            .then((response) => {
                assert(response);
            });
    });

    it('getPerformances', async () => {
        await supertest(app)
            .post('/purchase/performances')
            .send({
                theater: '118',
                day: '20170321'
            })
            .expect(httpStatus.OK)
            .then((response) => {
                assert(!response.body.error);
                assert(Array.isArray(response.body.result));
            });
    });
});

describe('取引作成', () => {
    let place: sinon.SinonStub;
    let organization: sinon.SinonStub;
    beforeEach(() => {
        place = sinon.stub(sasaki.service, 'place').returns({
            findMovieTheater: () => {
                return;
            }
        });
        organization = sinon.stub(sasaki.service, 'organization').returns({
            findMovieTheaterByBranchCode: () => {
                return {id: '1111111111'};
            }
        });
    });
    afterEach(() => {
        place.restore();
        organization.restore();
    });

    it('start', async () => {
        await supertest(app)
            .post('/purchase/transaction')
            .send({
                performanceId: '111111111'
            })
            .expect(httpStatus.OK);
    });
});

// describe('POST /:id/overlap', () => {
//     it('index 適切でないid', async () => {
//         await supertest(app)
//             .post('/purchase/00000000000000000000000/overlap')
//             .expect(httpStatus.NOT_FOUND);
//     });
// });

// describe('POST /overlap/prev', () => {
//     it('newReserve 正常', async () => {
//         await supertest(app)
//             .post('/purchase/overlap/prev')
//             .expect(httpStatus.FOUND);
//     });
// });

// describe('GET /seat/:id/', () => {
//     it('index 取引Id なし', async () => {
//         await supertest(app)
//             .get('/purchase/seat/00000000000000000000000')
//             .expect(httpStatus.BAD_REQUEST);
//     });
// });

// describe('POST /seat/:id/', () => {
//     it('select session.purchase なし', async () => {
//         await supertest(app)
//             .post('/purchase/seat/00000000000000000000000')
//             .expect(httpStatus.BAD_REQUEST);
//     });
// });

// describe('GET /ticket', () => {
//     it('index session.purchase なし', async () => {
//         await supertest(app)
//             .get('/purchase/ticket')
//             .expect(httpStatus.BAD_REQUEST);
//     });
// });

// describe('POST /ticket/', () => {
//     it('select session.purchase なし', async () => {
//         await supertest(app)
//             .post('/purchase/ticket')
//             .expect(httpStatus.BAD_REQUEST);
//     });
// });

// describe('GET /input', () => {
//     it('index session.purchase なし', async () => {
//         await supertest(app)
//             .get('/purchase/input')
//             .expect(httpStatus.BAD_REQUEST);
//     });
// });

// describe('POST /input/', () => {

//     it('select session.purchase なし', async () => {
//         await supertest(app)
//             .post('/purchase/input')
//             .expect(httpStatus.BAD_REQUEST);
//     });
// });

// describe('GET /confirm', () => {
//     it('index session.purchase なし', async () => {
//         await supertest(app)
//             .get('/purchase/confirm')
//             .expect(httpStatus.BAD_REQUEST);
//     });
// });

// describe('POST /confirm/', () => {

//     it('select session.purchase なし', async () => {
//         const response = await supertest(app)
//             .post('/purchase/confirm')
//             .expect(httpStatus.OK);
//         assert(!response.body.result);
//     });
// });

// describe('GET /complete/', () => {

//     it('index session.complete なし', async () => {
//         await supertest(app)
//             .get('/purchase/complete')
//             .expect(httpStatus.BAD_REQUEST);
//     });

//     it('index session.complete なし', async () => {
//         await supertest(app)
//             .get('/purchase/complete')
//             .expect(httpStatus.BAD_REQUEST);
//     });

// });
