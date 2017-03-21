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
const assert = require("assert");
const httpStatus = require("http-status");
const supertest = require("supertest");
const app = require("../../../apps/frontend/app");
describe('GET /inquiry/login', () => {
    it('login', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/inquiry/login')
            .expect(httpStatus.OK)
            .then((response) => {
            assert(response);
        });
    }));
});
describe('POST /inquiry/login', () => {
    it('auth', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/inquiry/login')
            .send({
            theater_code: '118',
            reserve_num: '531',
            tel_num: '09040007648'
        })
            .expect(httpStatus.FOUND)
            .then((response) => {
            assert(response.body);
        });
    }));
});
describe('GET /:transactionId/', () => {
    it('index', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/inquiry/58d1194a512cf514f44acdff/')
            .expect(httpStatus.OK)
            .then((response) => {
            assert(response);
        });
    }));
});
