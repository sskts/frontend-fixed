"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mvtkReserve = require("@motionpicture/mvtk-reserve-service");
const moment = require("moment");
const mvtk_util_controller_1 = require("../controllers/purchase/mvtk/mvtk-util.controller");
const functions_1 = require("../functions");
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
    constructor(session = {}) {
        this.screeningEvent = session.screeningEvent;
        this.seller = session.seller;
        this.transaction = session.transaction;
        this.salesTickets = session.salesTickets;
        this.reserveTickets = (session.reserveTickets !== undefined) ? session.reserveTickets : [];
        this.seatReservationAuthorization = session.seatReservationAuthorization;
        this.orderId = session.orderId;
        this.orderCount = (session.orderCount !== undefined) ? session.orderCount : 0;
        this.creditCardAuthorization = session.creditCardAuthorization;
        this.profile = session.profile;
        this.creditCards = (session.creditCards !== undefined) ? session.creditCards : [];
        this.gmo = session.gmo;
        this.mvtk = (session.mvtk !== undefined) ? session.mvtk : [];
        this.mvtkAuthorization = session.mvtkAuthorization;
        this.expired = session.expired;
    }
    /**
     * セッションへ保存
     * @memberof PurchaseModel
     * @method toSession
     * @returns {void}
     */
    save(session) {
        const purchaseSession = {
            screeningEvent: this.screeningEvent,
            seller: this.seller,
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
        if (this.screeningEvent === undefined
            || this.screeningEvent.superEvent.coaInfo === undefined) {
            return false;
        }
        const today = moment().format('YYYYMMDD');
        return (this.screeningEvent.superEvent.coaInfo.flgMvtkUse === '1'
            && this.screeningEvent.superEvent.coaInfo.dateMvtkBegin !== undefined
            && Number(this.screeningEvent.superEvent.coaInfo.dateMvtkBegin) <= Number(today));
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
    getSalesTickets() {
        if (this.screeningEvent === null
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
                    ticketName: ticket.ticketName,
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
                        salePrice: mvtk.ticket.addPrice + mvtk.ticket.addPriceGlasses,
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
    // /**
    //  * オーダーID生成
    //  * @memberof PurchaseModel
    //  * @method createOrderId
    //  * @returns {void}
    //  */
    // public createOrderId(): void {
    //     if (this.screeningEvent === null
    //         || this.screeningEvent.coaInfo === undefined
    //         || this.seatReservationAuthorization === null
    //         || this.seatReservationAuthorization.result === undefined) {
    //         return;
    //     }
    //     // GMOオーソリ取得
    //     const theaterCode = `000${this.screeningEvent.coaInfo.theaterCode}`.slice(Digits['03']);
    //     const tmpReserveNum =
    //         `00000000${this.seatReservationAuthorization.result.updTmpReserveSeatResult.tmpReserveNum}`.slice(Digits['08']);
    //     // オーダーID 予約日 + 劇場ID(3桁) + 予約番号(8桁) + オーソリカウント(2桁)
    //     this.orderId =
    //         `${moment().format('YYYYMMDD')}${theaterCode}${tmpReserveNum}${`00${this.orderCount}`.slice(Digits['02'])}`;
    //     this.orderCount += 1;
    // }
    /**
     * ムビチケ作品コード取得
     * @memberof PurchaseModel
     * @function getMvtkfilmCode
     * @returns {string}
     */
    getMvtkfilmCode() {
        if (this.screeningEvent === undefined
            || this.screeningEvent.coaInfo === undefined) {
            return '';
        }
        const titleCode = this.screeningEvent.coaInfo.titleCode;
        const titleBranchNum = this.screeningEvent.coaInfo.titleBranchNum;
        const branch = `00${titleBranchNum}`.slice(functions_1.Digits['02']);
        return `${titleCode}${branch}`;
    }
    /**
     * ムビチケ着券情報取得
     * @method getMvtkSeatInfoSync
     */
    getMvtkSeatInfoSync(options) {
        if (this.screeningEvent === undefined
            || this.screeningEvent.coaInfo === undefined
            || this.seatReservationAuthorization === undefined
            || this.seatReservationAuthorization.result === undefined) {
            return;
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
                    mvtkTicket.knshInfo.push({ knshTyp: mvtk.ykknInfo.ykknshTyp, miNum: 1 }); // 券種区分, 枚数
                }
            }
            else {
                // 新規購入番号作成
                mvtkPurchaseNoInfo.push({
                    knyknrNo: mvtk.code,
                    pinCd: functions_1.base64Decode(mvtk.password),
                    knshInfo: [{ knshTyp: mvtk.ykknInfo.ykknshTyp, miNum: 1 }] // 券種区分, 枚数
                });
            }
            mvtkseat.push({ zskCd: reserveTicket.seatCode });
        }
        if (mvtkPurchaseNoInfo.length === 0 || mvtkseat.length === 0) {
            return;
        }
        const day = moment(this.screeningEvent.coaInfo.dateJouei).format('YYYY/MM/DD');
        const time = `${functions_1.timeFormat(this.screeningEvent.startDate, this.screeningEvent.coaInfo.dateJouei)}:00`;
        const tmpReserveNum = this.seatReservationAuthorization.result.responseBody.tmpReserveNum;
        const systemReservationNumber = `${this.screeningEvent.coaInfo.dateJouei}${tmpReserveNum}`;
        const siteCode = Number(this.screeningEvent.coaInfo.theaterCode.slice(functions_1.Digits['02'])).toString();
        const deleteFlag = (options === undefined || options.deleteFlag === undefined)
            ? mvtkReserve.services.seat.seatInfoSync.DeleteFlag.False : options.deleteFlag;
        const reservedDeviceType = (options === undefined || options.reservedDeviceType === undefined)
            ? mvtkReserve.services.seat.seatInfoSync.ReserveDeviceType.EntertainerSitePC : options.reservedDeviceType;
        return {
            kgygishCd: mvtk_util_controller_1.COMPANY_CODE,
            yykDvcTyp: reservedDeviceType,
            trkshFlg: deleteFlag,
            kgygishSstmZskyykNo: systemReservationNumber,
            kgygishUsrZskyykNo: String(tmpReserveNum),
            jeiDt: `${day} ${time}`,
            kijYmd: day,
            stCd: siteCode,
            screnCd: this.screeningEvent.coaInfo.screenCode,
            knyknrNoInfo: mvtkPurchaseNoInfo,
            zskInfo: mvtkseat,
            skhnCd: this.getMvtkfilmCode() // 作品コード
        };
    }
}
exports.PurchaseModel = PurchaseModel;
PurchaseModel.PERFORMANCE_STATE = 0;
PurchaseModel.SEAT_STATE = 1;
PurchaseModel.TICKET_STATE = 2;
PurchaseModel.INPUT_STATE = 3;
PurchaseModel.CONFIRM_STATE = 4;
PurchaseModel.COMPLETE_STATE = 5;
