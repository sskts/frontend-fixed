import ReservationService from './Reservation/ReservationService';

/**
 * ムビチケサービス作成クラス
 * 
 * 特定のムビチケサービスを使う場合、ここからserviceをcreateする
 */
class ServicesBuilder {

    /**
     * サービスエンドポイント
     */
    private endpoint: string;

    static instance: ServicesBuilder;


    public static getInstance(): ServicesBuilder {
        if (!ServicesBuilder.instance) {
            ServicesBuilder.instance = new ServicesBuilder()
        }

        return ServicesBuilder.instance;
    }

    /**
     * サービスビルダー初期化
     * 
     * @param {string} endpoint
     */
    public initialize(endpoint: string): void {
        this.endpoint = endpoint;
    }

    /**
     * 新しいインスタンスを複製する
     */
    public createInstance(): ServicesBuilder {
        let instance = new ServicesBuilder();
        instance.initialize(this.endpoint);

        return instance;
    }

    

    /**
     * 予約サービスを生成する
     */
    public createReservationService(): ReservationService {
        let wsdl: string = this.endpoint + '/services/reservation/';
        let service = new ReservationService(wsdl);
        return service;
    }
}

module.exports = ServicesBuilder.getInstance();
