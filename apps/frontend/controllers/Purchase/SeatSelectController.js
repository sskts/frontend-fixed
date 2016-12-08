"use strict";
const PurchaseController_1 = require('./PurchaseController');
const SeatSelectForm_1 = require('../../forms/Purchase/SeatSelectForm');
class SeatSelectController extends PurchaseController_1.default {
    /**
     * 座席選択
     */
    index() {
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
        this.req.session['purchasePerformanceData'] = data;
        this.req.session['purchasePerformanceFilm'] = film;
        //座席選択表示
        this.res.locals['seatReservationStateExtraction'] = seatReservationStateExtraction;
        this.res.locals['data'] = data;
        this.res.locals['film'] = film;
        this.res.locals['step'] = 0;
        this.res.render('purchase/seatSelect');
    }
    /**
     * 座席決定
     */
    submit() {
        //バリデーション
        SeatSelectForm_1.default(this.req, this.res, () => {
            //変更状態
            let changetype = this.getChangeType();
            if (changetype === 0) {
                //新規
                //モーションAPI仮予約(仮予約番号発行)
                let reservationNo = '123456789';
                //仮予約番号をセッションへ
                this.req.session['reservationNo'] = reservationNo;
                let seats = [];
                let seatCodes = JSON.parse(this.req.body.seatCodes);
                for (let code of seatCodes) {
                    seats.push({
                        code: code,
                        type: ''
                    });
                }
                //座席情報をセッションへ
                this.req.session['purchaseSeats'] = seats;
            }
            else if (changetype === 1) {
                //変更
                //モーションAPI仮予約削除
                //モーションAPI仮予約(仮予約番号発行)
                let reservationNo = '123456789';
                //仮予約番号をセッションへ
                this.req.session['reservationNo'] = reservationNo;
                let seats = [];
                let seatCodes = JSON.parse(this.req.body.seatCodes);
                for (let code of seatCodes) {
                    seats.push({
                        code: code,
                        type: ''
                    });
                }
                //座席情報をセッションへ
                this.req.session['purchaseSeats'] = seats;
            }
            else {
            }
            this.logger.debug('購入者情報入力完了', this.req.session['purchaseSeats']);
            //券種選択へ
            this.res.redirect(this.router.build('purchase.ticketTypeSelect', {}));
        });
    }
    /**
     * 変更状態
     */
    getChangeType() {
        let result;
        if (!this.req.session['reservationNo']) {
            //新規
            result = 0;
        }
        else {
            //変更
            //変更なし
            result = 1;
        }
        return result;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SeatSelectController;
