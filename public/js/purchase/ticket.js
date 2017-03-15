$(function () {
    // 初期化
    pageInit();
    var modal = new SASAKI.Modal();
    // 券種クリックイベント
    $(document).on('click', '.modal[data-modal=ticket_type] a', function (event) {
        event.preventDefault();
        var data = $(this).attr('data-ticket');
        if (!data) return;
        var target = modal.getTrigger().parents('.seats li dl');
        var ticket = JSON.parse(data);
        ticketSelect(target, ticket);
        modal.close();
        totalPrice();
    });

    // 次へクリックイベント
    $(document).on('click', '.next-button button', function (event) {
        event.preventDefault();
        var result = [];
        var flag = true;
        $('.seats li').each(function (index, elem) {
            var ticket = ($(elem).find('dt').attr('data-ticket')) ? JSON.parse($(elem).find('dt').attr('data-ticket')) : null;
            result.push(ticket);
            if (!ticket.ticket_code) {
                flag = false;
            }
        });

        if (!flag) {
            modal.open('ticket_not_select');
        } else {
            // location.hrefにpostする
            var form = $('form');
            var dom = $('<input type="hidden" name="reserve_tickets">').val(JSON.stringify(result));
            form.append(dom);
            loadingStart(function () {
                form.submit();
            });
        }
    });
})

/**
 * 初期化
 * @function pageInit
 * @returns {void}
 */
function pageInit() {
    $('.seats li').each(function (index, elem) {
        var target = $(elem);
        var beforeData = JSON.parse(target.find('dt').attr('data-ticket'));
        mvtkToggle(beforeData, null);
    });
    totalPrice();
}

/**
 * 券種選択
 * @function ticketSelect
 * @param {JQuery} target 適用先
 * @param {JSON} ticket 選択券種情報
 * @returns {void}
 */
function ticketSelect(target, ticket) {
    var triggerIndex = $('.modal[data-modal=ticket_type]').attr('data-modal-trigger-index');

    target.find('.button')
        .removeClass('button')
        .addClass('ghost-button');
    var beforeData = JSON.parse(target.find('dt').attr('data-ticket'));
    var afterData = {
        section: beforeData.section, // 座席セクション
        seat_code: beforeData.seat_code, // 座席番号
        ticket_code: ticket.ticket_code, // チケットコード
        ticket_name: ticket.ticket_name, // チケット名
        ticket_name_eng: ticket.ticket_name_eng, // チケット名（英）
        ticket_name_kana: ticket.ticket_name_kana, // チケット名（カナ）
        std_price: ticket.std_price, // 標準単価
        add_price: ticket.add_price, // 加算単価
        dis_price: 0, // 割引額
        sale_price: ticket.sale_price, // 販売単価
        add_price_glasses: ticket.add_price_glasses, // メガネ単価
        glasses: ticket.glasses, // メガネ有り無し
        mvtk_num: ticket.mvtk_num // ムビチケ購入番号
    };

    target.find('dd a').text(afterData.ticket_name + ' ￥' + afterData.sale_price);
    target.find('dt').attr('data-ticket', JSON.stringify(afterData));

    mvtkToggle(beforeData, afterData);
}

/**
 * ムビチケ表示非表示
 * @function mvtkToggle
 * @param {object} beforeData 選択前データ
 * @param {object} afterData 選択後データ
 * @returns {void}
 */
function mvtkToggle(beforeData, afterData) {
    var modalDom = $('.modal[data-modal=ticket_type]');
    if (beforeData && beforeData.mvtk_num) {
        var limit = (beforeData.add_price_glasses > 0) ? 2 : 1;
        var count = 0;
        modalDom.find('li').each(function (index, elem) {
            var target = $(elem);
            var data = JSON.parse(target.find('.button a').attr('data-ticket'));
            if (data.mvtk_num === beforeData.mvtk_num
                && data.ticket_code === beforeData.ticket_code
                && target.is(':hidden')) {
                if (count < limit) {
                    target.show();
                    count++;
                }
            }
        });
    }
    if (afterData && afterData.mvtk_num) {
        var limit = (afterData.add_price_glasses > 0) ? 2 : 1;
        var count = 0;
        modalDom.find('li').each(function (index, elem) {
            var target = $(elem);
            var data = JSON.parse(target.find('.button a').attr('data-ticket'));
            if (data.mvtk_num === afterData.mvtk_num
                && data.ticket_code === afterData.ticket_code
                && target.is(':visible')) {
                if (count < limit) {
                    target.hide();
                    count++;
                }
            }
        });
    }
}

/**
 * 合計金額計算
 * @function totalPrice
 * @returns {void}
 */
function totalPrice() {
    var price = 0;
    $('.seats li').each(function (index, elem) {
        if ($(elem).find('dt').attr('data-ticket')) {
            var data = JSON.parse($(elem).find('dt').attr('data-ticket'));
            price += data.sale_price;
        }
    });
    $('.total .price strong span').text(formatPrice(price));
}

