import request = require('request-promise-native');
import config = require('config');
import COA = require('@motionpicture/coa-service');
import GMO = require("@motionpicture/gmo-service");

const endPoint = config.get<string>('mp_api_endpoint');

/**
 * theater
 */
export interface theater {
    __v: string,
    _id: string,
    address: {
        en: string,
        ja: string
    },
    created_at: string,
    name: {
        en: string,
        ja: string
    },
    name_kana: string,
    updated_at: string
}

/**
 * screen
 */
export interface screen {
    __v: string,
    _id: string,
    coa_screen_code: string,
    created_at: string,
    name: {
        en: string,
        ja: string
    },
    seats_numbers_by_seat_grade: any[],
    sections: Array<{
        code: string,
        name: {
            en: string,
            ja: string
        },
        seats: Array<{
            code: string
        }>
    }>,
    theater: string,
    updated_at: string
}

/**
 * film
 */
export interface film {
    __v: string,
    _id: string,
    coa_title_branch_num: string,
    coa_title_code: string,
    created_at: string,
    date_end: string,
    date_start: string,
    film_branch_code: string,
    film_group: string,
    kbn_eirin: string,
    kbn_eizou: string,
    kbn_jimakufukikae: string,
    kbn_joueihousiki: string,
    minutes: string,
    name: {
        en: string,
        ja: string,
    },
    name_kana: string,
    name_original: string,
    name_short: string,
    theater: string,
    updated_at: string
}

/**
 * performance
 */
export interface performance {
    _id: string,
    attributes: {
        canceled: boolean,
        day: string,
        film: film,
        screen: screen,
        theater: theater,
        time_end: string,
        time_start: string
    },
    type: string

}

/**
 * パフォーマンス取得
 */
export namespace getPerformance {
    export interface Args {
        id: string
    }
    export interface Result {
        data: performance,
    }
    export async function call(args: Args): Promise<Result> {
        let response = await request.get({
            url: `${endPoint}/performances/${args.id}`,
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
        });
        if (response.statusCode !== 200) throw new Error(response.body.message);
        console.log('performances:', response.body);
        return response.body;
    }
}

/**
 * 運営者取得
 */
export namespace getAdministrator {
    export interface Args {
    }
    export interface Result {
        type: string,
        _id: string
    }
    export async function call(): Promise<Result> {
        let response = await request.get({
            url: `${endPoint}/owners/administrator`,
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
        });
        if (response.statusCode !== 200) throw new Error(response.body.message);
        let administrator = response.body.data;
        console.log('administrator:', administrator);

        return administrator;
    }
}

/**
 * 一般所有者作成
 */
export namespace ownerAnonymousCreate {
    export interface Args {
    }
    export interface Result {
        type: string,
        _id: string
    }
    export async function call(): Promise<Result> {
        let response = await request.post({
            url: `${endPoint}/owners/anonymous`,
            body: {},
            json: true,
            simple: false,
            resolveWithFullResponse: true,
        });
        if (response.statusCode !== 201) throw new Error(response.body.message);
        let owner = response.body.data;
        console.log('owner:', owner);

        return owner;
    }
}

/**
 * 取引開始
 */
export namespace transactionStart {
    export interface Args {
        expired_at: number,
        owners: string[]
    }
    export interface Result {
        type: string,
        _id: string
    }

    export async function call(args: Args): Promise<Result> {
        let response = await request.post({
            url: `${endPoint}/transactions`,
            body: {
                expired_at: args.expired_at,
                owners: args.owners
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
        });
        if (response.statusCode !== 201) throw new Error(response.body.message);
        let transaction = response.body.data;
        console.log('transaction:', transaction);

        return transaction;
    }
}

/**
 * COAオーソリ追加
 */
export namespace addCOAAuthorization {
    export interface Args {
        transaction: transactionStart.Result,
        administratorOwnerId: string,
        anonymousOwnerId: string,
        reserveSeatsTemporarilyResult: COA.reserveSeatsTemporarilyInterface.Result,
        salesTicketResults: Array<{
            section: string,
            seat_code: string,
            ticket_code: string,
            ticket_name_ja: string,
            ticket_name_en: string,
            ticket_name_kana: string,
            std_price: number,
            add_price: number,
            dis_price: number,
            sale_price: number
        }>,
        performance: performance,
        totalPrice: number,

    }
    export interface Result {
        type: string,
        _id: string
    }
    export async function call(args: Args): Promise<Result> {
        let response = await request.post({
            url: `${endPoint}/transactions/${args.transaction._id}/authorizations/coaSeatReservation`,
            body: {
                owner_id_from: args.administratorOwnerId,
                owner_id_to: args.anonymousOwnerId,
                coa_tmp_reserve_num: args.reserveSeatsTemporarilyResult.tmp_reserve_num,
                seats: args.salesTicketResults.map((tmpReserve: any) => {
                    return {
                        performance: args.performance._id,
                        section: tmpReserve.section,
                        seat_code: tmpReserve.seat_code,
                        ticket_code: tmpReserve.ticket_code,
                        ticket_name_ja: tmpReserve.ticket_name_ja,
                        ticket_name_en: tmpReserve.ticket_name_en,
                        ticket_name_kana: tmpReserve.ticket_name_kana,
                        std_price: tmpReserve.std_price,
                        add_price: tmpReserve.add_price,
                        dis_price: tmpReserve.dis_price,
                        sale_price: tmpReserve.sale_price,
                    }
                }),
                price: args.totalPrice,
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
        });
        if (response.statusCode !== 200) throw new Error(response.body.message);

        console.log('addCOAAuthorization result');
        return response.body.data;
    }
}

/**
 * COAオーソリ削除
 */
export namespace removeCOAAuthorization {
    export interface Args {
        transaction: transactionStart.Result,
        ownerId4administrator: string,
        reserveSeatsTemporarilyResult: COA.reserveSeatsTemporarilyInterface.Result,
        addCOAAuthorizationResult: addCOAAuthorization.Result
    }
    export interface Result {
    }
    export async function call(args: Args): Promise<void> {
        let response = await request.del({
            url: `${endPoint}/transactions/${args.transaction._id}/authorizations/${args.addCOAAuthorizationResult._id}`,
            body: {
                coa_tmp_reserve_num: args.reserveSeatsTemporarilyResult.tmp_reserve_num.toString()
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
        });
        if (response.statusCode !== 204) throw new Error(response.body.message);

        console.log('addCOAAuthorization result');
    }
}


/**
 * GMOオーソリ追加
 */
export namespace addGMOAuthorization {
    export interface Args {
        transaction: transactionStart.Result,
        anonymousOwnerId: string,
        administratorOwnerId: string,
        orderId: string,
        amount: number,
        entryTranResult: GMO.CreditService.entryTranInterface.Result
    }
    export interface Result {
        type: string,
        _id: string
    }
    export async function call(args: Args): Promise<Result> {
        let response = await request.post({
            url: `${endPoint}/transactions/${args.transaction._id}/authorizations/gmo`,
            body: {
                owner_id_from: args.anonymousOwnerId,
                owner_id_to: args.administratorOwnerId,
                gmo_shop_id: config.get<string>('gmo_shop_id'),
                gmo_shop_password: config.get<string>('gmo_shop_password'),
                gmo_order_id: args.orderId,
                gmo_amount: args.amount,
                gmo_access_id: args.entryTranResult.access_id,
                gmo_access_password: args.entryTranResult.access_pass,
                gmo_job_cd: GMO.Util.JOB_CD_SALES,
                gmo_pay_type: GMO.Util.PAY_TYPE_CREDIT,
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
        });
        if (response.statusCode !== 200) throw new Error(response.body.message);

        console.log("addGMOAuthorization result:");
        return response.body.data;
    }
}

/**
 * GMOオーソリ削除
 */
export namespace removeGMOAuthorization {
    export interface Args {
        transaction: transactionStart.Result,
        addGMOAuthorizationResult: addGMOAuthorization.Result,
    }
    export interface Result {
    }
    export async function call(args: Args): Promise<void> {
        let response = await request.del({
            url: `${endPoint}/transactions/${args.transaction._id}/authorizations/${args.addGMOAuthorizationResult._id}`,
            body: {
                
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
        });
        if (response.statusCode !== 204) throw new Error(response.body.message);

        console.log("removeGMOAuthorization result:");

    }
}


/**
 * 購入者情報登録
 */
export namespace ownersAnonymous {
    export interface Args {
        owner: ownerAnonymousCreate.Result,
        name_first: string,
        name_last: string,
        tel: string,
        email: string,
    }
    export interface Result {
    }
    export async function call(args: Args): Promise<void> {
        let response = await request.patch({
            url: `${endPoint}/owners/anonymous/${args.owner._id}`,
            body: {
                name_first: args.name_first,
                name_last: args.name_last,
                tel: args.tel,
                email: args.email,
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
        });
        if (response.statusCode !== 204) throw new Error(response.body.message);

        console.log("removeGMOAuthorization result:");

    }
}

// 照会情報登録(購入番号と電話番号で照会する場合)
export namespace transactionsEnableInquiry {
    export interface Args {
        transaction: transactionStart.Result,
        updateReserveResult: COA.updateReserveInterface.Result,
        inquiry_pass: string,
    }
    export interface Result {
    }
    export async function call(args: Args): Promise<void> {
        let response = await request.patch({
            url: `${endPoint}/transactions/${args.transaction._id}/enableInquiry`,
            body: {
                inquiry_id: args.updateReserveResult.reserve_num,
                inquiry_pass: args.inquiry_pass
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
        });
        if (response.statusCode !== 204) throw new Error(response.body.message);

        console.log("transactionsEnableInquiry result:");

    }
}


/**
 * 取引成立
 */
export namespace transactionClose {
    export interface Args {
        transaction: transactionStart.Result
    }
    export interface Result {
    }
    export async function call(args: Args): Promise<void> {
        let response = await request.patch({
            url: `${endPoint}/transactions/${args.transaction._id}/close`,
            body: {
                
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
        });
        if (response.statusCode !== 204) throw new Error(response.body.message);
        console.log('close result:');
    }
}