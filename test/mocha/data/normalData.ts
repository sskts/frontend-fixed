/**
 * 正常データ
 */

/**
 * 取引
 */
export const transaction = {
    id: '58db6601a61ecf0a7c4fddb0'
};

/**
 * パフォーマンス
 */
export const performance = {
    type: 'performances',
    id: '11820170329162210101000',
    attributes:
    {
        Id: '11820170329162210101000',
        updatedAt: '2017-03-29t07:00:56.620z',
        theater: { Id: '118', name: { en: 'cinemasunshineTest118', ja: 'シネマサンシャイン１１８' }, id: '118' },
        screen: { Id: '11810', name: { en: 'cinema1', ja: 'シアター１' }, id: '11810' },
        film:
        {
            Id: '118162210',
            nameKana: 'ペット（フキカエバン）',
            nameShort: 'ペット【吹替版】',
            nameOriginal: 'ペット【吹替版】',
            minutes: 91,
            name: { en: 'the secret life of pets', ja: 'ペット【吹替版】' },
            id: '118162210'
        },
        day: '20170329',
        timeStart: '1000',
        timeEnd: '1136',
        canceled: false,
        coaTrailerTime: 5,
        coaKbnService: '000',
        coaKbnAcoustic: '000',
        coaNameServiceDay: 'ﾚﾃﾞｨｰｽﾃﾞｲ',
        coaAvailableNum: 4,
        coaRsvStartDate: '20170327',
        V: 0,
        createdAt: '2017-03-24t05:00:56.848z',
        id: '11820170329162210101000'
    }
};

/**
 * 劇場
 */
export const theater = {
    type: 'theaters',
    id: '118',
    attributes:
    {
        Id: '118',
        updatedAt: '2017-03-29t07:01:02.106z',
        nameKana: 'シネマサンシャイン１１８',
        gmo: {
            siteId: 'tsite00022126',
            shopId: 'tshop00026096',
            shopPass: 'xbxmkaa6'
        },
        websites: {
            group: 'portal',
            name: {
                en: 'portal site',
                ja: 'ポータルサイト'
            },
            // tslint:disable-next-line:no-http-string
            url: 'http://www.cinemasunshine.co.jp/theater/aira/'
        },
        V: 0,
        createdAt: '2017-03-10t08:49:55.603z',
        address: { en: '', ja: '' },
        name: { en: 'cinemasunshineTest118', ja: 'シネマサンシャイン１１８' },
        id: '118'
    }
};

/**
 * コア情報
 */
export const performanceCOA = {
    theaterCode: '118',
    screenCode: '10',
    titleCode: '16221',
    titleBranchNum: '0'
};

/**
 * 予約座席情報
 */
export const reserveSeats = {
    tmpReserveNum: 738,
    listTmpReserve: [
        { seatNum: 'Ｍ－１', seatSection: '   ', stsTmpReserve: 'OK' },
        { stsTmpReserve: 'OK', seatSection: '   ', seatNum: 'Ｍ－２' }
    ]
};

/**
 * 予約券種情報
 */
export const reserveTickets = [{
    section: '   ',
    seatCode: 'Ｍ－１',
    ticketCode: '10',
    ticketName: '当日一般',
    ticketNameEng: 'general price',
    ticketNameKana: 'トウジツイッパン',
    stdPrice: 1800,
    addPrice: 0,
    disPrice: 0,
    salePrice: 1800,
    addPriceGlasses: 0,
    glasses: false,
    mvtkNum: ''
},
{
    section: '   ',
    seatCode: 'Ｍ－２',
    ticketCode: '40',
    ticketName: '大学生',
    ticketNameEng: '',
    ticketNameKana: '',
    stdPrice: 1500,
    addPrice: 0,
    disPrice: 0,
    salePrice: 1500,
    addPriceGlasses: 0,
    glasses: false,
    mvtkNum: ''
}];

/**
 * 入力情報
 */
export const input = {
    lastNameHira: 'はたぐち',
    firstNameHira: 'あきと',
    mailAddr: 'hataguchi@motionpicture.jp',
    mailConfirm: 'hataguchi@motionpicture.jp',
    telNum: '09040007648'
};
