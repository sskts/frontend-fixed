"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * routesテスト
 *
 * @ignore
 */
// tslint:disable:no-backbone-get-set-outside-model
const sasaki = require("@motionpicture/sasaki-api-nodejs");
const assert = require("assert");
const httpStatus = require("http-status");
const sinon = require("sinon");
const supertest = require("supertest");
const app = require("../../../app/app");
describe('スケジュール選択', () => {
    let placeOrder;
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
    it('render', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/purchase/performances')
            .expect(httpStatus.OK)
            .then((response) => {
            assert(response);
        });
    }));
    it('getPerformances', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
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
    }));
});
describe('取引作成', () => {
    let place;
    let organization;
    beforeEach(() => {
        place = sinon.stub(sasaki.service, 'place').returns({
            findMovieTheater: () => {
                return;
            }
        });
        organization = sinon.stub(sasaki.service, 'organization').returns({
            findMovieTheaterByBranchCode: () => {
                return { id: '1111111111' };
            }
        });
    });
    afterEach(() => {
        place.restore();
        organization.restore();
    });
    it('start', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/purchase/transaction')
            .send({
            performanceId: '111111111'
        })
            .expect(httpStatus.OK);
    }));
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
