"use strict";
const Service_1 = require('../Service');
class ReservationService extends Service_1.default {
    /**
    * 空席状況
    *
    * @param {any} args
    */
    vacancySituation(args, cb) {
        let method = 'vacancySituation';
        let url = this.wsdl + method;
        let options = {};
        this.request(url, options, cb);
    }
    /**
    * 座席予約状態抽出
    *
    * @param {any} args
    */
    seatReservationStateExtraction(args, cb) {
        let method = 'seatReservationStateExtraction';
        let url = this.wsdl + method;
        let options = {};
        this.request(url, options, cb);
    }
    /**
    * 座席仮予約
    *
    * @param {any} args
    */
    preSeatReservation(args, cb) {
        let method = 'preSeatReservation';
        let url = this.wsdl + method;
        let options = {};
        this.request(url, options, cb);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ReservationService;
