import request = require("request");
import config = require("config");

let COA_URI = config.get<string>("coa_api_endpoint");

/**
 * API認証情報
 */
let credentials = {
    access_token: "",
    expired_at: ""
}

/**
 * アクセストークンを発行する
 */
function publishAccessToken(cb: (err: Error) => void): void {
    // アクセストークン有効期限チェック
    if (credentials.access_token && Date.parse(credentials.expired_at) > Date.now()) return cb(null);

    request.post({
        url: `${COA_URI}/token/access_token`,
        form: {
            refresh_token: config.get<string>("coa_api_refresh_token")
        },
        json: true
    }, (error, response, body) => {
        if (error) return cb(error);
        if (typeof body === "string")  return cb(new Error(body));
        if (body.message) return cb(new Error(body.message));

        credentials = body;
        console.log("credentials:", credentials);

        cb(null);
    });
}

/**
 * 施設マスター抽出
 */
export namespace findTheaterInterface {
    export interface Args {
        /** 劇場コード */
        theater_code: string
    }
    export interface Result {
        /** 施設コード */
        theater_code: string,
        /** 施設名称 */
        theater_name: string,
        /** 施設名称（カナ） */
        theater_name_eng: string,
        /** 施設名称（英） */
        theater_name_kana: string
    }
    export function call(args: Args, cb: (err: Error, result: Result) => void): void {
        publishAccessToken((err) => {
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/theater/`,
                auth: {bearer: credentials.access_token},
                json: true
            }, (error, response, body) => {
                if (error) return cb(error, null);
                if (typeof body === "string")  return cb(new Error(body), null);
                if (body.message) return cb(new Error(body.message), null);
                if (body.status !== 0) return cb(new Error(body.status), null);

                cb(null, {
                    theater_code: body.theater_code,
                    theater_name: body.theater_name,
                    theater_name_eng: body.theater_name_eng,
                    theater_name_kana: body.theater_name_kana,
                });
            });
        });
    }
}

/**
 * 作品マスター抽出
 */
export namespace findFilmsByTheaterCodeInterface {
    export interface Args {
        /** 劇場コード */
        theater_code: string
    }
    export interface Result {
        /** 作品コード */
        title_code: string,
        /** 作品枝番 */
        title_branch_num: string,
        /** 作品タイトル名 */
        title_name: string,
        /** 作品タイトル名（カナ） */
        title_name_kana: string,
        /** 作品タイトル名（英） */
        title_name_eng: string,
        /** 作品タイトル名省略 */
        title_name_short: string,
        /** 原題 */
        title_name_orig: string,
        /** 映倫区分 */
        kbn_eirin: string,
        /** 映像区分 */
        kbn_eizou: string,
        /** 上映方式区分 */
        kbn_joueihousiki: string,
        /** 字幕吹替区分 */
        kbn_jimakufukikae: string,
        /** 上映時間 */
        show_time: number,
        /** 公演開始予定日 */
        date_begin: string,
        /** 公演終了予定日 */
        date_end: string
    };
    export function call(args: Args, cb: (err: Error, results: Array<Result>) => void): void {
        publishAccessToken((err) => {
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/title/`,
                auth: {bearer: credentials.access_token},
                json: true
            }, (error, response, body) => {
                if (error) return cb(error, null);
                if (typeof body === "string")  return cb(new Error(body), null);
                if (body.message) return cb(new Error(body.message), null);
                if (body.status !== 0) return cb(new Error(body.status), null);

                cb(null, body.list_title);
            });
        });
    }
}

/**
 * スクリーンマスター抽出
 */
export namespace findScreensByTheaterCodeInterface {
    export interface Args {
        /** 劇場コード */
        theater_code: string
    }
    export interface Result {
        /** スクリーンコード */
        screen_code: string,
        /** スクリーン名 */
        screen_name: string,
        /** スクリーン名（英） */
        screen_name_eng: string,
        /** 座席リスト */
        list_seat: Array<{
            /** 座席番号 */
            seat_num: string,
            /** 特別席フラグ */
            flg_special: string,
            /** 車椅子席フラグ */
            flg_hc: string,
            /** ペア席フラグ */
            flg_pair: string,
            /** 自由席フラグ */
            flg_free: string,
            /** 予備席フラグ */
            flg_spare: string
        }>
    };
    export function call(args: Args, cb: (err: Error, results: Array<Result>) => void): void {
        publishAccessToken((err) => {
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/screen/`,
                auth: {bearer: credentials.access_token},
                json: true
            }, (error, response, body) => {
                if (error) return cb(error, null);
                if (typeof body === "string")  return cb(new Error(body), null);
                if (body.message) return cb(new Error(body.message), null);
                if (body.status !== 0) return cb(new Error(body.status), null);

                cb(null, body.list_screen);
            });
        });
    }
}

/**
 * スケジュールマスター抽出
 */
export namespace findPerformancesByTheaterCodeInterface {
    export interface Args {
        /** 劇場コード */
        theater_code: string,
        /** スケジュールを抽出する上映日の開始日　　※日付は西暦8桁 "YYYYMMDD" */
        begin: string,
        /** スケジュールを抽出する上映日の終了日　　※日付は西暦8桁 "YYYYMMDD" */
        end: string,
    }
    export interface Result {
        /** 上映日 */
        date_jouei: string,
        /** 作品コード */
        title_code: string,
        /** 作品枝番 */
        title_branch_num: string,
        /** 上映開始時刻 */
        time_begin: string,
        /** 上映終了時刻 */
        time_end: string,
        /** スクリーンコード */
        screen_code: string,
        /** トレーラー時間 */
        trailer_time: number,
        /** サービス区分 */
        kbn_service: string,
        /** 音響区分 */
        kbn_acoustic: string,
        /** サービスデイ名称 */
        name_service_day: string,
    }
    export function call(args: Args, cb: (err: Error, results: Array<Result>) => void): void {
        publishAccessToken((err) => {
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/schedule/`,
                auth: {bearer: credentials.access_token},
                json: true,
                qs: {
                    begin: args.begin,
                    end: args.end
                }
            }, (error, response, body) => {
                if (error) return cb(error, null);
                if (typeof body === "string")  return cb(new Error(body), null);
                if (body.message) return cb(new Error(body.message), null);
                if (body.status !== 0) return cb(new Error(body.status), null);

                cb(null, body.list_schedule);
            });
        });
    }
}

/**
 * 座席仮予約
 */
export namespace reserveSeatsTemporarilyInterface {
    export interface Args {
        /** 施設コード */
        theater_code: string,
        /** 上映日 */
        date_jouei: string,
        /** 作品コード */
        title_code: string,
        /** 作品枝番 */
        title_branch_num: string,
        /** 上映時刻 */
        time_begin: string,
        /** 予約座席数 */
        // cnt_reserve_seat: number,
        /** 予約座席リスト */
        list_seat: Array<{
            /** 座席セクション */
            seat_section: string,
            /** 座席番号 */
            seat_num: string,
        }>
    }
    export interface Result {
        /** 座席チケット仮予約番号 */
        tmp_reserve_num: number,
        /** 仮予約結果リスト(仮予約失敗時の座席毎の仮予約状況) */
        list_tmp_reserve: Array<{
            /** 座席セクション */
            seat_section: string,
            /** 座席番号 */
            seat_num: string,
            /** 仮予約ステータス */
            sts_tmp_reserve: string,
        }>
    }
    export function call(args: Args, cb: (err: Error, result: Result) => void): void {
        console.log("reserveSeatsTemporarilyInterface calling...", args);
        publishAccessToken((err) => {
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/upd_tmp_reserve_seat/`,
                auth: {bearer: credentials.access_token},
                json: true,
                qs: {
                    date_jouei: args.date_jouei,
                    title_code: args.title_code,
                    title_branch_num: args.title_branch_num,
                    time_begin: args.time_begin,
                    cnt_reserve_seat: args.list_seat.length,
                    seat_section: args.list_seat.map((value) => {return value.seat_section;}),
                    seat_num: args.list_seat.map((value) => {return value.seat_num;}),
                },
                useQuerystring: true
            }, (error, response, body) => {
                console.log("reserveSeatsTemporarilyInterface called.", error, body);
                if (error) return cb(error, null);
                if (typeof body === "string")  return cb(new Error(body), null);
                if (body.message) return cb(new Error(body.message), null);
                if (body.status !== 0) return cb(new Error(body.status), null);

                cb(null, {
                    tmp_reserve_num: body.tmp_reserve_num,
                    list_tmp_reserve: body.list_tmp_reserve
                });
            });
        });
    }
}

/**
 * 座席仮予約削除
 */
export namespace deleteTmpReserveInterface {
    export interface Args {
        /** 施設コード */
        theater_code: string,
        /** 上映日 */
        date_jouei: string,
        /** 作品コード */
        title_code: string,
        /** 作品枝番 */
        title_branch_num: string,
        /** 上映時刻 */
        time_begin: string,
        /** 座席チケット仮予約番号 */
        tmp_reserve_num: string,
    }
    export interface Result {
    }
    export function call(args: Args, cb: (err: Error, result: boolean) => void): void {
        console.log("deleteTmpReserveInterface calling...", args);
        publishAccessToken((err) => {
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/del_tmp_reserve/`,
                auth: {bearer: credentials.access_token},
                json: true,
                qs: {
                    date_jouei: args.date_jouei,
                    title_code: args.title_code,
                    title_branch_num: args.title_branch_num,
                    time_begin: args.time_begin,
                    tmp_reserve_num: args.tmp_reserve_num,
                },
                useQuerystring: true
            }, (error, response, body) => {
                console.log("deleteTmpReserveInterface called.", error, body);
                if (error) return cb(error, null);
                if (typeof body === "string")  return cb(new Error(body), null);
                if (body.message) return cb(new Error(body.message), null);
                if (body.status !== 0) return cb(new Error(body.status), null);

                cb(null, true);
            });
        });
    }
}

/**
 * 座席予約状態抽出
 */
export namespace getStateReserveSeatInterface {
    export interface Args {
        /** 施設コード */
        theater_code: string,
        /** 上映日 */
        date_jouei: string,
        /** 作品コード */
        title_code: string,
        /** 作品枝番 */
        title_branch_num: string,
        /** 上映時刻 */
        time_begin: string,
    }
    export interface Result {
        /** 予約可能残席数 */
        cnt_reserve_free: number,
        /** 座席列数 */
        cnt_seat_line: number,
        /** 座席リスト */
        list_seat: Array<{
            /** 座席セクション */
            seat_section: string,
            /** 空席リスト */
            list_free_seat: Array<{
                /** 座席番号 */
                seat_num: string,
            }>
        }>
    }
    export function call(args: Args, cb: (err: Error, result: Result) => void): void {
        console.log("getStateReserveSeat calling...", args);
        publishAccessToken((err) => {
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/state_reserve_seat/`,
                auth: {bearer: credentials.access_token},
                json: true,
                qs: {
                    date_jouei: args.date_jouei,
                    title_code: args.title_code,
                    title_branch_num: args.title_branch_num,
                    time_begin: args.time_begin,
                },
                useQuerystring: true
            }, (error, response, body) => {
                console.log("getStateReserveSeat called.", error, body);
                if (error) return cb(error, null);
                if (typeof body === "string")  return cb(new Error(body), null);
                if (body.message) return cb(new Error(body.message), null);
                if (body.status !== 0) return cb(new Error(body.status), null);

                cb(null, {
                    cnt_reserve_free: body.cnt_reserve_free,
                    cnt_seat_line: body.cnt_seat_line,
                    list_seat: body.list_seat,
                });
            });
        });
    }
}

/**
 * 空席状況
 */
export namespace countFreeSeatInterface {
    export interface Args {
        /** 劇場コード */
        theater_code: string,
        /** 空席情報を抽出する上映日の開始日　　※日付は西暦8桁 "YYYYMMDD" */
        begin: string,
        /** 空席情報を抽出する上映日の終了日　　※日付は西暦8桁 "YYYYMMDD" */
        end: string,
    }
    export interface Result {
        /** 施設コード */
        theater_code: string,
        /** 日程リスト */
        list_date: Array<{
            /** 上映日(日付は西暦8桁 "YYYYMMDD") */
            date_jouei: string,
            /** パフォーマンスリスト */
            list_performance: Array<{
                /** 作品コード(5桁) */
                title_code: string,
                /** 作品枝番(2桁) */
                title_branch_num: string,
                /** 上映開始時刻(4桁 "HHMM") */
                time_begin: string,
                /** 予約可能数(パフォーマンスの予約可能座席数) */
                cnt_reserve_max: number,
                /** 予約可能残席数(予約可能座席数から仮予約を含む予約数を引いた残席数) */
                cnt_reserve_free: number,
            }>,
            /** パフォーマンス数 */
            cnt_performance: number,
        }>
    }
    export function call(args: Args, cb: (err: Error, result: Result) => void): void {
        console.log("countFreeSeat calling...", args);
        publishAccessToken((err) => {
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/count_free_seat/`,
                auth: {bearer: credentials.access_token},
                json: true,
                qs: {
                    begin: args.begin,
                    end: args.end,
                },
                useQuerystring: true
            }, (error, response, body) => {
                console.log("countFreeSeat called.", error, body);
                if (error) return cb(error, null);
                if (typeof body === "string")  return cb(new Error(body), null);
                if (body.message) return cb(new Error(body.message), null);
                if (body.status !== 0) return cb(new Error(body.status), null);

                cb(null, {
                    theater_code: body.theater_code,
                    list_date: body.list_date,
                });
            });
        });
    }
}

/**
 * 販売可能チケット情報
 */
export namespace salesTicketInterface {
    export interface Args {
        /** 施設コード */
        theater_code: string,
        /** 上映日 */
        date_jouei: string,
        /** 作品コード */
        title_code: string,
        /** 作品枝番 */
        title_branch_num: string,
        /** 上映時刻 */
        time_begin: string,
    }
    export interface Result {
        /** 購入可能チケット情報リスト */
        list_ticket: Array<{
            /** チケットコード */
            ticket_code: string,
            /** チケット名 */
            ticket_name: string,
            /** チケット名（カナ） */
            ticket_name_kana: string,
            /** チケット名（英） */
            ticket_name_eng: string,
            /** 標準単価 */
            std_price: number,
            /** 加算単価(３Ｄ，ＩＭＡＸ、４ＤＸ等の加算料金) */
            add_price: number,
            /** 販売単価(標準単価＋加算単価) */
            sale_price: number,
            /** 人数制限(制限が無い場合は１) */
            limit_count: number,
            /** 制限単位(１：ｎ人単位、２：ｎ人以上) */
            limit_unit: string,
            /** チケット備考(注意事項等) */
            ticket_note: string,
        }>
    }
    export function call(args: Args, cb: (err: Error, result: Result) => void): void {
        console.log("salesTicket calling...", args);
        publishAccessToken((err) => {
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/sales_ticket/`,
                auth: {bearer: credentials.access_token},
                json: true,
                qs: {
                    date_jouei: args.date_jouei,
                    title_code: args.title_code,
                    title_branch_num: args.title_branch_num,
                    time_begin: args.time_begin,
                },
                useQuerystring: true
            }, (error, response, body) => {
                console.log("salesTicket called.", error, body);
                if (error) return cb(error, null);
                if (typeof body === "string")  return cb(new Error(body), null);
                if (body.message) return cb(new Error(body.message), null);
                if (body.status !== 0) return cb(new Error(body.status), null);

                cb(null, {
                    list_ticket: body.list_ticket,
                });
            });
        });
    }
}

/**
 * 券種マスター抽出
 */
export namespace ticketInterface {
    export interface Args {
        /** 施設コード */
        theater_code: string
    }
    export interface Result {
        /** 券種リスト */
        list_ticket: Array<{
            /** チケットコード */
            ticket_code: string,
            /** チケット名 */
            ticket_name: string,
            /** チケット名(カナ) */
            ticket_name_kana: string,
            /** チケット名(英) */
            ticket_name_eng: string,
        }>
    }
    export function call(args: Args, cb: (err: Error, result: Result) => void): void {
        console.log("ticket calling...", args);
        publishAccessToken((err) => {
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/ticket/`,
                auth: {bearer: credentials.access_token},
                json: true,
                qs: {
                },
                useQuerystring: true
            }, (error, response, body) => {
                console.log("ticket called.", error, body);
                if (error) return cb(error, null);
                if (typeof body === "string")  return cb(new Error(body), null);
                if (body.message) return cb(new Error(body.message), null);
                if (body.status !== 0) return cb(new Error(body.status), null);

                cb(null, {
                    list_ticket: body.list_ticket,
                });
            });
        });
    }
}

/**
 * 座席本予約
 */
export namespace updateReserveInterface {
    export interface Args {
        /** 施設コード */
        theater_code: string,
        /** 上映日 */
        date_jouei: string,
        /** 作品コード */
        title_code: string,
        /** 作品枝番 */
        title_branch_num: string,
        /** 上映時刻 */
        time_begin: string,
        /** 座席チケット仮予約番号 */
        tmp_reserve_num: string,
        /** 予約者名 */
        reserve_name: string,
        /** 予約者名（かな） */
        reserve_name_kana: string,
        /** 電話番号 */
        tel_num: string,
        /** メールアドレス */
        mail_addr: string,
        /** 予約金額 */
        reserve_amount: number,
        /** 価格情報リスト */
        list_ticket: Array<{
            /** チケットコード */
            ticket_code: string,
            /** 標準単価 */
            std_price: number,
            /** 加算単価 */
            add_price: number,
            /** 割引額 */
            dis_price: number,
            /** 金額 */
            sale_price: number,
            /** 枚数 */
            ticket_count: number,
            /** 座席番号 */
            seat_num: string,
        }>
    }
    export interface Result {
        /** 座席チケット購入番号 */
        reserve_num: string,
        /** 入場QRリスト */
        list_qr: Array<{
            /** 座席セクション */
            seat_section: string,
            /** 座席番号 */
            seat_num: string,
            /** 座席入場QRコード */
            seat_qrcode: string,
        }>
    }
    export function call(args: Args, cb: (err: Error, result: Result) => void): void {
        console.log("updateReserve calling...", args);
        publishAccessToken((err) => {
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/upd_reserve/`,
                auth: {bearer: credentials.access_token},
                json: true,
                qs: {
                    // TODO クエリパラメータつくる
                },
                useQuerystring: true
            }, (error, response, body) => {
                console.log("updateReserve called.", error, body);
                if (error) return cb(error, null);
                if (typeof body === "string")  return cb(new Error(body), null);
                if (body.message) return cb(new Error(body.message), null);
                if (body.status !== 0) return cb(new Error(body.status), null);

                cb(null, {
                    reserve_num: body.reserve_num,
                    list_qr: body.list_qr,
                });
            });
        });
    }
}

/**
 * 購入チケット取り消し
 */
export namespace deleteReserveInterface {
    export interface Args {
        /** 施設コード */
        theater_code: string,
        /** 上映日 */
        date_jouei: string,
        /** 作品コード */
        title_code: string,
        /** 作品枝番 */
        title_branch_num: string,
        /** 上映時刻 */
        time_begin: string,
        /** 座席チケット購入番号 */
        reserve_num: string,
        /** 電話番号 */
        tel_num: string,
        /** 座席単位削除リスト */
        list_seat: Array<{
            /** 座席セクション */
            seat_section: string,
            /** 座席番号 */
            seat_num: string,
        }>				
    }
    export interface Result {
    }
    export function call(args: Args, cb: (err: Error, result: boolean) => void): void {
        console.log("deleteReserve calling...", args);
        publishAccessToken((err) => {
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/del_reserve/`,
                auth: {bearer: credentials.access_token},
                json: true,
                qs: {
                    // TODO クエリパラメータつくる
                },
                useQuerystring: true
            }, (error, response, body) => {
                console.log("deleteReserve called.", error, body);
                if (error) return cb(error, false);
                if (typeof body === "string")  return cb(new Error(body), false);
                if (body.message) return cb(new Error(body.message), false);
                if (body.status !== 0) return cb(new Error(body.status), false);

                cb(null, true);
            });
        });
    }
}

/**
 * 購入チケット内容抽出
 */
export namespace stateReserveInterface {
    export interface Args {
        /** 施設コード */
        theater_code: string,
        /** 座席チケット購入番号 */
        reserve_num	: string,
        /** 電話番号 */
        tel_num: string,
    }
    export interface Result {
        /** 上映日 */
        date_jouei: string,
        /** 作品コード */
        title_code: string,
        /** 作品枝番 */
        title_branch_num: string,
        /** 上映時刻 */
        time_begin: string,
        /** 予約座席リスト */
        list_reserve_seat: Array<{
            /** 座席番号 */
            seat_num: string,
        }>,
        /** 価格情報リスト */
        list_ticket: Array<{
            /** チケットコード */
            ticket_code: string,
            /** チケット名 */
            ticket_name: string,
            /** 金額 */
            ticket_price: number,
            /** 枚数 */
            ticket_count: number,
        }>
    }
    export function call(args: Args, cb: (err: Error, result: Result) => void): void {
        console.log("stateReserve calling...", args);
        publishAccessToken((err) => {
            request.get({
                url: `${COA_URI}/api/v1/theater/${args.theater_code}/state_reserve/`,
                auth: {bearer: credentials.access_token},
                json: true,
                qs: {
                    // TODO クエリパラメータつくる
                },
                useQuerystring: true
            }, (error, response, body) => {
                console.log("stateReserve called.", error, body);
                if (error) return cb(error, null);
                if (typeof body === "string")  return cb(new Error(body), null);
                if (body.message) return cb(new Error(body.message), null);
                if (body.status !== 0) return cb(new Error(body.status), null);

                cb(null, {
                    date_jouei: body.date_jouei,
                    title_code: body.title_code,
                    title_branch_num: body.title_branch_num,
                    time_begin: body.time_begin,
                    list_reserve_seat: body.list_reserve_seat,
                    list_ticket: body.list_ticket,
                });
            });
        });
    }
}
