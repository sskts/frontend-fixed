import PurchaseController from './PurchaseController';


export default class SeatSelectController extends PurchaseController {
    /**
     * 座席選択
     */
    public index(): void {

        //コアAPIから作品、座席データ取得
        let data: any = {
            facilityCode: '0000', // 施設コード
            screeningDate: '20161205', // 上映日
            workCode: '12345', // 作品コード
            workBranchNumber: 12, // 作品枝番
            screeningStartTime: '1230', // 上映開始時刻
            screenCode: '0000',
        }
        

        //劇場名、スクリーン名取得
        data['facilityName'] = 'シネマサンシャイン池袋';
        data['screenName'] = 'スクリーン2'; 

        //スケジュールマスター抽出
        let film = {
            status : '0', // ステータス
            message : 'メッセージ', // メッセージ
            facilityCode : '0000', // 施設コード
            workCode : '12345', // 作品コード
            workBranchNumber : '12345', // 作品枝番
            titleOfWork	: '君の名は', // 作品タイトル名
            titleKana : '君の名は', // 作品タイトル名カナ
            titleOfWorkTitleEnglish	: '君の名は', // 作品タイトル名（英）
            titleShortName	: '君の名は', // 作品タイトル名省略
            titleAbbreviationKana : '君の名は', // 作品タイトル名省略カナ
            titleOmittedEnglish : '君の名は', // 作品タイトル名省略（英）
            originalTitle : '君の名は', // 原題
            originalTitleKana : '君の名は', // 原題カナ
            ageRestrictionPictureClassification	: 'PG!"', // 年齢制限　映倫区分
            videoClassification	: '2D', // 映像区分
            screeningMethodClassification : 'IMAX', // 上映方式区分
            subtitleDubbingClassification : '字幕', // 字幕吹替区分
            screeningTime : 120, // 上映時間
            scheduledStartDateOfThePerformance : '20161201', // 公演開始予定日
            scheduledEndDateOfThePerformance : '20161230' // 公演終了予定日
        };


        // 座席予約状態抽出
        let seatReservationStateExtraction = {
            status: '0', // ステータス
            message: 'メッセージ', // メッセージ
            reservableRemainingNumberOfSeats: 5, // 予約可能残席数
            seatRowNumber: 10, //座席列数
            seatList: [
                {
                    seatSection: '0', // 座席セクション
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
    public submit(): void {
        //変更状態
        let changetype = this.getChangeType();        

        if (changetype === 0) {
            //新規
            //モーションAPI仮予約(仮予約番号発行)
            let provisionalReservationNumber = '123456789';
            //仮予約番号をセッションへ
            this.req.session['provisionalReservationNumber'] = provisionalReservationNumber;

            let seats: {
                code: string,
                type: string
            }[] = [];
            
            let seatCodes = JSON.parse(this.req.body.seatCodes);
            for (let code of seatCodes) {
                seats.push({
                    code: code,
                    type: ''
                })
            }
            //座席情報をセッションへ
            this.req.session['purchaseSeats'] = seats;
        } else if (changetype === 1) {
            //変更
            //モーションAPI仮予約削除
            //モーションAPI仮予約(仮予約番号発行)
            let provisionalReservationNumber = '123456789';
            //仮予約番号をセッションへ
            this.req.session['provisionalReservationNumber'] = provisionalReservationNumber;

            let seats: {
                code: string,
                type: string
            }[] = [];
            
            let seatCodes = JSON.parse(this.req.body.seatCodes);
            for (let code of seatCodes) {
                seats.push({
                    code: code,
                    type: ''
                })
            }
            //座席情報をセッションへ
            this.req.session['purchaseSeats'] = seats;
            
        } else {
            //変更なし

        }
        
        
        //券種選択へ
        this.res.redirect(this.router.build('purchase.ticketTypeSelect', {}));
    }

    /**
     * 変更状態
     */
    private getChangeType(): number {
        let result: number;
        if (!this.req.session['provisionalReservationNumber']) {
            //新規
            result = 0;
        } else {
            //変更
            //変更なし
            result = 1;
        }
        return result;
    }
 
    


}
