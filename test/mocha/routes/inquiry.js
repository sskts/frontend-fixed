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
const httpStatus = require("http-status");
const supertest = require("supertest");
const app = require("../../../apps/frontend/app");
describe('GET /inquiry/login', () => {
    it('login NOT FOUND', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
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
            .expect(httpStatus.INTERNAL_SERVER_ERROR);
    }));
});
describe('POST /inquiry/login', () => {
    it('auth 予約番号なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/inquiry/login')
            .send({
            theater_code: '118',
            reserve_num: '',
            tel_num: '09040007648'
        })
            .expect(httpStatus.OK);
    }));
    it('auth 電話番号なし', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/inquiry/login')
            .send({
            theater_code: '118',
            reserve_num: '531',
            tel_num: ''
        })
            .expect(httpStatus.OK);
    }));
});
