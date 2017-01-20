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
 * performance取得
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
 * 一般所有者作成
 */
export namespace ownerAnonymousCreate {
    export interface Args {
    }
    export interface Result {
        _id: string,
        group: string,
        name_first: string,
        name_last: string,
        email: string,
        tel: string,
        $setOnInsert: { __v: string }
    }
    export async function call(): Promise<Result> {
        let response = await request.post({
            url: `${endPoint}/config/owner/anonymous/create`,
            body: {
                group: 'ANONYMOUS',
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
        });
        if (response.statusCode !== 200) throw new Error(response.body.message);
        let owner = response.body;
        console.log('owner:', owner);

        return owner;
    }
}

/**
 * 取引開始
 */
export namespace transactionStart {
    export interface Args {
        owners: string[]
    }
    export interface Result {
        _id: string,
        password: string,
        status: string,
        events: Array<{
            _id: string,
            group: string,
            authorization: any
        }>,
        owners: Array<{
            _id: string,
            group: string
        }>,
        expired_at: string,
        access_id: string,
        access_pass: string,
    }
    export async function call(args: Args): Promise<Result> {
        let response = await request.post({
            url: `${endPoint}/transaction/start`,
            body: {
                owners: args.owners
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
        });
        if (response.statusCode !== 200) throw new Error(response.body.message);
        let transaction = response.body;
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
        ownerId4administrator: string,
        reserveSeatsTemporarilyResult: COA.reserveSeatsTemporarilyInterface.Result,
        performance: performance
    }
    export interface Result {
    }
    export async function call(args: Args): Promise<void> {
        let response = await request.post({
            url: `${endPoint}/transaction/${args.transaction._id}/addCOAAuthorization`,
            body: {
                transaction_password: args.transaction.password,
                owner_id: args.ownerId4administrator,
                coa_tmp_reserve_num: args.reserveSeatsTemporarilyResult.tmp_reserve_num,
                seats: args.reserveSeatsTemporarilyResult.list_tmp_reserve.map((tmpReserve: any) => {
                    return {
                        performance: args.performance._id,
                        section: tmpReserve.seat_section,
                        seat_code: tmpReserve.seat_num,
                        ticket_code: '',
                    }
                })
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
        owner: ownerAnonymousCreate.Result,
        orderId: string,
        amount: number,
        entryTranResult: GMO.CreditService.entryTranInterface.Result
    }
    export interface Result {
    }
    export async function call(args: Args): Promise<void> {
        let response = await request.post({
            url: `${endPoint}/transaction/${args.transaction._id}/addCOAAuthorization`,
            body: {
                transaction_password: args.transaction.password,
                owner_id: args.owner._id,
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
        if (response.statusCode !== 204) throw new Error(response.body.message);

        console.log("addGMOAuthorization result:");
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
        let response = await request.post({
            url: `${endPoint}/transaction/${args.transaction._id}/close`,
            body: {
                password: args.transaction.password
            },
            json: true,
            simple: false,
            resolveWithFullResponse: true,
        });
        if (response.statusCode !== 204) throw new Error(response.body.message);
        console.log('close result:');
    }
}