/**
 * 購入セッション
 */
import * as COA from '@motionpicture/coa-service';
import * as MVTK from '@motionpicture/mvtk-reserve-service';
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as moment from 'moment';
import * as MvtkUtilModule from '../../modules/Purchase/Mvtk/MvtkUtilModule';
import * as UtilModule from '../../modules/Util/UtilModule';
/**
 * 購入者情報
 * @interface IProfile
 */
export interface IProfile {
    /**
     * せい
     */
    familyName: string;
    /**
     * めい
     */
    givenName: string;
    /**
     * メールアドレス
     */
    email: string;
    /**
     * メールアドレス確認
     */
    emailConfirm: string;
    /**
     * 電話番号
     */
    telephone: string;
}

/**
 * GMO
 * @interface IGMO
 */
export interface IGMO {
    /**
     * トークン
     */
    token: string;
    /**
     * マクスされたカード番号
     */
    maskedCardNo: string;
}

/**
 * ムビチケ
 * @interface IMvtk
 */
export interface IMvtk {
    /**
     * 購入管理番号
     */
    code: string;
    /**
     * 暗証番号
     */
    password: string;
    /**
     * 有効券情報
     */
    ykknInfo: IValidTicketResult;
    /**
     * チケット情報
     */
    ticket: COA.services.master.IMvtkTicketcodeResult;
}

/**
 * 有効券情報
 * @interface IValidTicketResult
 */
export interface IValidTicketResult {
    /**
     * 有効券種区分
     */
    ykknshTyp: string;
    /**
     * 映写方式区分
     */
    eishhshkTyp: string;
    /**
     * 有効期限券種別枚数
     */
    ykknKnshbtsmiNum: string;
    /**
     * 鑑賞券販売単価
     */
    knshknhmbiUnip: string;
    /**
     * 計上単価
     */
    kijUnip: string;
    /**
     * 電子券区分
     */
    dnshKmTyp: string;
    /**
     * 全国共通券・劇場券区分
     */
    znkkkytsknGkjknTyp: string;
}

/**
 * 予約チケット
 * @interface IReserveTicket
 */
export interface IReserveTicket {
    /**
     * セクション
     */
    section: string;
    /**
     * 座席コード
     */
    seatCode: string;
    /**
     * チケットコード
     */
    ticketCode: string;
    /**
     * チケット名
     */
    ticketName: string;
    /**
     * チケット名(カナ)
     */
    ticketNameKana: string;
    /**
     * チケット名(英)
     */
    ticketNameEng: string;
    /**
     * 標準単価
     */
    stdPrice: number;
    /**
     * 割引額
     */
    disPrice: number;
    /**
     * 加算単価
     */
    addPrice: number;
    /**
     * 販売単価
     */
    salePrice: number;
    /**
     * チケット備考
     */
    ticketNote: string;
    /**
     * メガネ単価
     */
    addPriceGlasses: number;
    /**
     * メガネ有り無し
     */
    glasses: boolean;
    /**
     * ムビチケ計上単価
     */
    mvtkAppPrice: number;
    /**
     * ムビチケ映写方式区分
     */
    kbnEisyahousiki: string;
    /**
     * ムビチケ購入管理番号
     */
    mvtkNum: string;
    /**
     * ムビチケ電子券区分
     */
    mvtkKbnDenshiken: string;
    /**
     * ムビチケ前売券区分
     */
    mvtkKbnMaeuriken: string;
    /**
     * ムビチケ券種区分
     */
    mvtkKbnKensyu: string;
    /**
     * ムビチケ販売単価
     */
    mvtkSalesPrice: number;
    /**
     * 制限単位
     */
    limitUnit: string;
    /**
     * 人数制限
     */
    limitCount: number;
}

/**
 * 券種
 * @interface ISalesTicket
 */
export interface ISalesTicket {
    /**
     * チケットコード
     */
    ticketCode: string;
    /**
     * チケット名
     */
    ticketName: string;
    /**
     * チケット名(カナ)
     */
    ticketNameKana: string;
    /**
     * チケット名(英)
     */
    ticketNameEng: string;
    /**
     * 標準単価
     */
    stdPrice: number;
    /**
     * 加算単価
     */
    addPrice: number;
    /**
     * 販売単価
     */
    salePrice: number;
    /**
     * チケット備考
     */
    ticketNote: string;
    /**
     * メガネ単価
     */
    addPriceGlasses: number;
    /**
     * ムビチケ購入番号
     */
    mvtkNum: string;
    /**
     * メガネ有無
     */
    glasses: boolean;
}

/**
 * 購入セッション
 * @interface IPurchaseSession
 */
export interface IPurchaseSession {
    /**
     * 上映イベント
     */
    individualScreeningEvent: sasaki.factory.event.individualScreeningEvent.IEvent | null;
    /**
     * 劇場ショップ
     */
    movieTheaterOrganization: sasaki.factory.organization.movieTheater.IPublicFields | null;
    /**
     * 取引
     */
    transaction: sasaki.factory.transaction.placeOrder.ITransaction | null;
    /**
     * 販売可能チケット情報
     */
    salesTickets: COA.services.reserve.ISalesTicketResult[] | null;
    /**
     * 予約チケット
     */
    reserveTickets: IReserveTicket[];
    /**
     * 予約座席
     */
    seatReservationAuthorization: sasaki.factory.action.authorize.seatReservation.IAction | null;
    /**
     * GMOオーダーID
     */
    orderId: string | null;
    /**
     * GMOオーダー回数
     */
    orderCount: number;
    /**
     * GMOオーソリ
     */
    creditCardAuthorization: {
        id: string;
        price: number;
    } | null;
    /**
     * プロフィール
     */
    profile: IProfile | null;
    /**
     * クレジットカード情報
     */
    creditCards: sasaki.factory.paymentMethod.paymentCard.creditCard.ICheckedCard[];
    /**
     * GMO情報
     */
    gmo: IGMO | null;
    /**
     * ムビチケ
     */
    mvtk: IMvtk[];
    /**
     * ムビチケオーソリ
     */
    mvtkAuthorization: {
        id: string;
        price: number;
    } | null;
    /**
     * 有効期限
     */
    expired: Date;
}

/**
 * 購入モデル
 * @class PurchaseModel
 */
export class PurchaseModel {
    public static PERFORMANCE_STATE: number = 0;
    public static SEAT_STATE: number = 1;
    public static TICKET_STATE: number = 2;
    public static INPUT_STATE: number = 3;
    public static CONFIRM_STATE: number = 4;
    public static COMPLETE_STATE: number = 5;

    /**
     * 上映イベント
     */
    public individualScreeningEvent: sasaki.factory.event.individualScreeningEvent.IEvent | null;
    /**
     * 劇場ショップ
     */
    public movieTheaterOrganization: sasaki.factory.organization.movieTheater.IPublicFields | null;
    /**
     * 取引
     */
    public transaction: sasaki.factory.transaction.placeOrder.ITransaction | null;
    /**
     * 販売可能チケット情報
     */
    public salesTickets: COA.services.reserve.ISalesTicketResult[] | null;
    /**
     * 予約チケット
     */
    public reserveTickets: IReserveTicket[];
    /**
     * 予約座席
     */
    public seatReservationAuthorization: sasaki.factory.action.authorize.seatReservation.IAction | null;
    /**
     * GMOオーダーID
     */
    public orderId: string | null;
    /**
     * GMOオーダー回数
     */
    public orderCount: number;
    /**
     * GMOオーソリ
     */
    public creditCardAuthorization: {
        id: string;
        price: number;
    } | null;
    /**
     * プロフィール
     */
    public profile: IProfile | null;
    /**
     * クレジットカード情報
     */
    public creditCards: sasaki.factory.paymentMethod.paymentCard.creditCard.ICheckedCard[];
    /**
     * GMO情報
     */
    public gmo: IGMO | null;
    /**
     * ムビチケ
     */
    public mvtk: IMvtk[];
    /**
     * ムビチケオーソリ
     */
    public mvtkAuthorization: {
        id: string;
        price: number;
    } | null;
    /**
     * 有効期限
     */
    public expired: Date;

    /**
     * @constructor
     * @param {any} session
     */
    // tslint:disable-next-line:cyclomatic-complexity
    constructor(session?: any) {
        if (session === undefined) {
            session = {};
        }

        this.individualScreeningEvent = (session.individualScreeningEvent !== undefined) ? session.individualScreeningEvent : null;
        this.movieTheaterOrganization = (session.movieTheaterOrganization !== undefined) ? session.movieTheaterOrganization : null;
        this.transaction = (session.transaction !== undefined) ? session.transaction : null;
        this.salesTickets = (session.salesTickets !== undefined) ? session.salesTickets : null;
        this.reserveTickets = (session.reserveTickets !== undefined) ? session.reserveTickets : [];
        this.seatReservationAuthorization = (session.seatReservationAuthorization !== undefined)
            ? session.seatReservationAuthorization : null;
        this.orderId = (session.orderId !== undefined) ? session.orderId : null;
        this.orderCount = (session.orderCount !== undefined) ? session.orderCount : 0;
        this.creditCardAuthorization = (session.creditCardAuthorization !== undefined) ? session.creditCardAuthorization : null;
        this.profile = (session.profile !== undefined) ? session.profile : null;
        this.creditCards = (session.creditCards !== undefined) ? session.creditCards : [];
        this.gmo = (session.gmo !== undefined) ? session.gmo : null;
        this.mvtk = (session.mvtk !== undefined) ? session.mvtk : [];
        this.mvtkAuthorization = (session.mvtkAuthorization !== undefined) ? session.mvtkAuthorization : null;
        this.expired = (session.expired !== undefined) ? session.expired : null;
    }

    /**
     * セッションへ保存
     * @memberof PurchaseModel
     * @method toSession
     * @returns {void}
     */
    public save(session: any): void {
        const purchaseSession: IPurchaseSession = {
            individualScreeningEvent: this.individualScreeningEvent,
            movieTheaterOrganization: this.movieTheaterOrganization,
            transaction: this.transaction,
            salesTickets: this.salesTickets,
            reserveTickets: this.reserveTickets,
            seatReservationAuthorization: this.seatReservationAuthorization,
            orderId: this.orderId,
            orderCount: this.orderCount,
            creditCardAuthorization: this.creditCardAuthorization,
            profile: this.profile,
            creditCards: this.creditCards,
            gmo: this.gmo,
            mvtk: this.mvtk,
            mvtkAuthorization: this.mvtkAuthorization,
            expired: this.expired
        };
        session.purchase = purchaseSession;
    }

    /**
     * ステータス確認
     * @memberof PurchaseModel
     * @method accessAuth
     * @param {number} value
     * @returns {boolean}
     */
    public accessAuth(value: number): boolean {
        let result = true;
        if (this.transaction === null) result = false;
        switch (value) {
            case PurchaseModel.SEAT_STATE:
                break;
            case PurchaseModel.TICKET_STATE:
                if (this.seatReservationAuthorization === null) result = false;
                break;
            case PurchaseModel.INPUT_STATE:
                if (this.seatReservationAuthorization === null) result = false;
                break;
            case PurchaseModel.CONFIRM_STATE:
                if (this.seatReservationAuthorization === null) result = false;
                if (this.profile === null) result = false;
                break;
            case PurchaseModel.COMPLETE_STATE:
                break;
            default:
                break;
        }

        return result;
    }

    /**
     * ムビチケ対応作品判定
     * @memberof PurchaseModel
     * @method isUsedMvtk
     * @returns {boolean}
     */
    public isUsedMvtk(): boolean {
        if (this.individualScreeningEvent === null) {
            return false;
        }
        const today = moment().format('YYYYMMDD');

        return (this.individualScreeningEvent.superEvent.coaInfo.flgMvtkUse === '1'
            && this.individualScreeningEvent.superEvent.coaInfo.dateMvtkBegin !== undefined
            && Number(this.individualScreeningEvent.superEvent.coaInfo.dateMvtkBegin) <= Number(today));
    }

    /**
     * ムビチケ券有無判定
     * @memberof PurchaseModel
     * @method isReserveMvtkTicket
     * @returns {boolean}
     */
    public isReserveMvtkTicket(): boolean {
        let result = false;
        if (this.reserveTickets === null) return result;
        for (const reserveTicket of this.reserveTickets) {
            if (reserveTicket.mvtkNum !== '' && reserveTicket.mvtkNum.length > 0) result = true;
        }

        return result;
    }

    /**
     * 予約金額取得（決済する分）
     * @memberof PurchaseModel
     * @method getReserveAmount
     * @returns {number}
     */
    public getReserveAmount(): number {
        const reserveTickets = this.reserveTickets;
        let amount = 0;
        if (reserveTickets === null) return amount;
        for (const ticket of reserveTickets) {
            amount += ticket.salePrice;
        }

        return amount;
    }

    /**
     * チケット価値取得（チケット価値）
     * @memberof PurchaseModel
     * @method getPrice
     * @returns {number}
     */
    public getPrice(): number {
        return (this.getReserveAmount() + this.getMvtkPrice());
    }

    /**
     * ムビチケ計上単価合計取得
     * @memberof PurchaseModel
     * @method getMvtkPrice
     * @returns {number}
     */
    public getMvtkPrice(): number {
        const reserveTickets = this.reserveTickets;
        let price = 0;
        if (reserveTickets === null) return price;
        for (const ticket of reserveTickets) {
            price += ticket.mvtkSalesPrice;
        }

        return price;
    }

    /**
     * 有効期限確認
     * @memberof PurchaseModel
     * @method isExpired
     * @returns {boolean}
     */
    public isExpired(): boolean {
        return (moment(this.expired).unix() < moment().unix());
    }

    /**
     * 券種リスト取得
     * @memberof PurchaseModel
     * @method getSalesTickets
     * @param {Request} req
     * @returns {ISalesTicket[]}
     */
    public getSalesTickets(): ISalesTicket[] {
        if (this.individualScreeningEvent === null
            || this.salesTickets === null) {
            return [];
        }

        const result: ISalesTicket[] = [];

        for (const ticket of this.salesTickets) {
            result.push({
                ticketCode: ticket.ticketCode,
                ticketName: ticket.ticketName,
                ticketNameKana: ticket.ticketNameKana,
                ticketNameEng: ticket.ticketNameEng,
                stdPrice: ticket.stdPrice,
                addPrice: ticket.addPrice,
                salePrice: ticket.salePrice,
                ticketNote: ticket.ticketNote,
                addPriceGlasses: 0,
                mvtkNum: '',
                glasses: false
            });

            if (ticket.addGlasses > 0) {
                result.push({
                    ticketCode: ticket.ticketCode,
                    ticketName: ticket.ticketName,
                    ticketNameKana: ticket.ticketNameKana,
                    ticketNameEng: ticket.ticketNameEng,
                    stdPrice: ticket.stdPrice,
                    addPrice: ticket.addPrice,
                    salePrice: (<number>ticket.salePrice) + (<number>ticket.addGlasses),
                    ticketNote: ticket.ticketNote,
                    addPriceGlasses: ticket.addGlasses,
                    mvtkNum: '',
                    glasses: true
                });
            }
        }

        if (this.mvtk.length === 0) {
            return result;
        }
        // ムビチケ情報からチケット情報へ変換
        const mvtkTickets: ISalesTicket[] = [];
        for (const mvtk of this.mvtk) {
            for (let i = 0; i < Number(mvtk.ykknInfo.ykknKnshbtsmiNum); i += 1) {
                mvtkTickets.push({
                    ticketCode: mvtk.ticket.ticketCode,
                    ticketName: mvtk.ticket.ticketName,
                    ticketNameKana: mvtk.ticket.ticketNameKana,
                    ticketNameEng: mvtk.ticket.ticketNameEng,
                    stdPrice: 0,
                    addPrice: mvtk.ticket.addPrice,
                    salePrice: mvtk.ticket.addPrice,
                    ticketNote: mvtk.code,
                    addPriceGlasses: mvtk.ticket.addPriceGlasses,
                    mvtkNum: mvtk.code,
                    glasses: false
                });

                if (mvtk.ticket.addPriceGlasses > 0) {
                    mvtkTickets.push({
                        ticketCode: mvtk.ticket.ticketCode,
                        ticketName: mvtk.ticket.ticketName,
                        ticketNameKana: mvtk.ticket.ticketNameKana,
                        ticketNameEng: mvtk.ticket.ticketNameEng,
                        stdPrice: 0,
                        addPrice: mvtk.ticket.addPrice,
                        salePrice: (<number>mvtk.ticket.addPrice) + (<number>mvtk.ticket.addPriceGlasses),
                        ticketNote: mvtk.code,
                        addPriceGlasses: mvtk.ticket.addPriceGlasses,
                        mvtkNum: mvtk.code,
                        glasses: true
                    });
                }
            }
        }

        return mvtkTickets.concat(result);
    }

    /**
     * オーダーID生成
     * @memberof PurchaseModel
     * @method createOrderId
     * @returns {void}
     */
    public createOrderId(): void {
        if (this.individualScreeningEvent === null
            || this.seatReservationAuthorization === null
            || this.seatReservationAuthorization.result === undefined) {
            return;
        }
        // GMOオーソリ取得
        const theaterCode = `000${this.individualScreeningEvent.coaInfo.theaterCode}`.slice(UtilModule.DIGITS['03']);
        const tmpReserveNum =
            `00000000${this.seatReservationAuthorization.result.updTmpReserveSeatResult.tmpReserveNum}`.slice(UtilModule.DIGITS['08']);
        // オーダーID 予約日 + 劇場ID(3桁) + 予約番号(8桁) + オーソリカウント(2桁)
        this.orderId =
            `${moment().format('YYYYMMDD')}${theaterCode}${tmpReserveNum}${`00${this.orderCount}`.slice(UtilModule.DIGITS['02'])}`;
        this.orderCount += 1;
    }

    /**
     * ムビチケ作品コード取得
     * @memberof PurchaseModel
     * @function getMvtkfilmCode
     * @returns {string}
     */
    public getMvtkfilmCode(): string {
        if (this.individualScreeningEvent === null) return '';
        const titleCode = this.individualScreeningEvent.coaInfo.titleCode;
        const titleBranchNum = this.individualScreeningEvent.coaInfo.titleBranchNum;
        const branch = `00${titleBranchNum}`.slice(UtilModule.DIGITS['02']);

        return `${titleCode}${branch}`;
    }

    /**
     * ムビチケ着券情報取得
     * @method getMvtkSeatInfoSync
     */
    // tslint:disable-next-line:max-func-body-length
    public getMvtkSeatInfoSync(options?: {
        deleteFlag?: string
        reservedDeviceType?: string
    }) {
        if (this.individualScreeningEvent === null
            || this.seatReservationAuthorization === null
            || this.seatReservationAuthorization.result === undefined) {
            return null;
        }

        const mvtkPurchaseNoInfo: {
            knyknrNo: string; // 購入管理番号（ムビチケ購入番号）
            pinCd: string; // PINコード（ムビチケ暗証番号）
            knshInfo: {
                knshTyp: string; // 券種区分
                miNum: number; // 枚数
            }[];
        }[] = [];
        const mvtkseat: {
            zskCd: string; // 座席コード
        }[] = [];

        for (const reserveTicket of this.reserveTickets) {
            const mvtk = this.mvtk.find((value) => {
                return (value.code === reserveTicket.mvtkNum && value.ticket.ticketCode === reserveTicket.ticketCode);
            });
            if (mvtk === undefined) continue;
            const mvtkTicket = mvtkPurchaseNoInfo.find((value) => (value.knyknrNo === mvtk.code));
            if (mvtkTicket !== undefined) {
                // 券種追加
                const tcket = mvtkTicket.knshInfo.find((value) => (value.knshTyp === mvtk.ykknInfo.ykknshTyp));
                if (tcket !== undefined) {
                    // 枚数追加
                    tcket.miNum = tcket.miNum + 1;
                } else {
                    // 新規券種作成
                    mvtkTicket.knshInfo.push({
                        knshTyp: mvtk.ykknInfo.ykknshTyp, //券種区分
                        miNum: 1 //枚数
                    });
                }
            } else {
                // 新規購入番号作成
                mvtkPurchaseNoInfo.push({
                    knyknrNo: mvtk.code, //購入管理番号（ムビチケ購入番号）
                    pinCd: UtilModule.base64Decode(mvtk.password), //PINコード（ムビチケ暗証番号）
                    knshInfo: [
                        {
                            knshTyp: mvtk.ykknInfo.ykknshTyp, //券種区分
                            miNum: 1 //枚数
                        }
                    ]
                });
            }
            mvtkseat.push({ zskCd: reserveTicket.seatCode });
        }
        if (mvtkPurchaseNoInfo.length === 0 || mvtkseat.length === 0) {
            return null;
        }

        const day = moment(this.individualScreeningEvent.coaInfo.dateJouei).format('YYYY/MM/DD');
        const time = `${UtilModule.timeFormat(
            this.individualScreeningEvent.startDate,
            this.individualScreeningEvent.coaInfo.dateJouei
        )}:00`;
        const tmpReserveNum = this.seatReservationAuthorization.result.updTmpReserveSeatResult.tmpReserveNum;
        const systemReservationNumber =
            `${this.individualScreeningEvent.coaInfo.dateJouei}${tmpReserveNum}`;
        const siteCode = `00${this.individualScreeningEvent.coaInfo.theaterCode}`.slice(UtilModule.DIGITS['02']);
        const deleteFlag = (options === undefined || options.deleteFlag === undefined)
            ? MVTK.services.seat.seatInfoSync.DeleteFlag.False
            : options.deleteFlag;
        const reservedDeviceType = (options === undefined || options.reservedDeviceType === undefined)
            ? MVTK.services.seat.seatInfoSync.ReserveDeviceType.EntertainerSitePC
            : options.reservedDeviceType;

        return {
            /**
             * 興行会社コード
             */
            kgygishCd: MvtkUtilModule.COMPANY_CODE,
            /**
             * 予約デバイス区分
             */
            yykDvcTyp: reservedDeviceType,
            /**
             * 取消フラグ
             */
            trkshFlg: deleteFlag,
            /**
             * 興行会社システム座席予約番号
             */
            kgygishSstmZskyykNo: systemReservationNumber,
            /**
             * 興行会社ユーザー座席予約番号
             */
            kgygishUsrZskyykNo: String(tmpReserveNum),
            /**
             * 上映日時
             */
            jeiDt: `${day} ${time}`,
            /**
             * 計上年月日
             */
            kijYmd: day,
            /**
             * サイトコード
             */
            stCd: siteCode,
            /**
             * スクリーンコード
             */
            screnCd: this.individualScreeningEvent.coaInfo.screenCode,
            /**
             * 購入管理番号情報
             */
            knyknrNoInfo: mvtkPurchaseNoInfo,
            /**
             * 座席情報（itemArray）
             */
            zskInfo: mvtkseat,
            /**
             * 作品コード
             */
            skhnCd: this.getMvtkfilmCode()
        };
    }
}
