"use strict";
/**
 * 正常データ
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 取引
 */
exports.transaction = {
    id: '58db6601a61ecf0a7c4fddb0'
};
/**
 * パフォーマンス
 */
exports.performance = {
    type: 'performances',
    id: '11820170329162210101000',
    attributes: {
        _id: '11820170329162210101000',
        updated_at: '2017-03-29T07:00:56.620Z',
        theater: { _id: '118', name: { en: 'CinemasunshineTest118', ja: 'シネマサンシャイン１１８' }, id: '118' },
        screen: { _id: '11810', name: { en: 'CINEMA1', ja: 'シアター１' }, id: '11810' },
        film: {
            _id: '118162210',
            name_kana: 'ペット（フキカエバン）',
            name_short: 'ペット【吹替版】',
            name_original: 'ペット【吹替版】',
            minutes: 91,
            name: { en: 'The Secret Life of Pets', ja: 'ペット【吹替版】' },
            id: '118162210'
        },
        day: '20170329',
        time_start: '1000',
        time_end: '1136',
        canceled: false,
        coa_trailer_time: 5,
        coa_kbn_service: '000',
        coa_kbn_acoustic: '000',
        coa_name_service_day: 'ﾚﾃﾞｨｰｽﾃﾞｲ',
        coa_available_num: 4,
        coa_rsv_start_date: '20170327',
        __v: 0,
        created_at: '2017-03-24T05:00:56.848Z',
        id: '11820170329162210101000'
    }
};
/**
 * 劇場
 */
exports.theater = {
    type: 'theaters',
    id: '118',
    attributes: {
        _id: '118',
        updated_at: '2017-03-29T07:01:02.106Z',
        name_kana: 'シネマサンシャイン１１８',
        gmo: {
            site_id: 'tsite00022126',
            shop_id: 'tshop00026096',
            shop_pass: 'xbxmkaa6'
        },
        websites: {
            group: 'PORTAL',
            name: {
                en: 'portal site',
                ja: 'ポータルサイト'
            },
            // tslint:disable-next-line:no-http-string
            url: 'http://www.cinemasunshine.co.jp/theater/aira/'
        },
        __v: 0,
        created_at: '2017-03-10T08:49:55.603Z',
        address: { en: '', ja: '' },
        name: { en: 'CinemasunshineTest118', ja: 'シネマサンシャイン１１８' },
        id: '118'
    }
};
/**
 * コア情報
 */
exports.performanceCOA = {
    theaterCode: '118',
    screenCode: '10',
    titleCode: '16221',
    titleBranchNum: '0'
};
/**
 * 予約座席情報
 */
exports.reserveSeats = {
    tmp_reserve_num: 738,
    list_tmp_reserve: [
        { seat_num: 'Ｍ－１', seat_section: '   ', sts_tmp_reserve: 'OK' },
        { sts_tmp_reserve: 'OK', seat_section: '   ', seat_num: 'Ｍ－２' }
    ]
};
/**
 * 予約券種情報
 */
exports.reserveTickets = [{
        section: '   ',
        seat_code: 'Ｍ－１',
        ticket_code: '10',
        ticket_name: '当日一般',
        ticket_name_eng: 'General Price',
        ticket_name_kana: 'トウジツイッパン',
        std_price: 1800,
        add_price: 0,
        dis_price: 0,
        sale_price: 1800,
        add_price_glasses: 0,
        glasses: false,
        mvtk_num: ''
    },
    {
        section: '   ',
        seat_code: 'Ｍ－２',
        ticket_code: '40',
        ticket_name: '大学生',
        ticket_name_eng: '',
        ticket_name_kana: '',
        std_price: 1500,
        add_price: 0,
        dis_price: 0,
        sale_price: 1500,
        add_price_glasses: 0,
        glasses: false,
        mvtk_num: ''
    }];
/**
 * 入力情報
 */
exports.input = {
    last_name_hira: 'はたぐち',
    first_name_hira: 'あきと',
    mail_addr: 'hataguchi@motionpicture.jp',
    mail_confirm: 'hataguchi@motionpicture.jp',
    tel_num: '09040007648'
};
