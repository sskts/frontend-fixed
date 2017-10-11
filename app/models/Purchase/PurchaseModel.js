"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MVTK = require("@motionpicture/mvtk-service");
const moment = require("moment");
const MvtkUtilModule = require("../../modules/Purchase/Mvtk/MvtkUtilModule");
const UtilModule = require("../../modules/Util/UtilModule");
/**
 * 購入モデル
 * @class PurchaseModel
 */
class PurchaseModel {
    /**
     * @constructor
     * @param {any} session
     */
    // tslint:disable-next-line:cyclomatic-complexity
    constructor(session) {
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
    save(session) {
        const purchaseSession = {
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
    accessAuth(value) {
        let result = true;
        if (this.transaction === null)
            result = false;
        switch (value) {
            case PurchaseModel.SEAT_STATE:
                break;
            case PurchaseModel.TICKET_STATE:
                if (this.seatReservationAuthorization === null)
                    result = false;
                break;
            case PurchaseModel.INPUT_STATE:
                if (this.seatReservationAuthorization === null)
                    result = false;
                break;
            case PurchaseModel.CONFIRM_STATE:
                if (this.seatReservationAuthorization === null)
                    result = false;
                if (this.profile === null)
                    result = false;
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
    isUsedMvtk() {
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
    isReserveMvtkTicket() {
        let result = false;
        if (this.reserveTickets === null)
            return result;
        for (const reserveTicket of this.reserveTickets) {
            if (reserveTicket.mvtkNum !== '' && reserveTicket.mvtkNum.length > 0)
                result = true;
        }
        return result;
    }
    /**
     * 予約金額取得（決済する分）
     * @memberof PurchaseModel
     * @method getReserveAmount
     * @returns {number}
     */
    getReserveAmount() {
        const reserveTickets = this.reserveTickets;
        let amount = 0;
        if (reserveTickets === null)
            return amount;
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
    getPrice() {
        return (this.getReserveAmount() + this.getMvtkPrice());
    }
    /**
     * ムビチケ計上単価合計取得
     * @memberof PurchaseModel
     * @method getMvtkPrice
     * @returns {number}
     */
    getMvtkPrice() {
        const reserveTickets = this.reserveTickets;
        let price = 0;
        if (reserveTickets === null)
            return price;
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
    isExpired() {
        return (moment(this.expired).unix() < moment().unix());
    }
    /**
     * 券種リスト取得
     * @memberof PurchaseModel
     * @method getSalesTickets
     * @param {Request} req
     * @returns {ISalesTicket[]}
     */
    getSalesTickets(req) {
        if (this.individualScreeningEvent === null
            || this.salesTickets === null) {
            return [];
        }
        const result = [];
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
                    ticketName: `${ticket.ticketName}${req.__('common.glasses')}`,
                    ticketNameKana: ticket.ticketNameKana,
                    ticketNameEng: ticket.ticketNameEng,
                    stdPrice: ticket.stdPrice,
                    addPrice: ticket.addPrice,
                    salePrice: ticket.salePrice + ticket.addGlasses,
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
        const mvtkTickets = [];
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
                    ticketNote: req.__('common.mvtk_code') + mvtk.code,
                    addPriceGlasses: mvtk.ticket.addPriceGlasses,
                    mvtkNum: mvtk.code,
                    glasses: false
                });
                if (mvtk.ticket.addPriceGlasses > 0) {
                    mvtkTickets.push({
                        ticketCode: mvtk.ticket.ticketCode,
                        ticketName: `${mvtk.ticket.ticketName}${req.__('common.glasses')}`,
                        ticketNameKana: mvtk.ticket.ticketNameKana,
                        ticketNameEng: mvtk.ticket.ticketNameEng,
                        stdPrice: 0,
                        addPrice: mvtk.ticket.addPrice,
                        salePrice: mvtk.ticket.addPrice + mvtk.ticket.addPriceGlasses,
                        ticketNote: req.__('common.mvtk_code') + mvtk.code,
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
    createOrderId() {
        if (this.individualScreeningEvent === null
            || this.seatReservationAuthorization === null
            || this.seatReservationAuthorization.result === undefined) {
            return;
        }
        // GMOオーソリ取得
        const theaterCode = `000${this.individualScreeningEvent.coaInfo.theaterCode}`.slice(UtilModule.DIGITS['03']);
        const tmpReserveNum = `00000000${this.seatReservationAuthorization.result.updTmpReserveSeatResult.tmpReserveNum}`.slice(UtilModule.DIGITS['08']);
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
    getMvtkfilmCode() {
        if (this.individualScreeningEvent === null)
            return '';
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
    getMvtkSeatInfoSync(options) {
        if (this.individualScreeningEvent === null
            || this.seatReservationAuthorization === null
            || this.seatReservationAuthorization.result === undefined) {
            return null;
        }
        const mvtkPurchaseNoInfo = [];
        const mvtkseat = [];
        for (const reserveTicket of this.reserveTickets) {
            const mvtk = this.mvtk.find((value) => {
                return (value.code === reserveTicket.mvtkNum && value.ticket.ticketCode === reserveTicket.ticketCode);
            });
            if (mvtk === undefined)
                continue;
            const mvtkTicket = mvtkPurchaseNoInfo.find((value) => (value.knyknrNo === mvtk.code));
            if (mvtkTicket !== undefined) {
                // 券種追加
                const tcket = mvtkTicket.knshInfo.find((value) => (value.knshTyp === mvtk.ykknInfo.ykknshTyp));
                if (tcket !== undefined) {
                    // 枚数追加
                    tcket.miNum = tcket.miNum + 1;
                }
                else {
                    // 新規券種作成
                    mvtkTicket.knshInfo.push({
                        knshTyp: mvtk.ykknInfo.ykknshTyp,
                        miNum: 1 //枚数
                    });
                }
            }
            else {
                // 新規購入番号作成
                mvtkPurchaseNoInfo.push({
                    knyknrNo: mvtk.code,
                    pinCd: UtilModule.base64Decode(mvtk.password),
                    knshInfo: [
                        {
                            knshTyp: mvtk.ykknInfo.ykknshTyp,
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
        const time = `${UtilModule.timeFormat(this.individualScreeningEvent.startDate, this.individualScreeningEvent.coaInfo.dateJouei)}:00`;
        const tmpReserveNum = this.seatReservationAuthorization.result.updTmpReserveSeatResult.tmpReserveNum;
        const systemReservationNumber = `${this.individualScreeningEvent.coaInfo.dateJouei}${tmpReserveNum}`;
        const siteCode = `00${this.individualScreeningEvent.coaInfo.theaterCode}`.slice(UtilModule.DIGITS['02']);
        const deleteFlag = (options === undefined || options.deleteFlag === undefined)
            ? MVTK.SeatInfoSyncUtilities.DELETE_FLAG_FALSE
            : options.deleteFlag;
        const reservedDeviceType = (options === undefined || options.reservedDeviceType === undefined)
            ? MVTK.SeatInfoSyncUtilities.RESERVED_DEVICE_TYPE_ENTERTAINER_SITE_PC
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
PurchaseModel.PERFORMANCE_STATE = 0;
PurchaseModel.SEAT_STATE = 1;
PurchaseModel.TICKET_STATE = 2;
PurchaseModel.INPUT_STATE = 3;
PurchaseModel.CONFIRM_STATE = 4;
PurchaseModel.COMPLETE_STATE = 5;
exports.PurchaseModel = PurchaseModel;
