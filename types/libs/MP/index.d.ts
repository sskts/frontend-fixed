import COA = require('@motionpicture/coa-service');
import GMO = require("@motionpicture/gmo-service");
/**
 * theater
 */
export interface Theater {
    __v: string;
    _id: string;
    address: {
        en: string;
        ja: string;
    };
    created_at: string;
    name: {
        en: string;
        ja: string;
    };
    name_kana: string;
    updated_at: string;
}
/**
 * screen
 */
export interface Screen {
    __v: string;
    _id: string;
    coa_screen_code: string;
    created_at: string;
    name: {
        en: string;
        ja: string;
    };
    seats_numbers_by_seat_grade: any[];
    sections: Array<{
        code: string;
        name: {
            en: string;
            ja: string;
        };
        seats: Array<{
            code: string;
        }>;
    }>;
    theater: string;
    updated_at: string;
}
/**
 * film
 */
export interface Film {
    __v: string;
    _id: string;
    coa_title_branch_num: string;
    coa_title_code: string;
    created_at: string;
    date_end: string;
    date_start: string;
    film_branch_code: string;
    film_group: string;
    kbn_eirin: string;
    kbn_eizou: string;
    kbn_jimakufukikae: string;
    kbn_joueihousiki: string;
    minutes: string;
    name: {
        en: string;
        ja: string;
    };
    name_kana: string;
    name_original: string;
    name_short: string;
    theater: string;
    updated_at: string;
}
/**
 * performance
 */
export interface Performance {
    _id: string;
    attributes: {
        canceled: boolean;
        day: string;
        film: Film;
        screen: Screen;
        theater: Theater;
        time_end: string;
        time_start: string;
    };
    type: string;
}
/**
 * パフォーマンス取得
 */
export declare namespace getPerformance {
    interface Args {
        id: string;
    }
    interface Result {
    }
    function call(args: Args): Promise<Performance>;
}
/**
 * 取引開始
 */
export declare namespace transactionStart {
    interface Args {
        expired_at: number;
    }
    interface Result {
        type: string;
        _id: string;
        attributes: {
            _id: string;
            status: string;
            events: any[];
            owners: Array<{
                _id: string;
                group: string;
            }>;
            queues: any[];
            expired_at: string;
            inquiry_id: string;
            inquiry_pass: string;
            queues_status: string;
        };
    }
    function call(args: Args): Promise<Result>;
}
/**
 * COAオーソリ追加
 */
export declare namespace addCOAAuthorization {
    interface Args {
        transaction: transactionStart.Result;
        reserveSeatsTemporarilyResult: COA.reserveSeatsTemporarilyInterface.Result;
        salesTicketResults: Array<{
            section: string;
            seat_code: string;
            ticket_code: string;
            ticket_name_ja: string;
            ticket_name_en: string;
            ticket_name_kana: string;
            std_price: number;
            add_price: number;
            dis_price: number;
            sale_price: number;
        }>;
        performance: Performance;
        totalPrice: number;
    }
    interface Result {
        type: string;
        _id: string;
    }
    function call(args: Args): Promise<Result>;
}
/**
 * COAオーソリ削除
 */
export declare namespace removeCOAAuthorization {
    interface Args {
        transactionId: string;
        coaAuthorizationId: string;
    }
    interface Result {
    }
    function call(args: Args): Promise<void>;
}
/**
 * GMOオーソリ追加
 */
export declare namespace addGMOAuthorization {
    interface Args {
        transaction: transactionStart.Result;
        orderId: string;
        amount: number;
        entryTranResult: GMO.CreditService.entryTranInterface.Result;
    }
    interface Result {
        type: string;
        _id: string;
    }
    function call(args: Args): Promise<Result>;
}
/**
 * GMOオーソリ削除
 */
export declare namespace removeGMOAuthorization {
    interface Args {
        transactionId: string;
        gmoAuthorizationId: string;
    }
    interface Result {
    }
    function call(args: Args): Promise<void>;
}
/**
 * 購入者情報登録
 */
export declare namespace ownersAnonymous {
    interface Args {
        transactionId: string;
        name_first: string;
        name_last: string;
        tel: string;
        email: string;
    }
    interface Result {
    }
    function call(args: Args): Promise<void>;
}
export declare namespace transactionsEnableInquiry {
    interface Args {
        transactionId: string;
        inquiry_theater: string;
        inquiry_id: number;
        inquiry_pass: string;
    }
    interface Result {
    }
    function call(args: Args): Promise<void>;
}
/**
 * 取引成立
 */
export declare namespace transactionClose {
    interface Args {
        transactionId: string;
    }
    interface Result {
    }
    function call(args: Args): Promise<void>;
}
/**
 * メール追加
 */
export declare namespace addEmail {
    interface Args {
        transactionId: string;
        from: string;
        to: string;
        subject: string;
        content: string;
    }
    interface Result {
        _id: string;
    }
    function call(args: Args): Promise<Result>;
}
/**
 * メール削除
 */
export declare namespace removeEmail {
    interface Args {
        transactionId: string;
        emailId: string;
    }
    interface Result {
        _id: string;
    }
    function call(args: Args): Promise<void>;
}
/**
 * 照会取引情報取得
 */
export declare namespace makeInquiry {
    interface Args {
        inquiry_theater: string;
        inquiry_id: number;
        inquiry_pass: string;
    }
    interface Result {
        _id: string;
    }
    function call(args: Args): Promise<string>;
}
