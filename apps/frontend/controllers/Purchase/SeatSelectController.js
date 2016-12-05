"use strict";
const PurchaseController_1 = require('./PurchaseController');
class SeatSelectController extends PurchaseController_1.default {
    /**
     * 座席選択
     */
    index() {
        let token = '123456789';
        this.res.locals.token = token;
        //トークンをセッションへ
        this.req.session['purchaseToken'] = token;
        //コアAPIから作品、座席データ取得
        let data = {
            facilityCode: '0000',
            screeningDate: '20161205',
            workCode: '12345',
            workBranchNumber: 12,
            screeningStartTime: '1230',
            screenCode: '0000',
        };
        //劇場名、スクリーン名取得
        data['facilityName'] = 'シネマサンシャイン池袋';
        data['screenName'] = 'スクリーン2';
        //スケジュールマスター抽出
        let film = {
            status: '0',
            message: 'メッセージ',
            facilityCode: '0000',
            workCode: '12345',
            workBranchNumber: '12345',
            titleOfWork: '君の名は',
            titleKana: '君の名は',
            titleOfWorkTitleEnglish: '君の名は',
            titleShortName: '君の名は',
            titleAbbreviationKana: '君の名は',
            titleOmittedEnglish: '君の名は',
            originalTitle: '君の名は',
            originalTitleKana: '君の名は',
            ageRestrictionPictureClassification: 'PG!"',
            videoClassification: '2D',
            screeningMethodClassification: 'IMAX',
            subtitleDubbingClassification: '字幕',
            screeningTime: 120,
            scheduledStartDateOfThePerformance: '20161201',
            scheduledEndDateOfThePerformance: '20161230' // 公演終了予定日
        };
        // 座席予約状態抽出
        let seatReservationStateExtraction = {
            status: '0',
            message: 'メッセージ',
            reservableRemainingNumberOfSeats: 5,
            seatRowNumber: 10,
            seatList: [
                {
                    seatSection: '0',
                    vacancyList: [
                        {
                            seatingNumber: 'A-1' // 座席番号
                        },
                    ]
                },
            ]
        };
        //作品情報をセッションへ
        this.req.session['purchasePerformance'] = {
            data: data,
            film: film
        };
        //座席選択表示
        this.res.locals['data'] = data;
        this.res.locals['film'] = film;
        this.res.locals['seatReservationStateExtraction'] = seatReservationStateExtraction;
        this.res.render('purchase/seatSelect');
    }
    /**
     * 座席決定
     */
    seatSelect() {
        this.logger.debug('seatCodes', this.req.body);
        this.checkToken();
        let seats = [];
        this.logger.debug('seatCodes', this.req.body.seatCodes);
        let seatCodes = JSON.parse(this.req.body.seatCodes);
        for (let code of seatCodes) {
            seats.push({
                code: code,
                type: null
            });
        }
        //モーションAPI仮抑え
        //座席情報をセッションへ
        this.req.session['purchaseSeats'] = seats;
        //券種選択へ
        this.res.redirect(this.router.build('purchase.ticketTypeSelect', {}));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SeatSelectController;
