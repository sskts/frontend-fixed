import Service from '../Service';
import request = require('request');
import http = require('http');

export default class ReservationService extends Service {
    /**
    * 空席状況
    *
    * @param {any} args 
    */
    public vacancySituation(args: any, cb: request.RequestCallback): void {
        let method = 'vacancySituation';
        let url: string = this.wsdl + method;
        let options: request.CoreOptions = {};
        this.request(url, options, cb);
    }

    /**
    * 座席予約状態抽出
    *
    * @param {any} args 
    */
    public seatReservationStateExtraction(args: any, cb: request.RequestCallback): void {
        let method = 'seatReservationStateExtraction';
        let url: string = this.wsdl + method;
        let options: request.CoreOptions = {};
        this.request(url, options, cb);
    }

    /**
    * 座席仮予約
    *
    * @param {any} args 
    */
    public preSeatReservation(args: any, cb: request.RequestCallback): void {
        let method = 'preSeatReservation';
        let url: string = this.wsdl + method;
        let options: request.CoreOptions = {};
        this.request(url, options, cb);
    }
}

module reservationService {
    //予約状況
    export interface vacancySituationResult {
        status: string; // ステータス									
        message: string; // メッセージ								
        facilityCode: string; // 施設コード									
        scheduleList: schedule[]; // 日程リスト        						
    }

    interface schedule {
        screeningDate: string; // 上映日									
        performanceList: performance[]; // パフォーマンスリスト	
    }

    interface performance {
        workCode: string; // 作品コード									
        workBranchNumber: number; // 作品枝番									
        performanceCode: string; // パフォーマンスコード									
        screeningStartTime: string; // 上映開始時刻									
        availableNumber: number; // 予約可能数									
        reservableRemainingNumberOfSeats: string; // 予約可能残席数									
        performanceNumber: number; // パフォーマンス数	
    }

    // 座席予約状態抽出
    export interface seatReservationStateExtractionResult {
        status: string, // ステータス
        message: string, // メッセージ
        reservableRemainingNumberOfSeats: number, // 予約可能残席数
        seatRowNumber: number, //座席列数
        seatList: seat[]
    }

    interface seat {
        seatSection: string, // 座席セクション
        vacancyList: vacancy[]
    }

    interface vacancy {
        seatingNumber: string // 座席番号
    }
}