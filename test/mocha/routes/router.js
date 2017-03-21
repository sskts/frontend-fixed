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
describe('GET /performances', () => {
    it('index', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/performances')
            .expect(httpStatus.OK)
            .then((response) => {
            assert(response);
        });
    }));
});
describe('POST /performances', () => {
    it('getPerformances', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/performances')
            .set('Accept', 'application/json')
            .send({
            theater: '118',
            day: '20170321'
        })
            .expect(httpStatus.OK)
            .expect('Content-Type', /json/)
            .then((response) => {
            assert(!response.body.error);
            assert(Array.isArray(response.body.result));
        });
    }));
});
