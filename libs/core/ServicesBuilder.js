"use strict";
const ReservationService_1 = require('./Reservation/ReservationService');
/**
 * ムビチケサービス作成クラス
 *
 * 特定のムビチケサービスを使う場合、ここからserviceをcreateする
 */
class ServicesBuilder {
    static getInstance() {
        if (!ServicesBuilder.instance) {
            ServicesBuilder.instance = new ServicesBuilder();
        }
        return ServicesBuilder.instance;
    }
    /**
     * サービスビルダー初期化
     *
     * @param {string} endpoint
     */
    initialize(endpoint) {
        this.endpoint = endpoint;
    }
    /**
     * 新しいインスタンスを複製する
     */
    createInstance() {
        let instance = new ServicesBuilder();
        instance.initialize(this.endpoint);
        return instance;
    }
    /**
     * 予約サービスを生成する
     */
    createReservationService() {
        let wsdl = this.endpoint + '/services/reservation/';
        let service = new ReservationService_1.default(wsdl);
        return service;
    }
}
module.exports = ServicesBuilder.getInstance();
