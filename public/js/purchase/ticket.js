var modal;
$(function () {
    modal = new SASAKI.Modal();
    // 初期化
    pageInit();
    // 券種クリックイベント
    $(document).on('click', '.modal[data-modal=ticket_type] a', function (event) {
        event.preventDefault();
        
        var ticket = getSalseTicketData($(this));
        if (!ticket) return;
        var target = modal.getTrigger().parents('.seats li');
        if (target.hasClass('validation')) {
            target.removeClass('validation');
        }
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
            var ticket = getTicketData($(elem));
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
});

/**
 * 券種情報取得
 * @function getTicketData
 * @param {JQuery} target 取得元
 * @returns {any}
 */
function getTicketData(target) {
    return {
        section: target.attr('data-section'), // 座席セクション
        seat_code: target.attr('data-seat-code'), // 座席番号
        ticket_code: target.attr('data-ticket-code'), // チケットコード
        ticket_name: target.attr('data-ticket-name'), // チケット名
        sale_price: Number(target.attr('data-sale-price')), // 販売単価
        glasses: (target.attr('data-glasses') === 'true') ? true : false, // メガネ有り無し
        add_price_glasses: Number(target.attr('data-add-price-glasses')), // メガネ加算単価
        mvtk_num: (target.attr('data-mvtk-num')) ? target.attr('data-mvtk-num') : '' // ムビチケ購入番号
    };
}

/**
 * 販売券種情報取得
 * @function getSalseTicketData
 * @param {JQuery} target 取得元
 * @returns {any}
 */
function getSalseTicketData(target) {
    return {
        ticket_code: target.attr('data-ticket-code'), // チケットコード
        ticket_name: target.attr('data-ticket-name'), // チケット名
        sale_price: Number(target.attr('data-sale-price')), // 販売単価
        glasses: (target.attr('data-glasses') === 'true') ? true : false, // メガネ有り無し
        add_price_glasses: Number(target.attr('data-add-price-glasses')), // メガネ加算単価
        mvtk_num: (target.attr('data-mvtk-num')) ? target.attr('data-mvtk-num') : '' // ムビチケ購入番号
    };
}

/**
 * 初期化
 * @function pageInit
 * @returns {void}
 */
function pageInit() {
    if ($('.ticket-validation').val()) {
        modal.open('ticket_validation');
        var errorData = JSON.parse($('.ticket-validation').val());
        errorData.forEach(function(value){
            var ticketCode = $('.seats li').attr('data-ticket-code');
            $('.seats li[data-ticket-code='+ value +']').addClass('validation');
        });
    }
    $('.seats li').each(function (index, elem) {
        var target = $(elem);
        var afterData = getTicketData(target);
        mvtkToggle(null, afterData);
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
    var beforeData = getTicketData(target);
    var afterData = {
        section: beforeData.section, // 座席セクション
        seat_code: beforeData.seat_code, // 座席番号
        ticket_code: ticket.ticket_code, // チケットコード
        ticket_name: ticket.ticket_name, // チケット名
        sale_price: ticket.sale_price, // 販売単価
        add_price_glasses: ticket.add_price_glasses, // メガネ加算単価
        glasses: ticket.glasses, // メガネ有り無し
        mvtk_num: ticket.mvtk_num // ムビチケ購入番号
    };

    target.find('dd a').text(afterData.ticket_name + ' ￥' + afterData.sale_price);
    target.attr({
        'data-section': afterData.section, // 座席セクション
        'data-seat-code': afterData.seat_code, // 座席番号
        'data-ticket-code': afterData.ticket_code, // チケットコード
        'data-ticket-name': afterData.ticket_name, // チケット名
        'data-sale-price': afterData.sale_price, // 販売単価
        'data-add-price-glasses': ticket.add_price_glasses, // メガネ加算単価
        'data-glasses': afterData.glasses, // メガネ有り無し
        'data-mvtk-num': afterData.mvtk_num, // ムビチケ購入番号
    });

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
            var data = getSalseTicketData(target.find('.button a'));
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
            var data = getSalseTicketData(target.find('.button a'));
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
        if ($(elem).attr('data-sale-price')) {
            var salePrice = Number($(elem).attr('data-sale-price'));
            if (salePrice) price += salePrice;
        }
    });
    $('.total .price strong span').text(formatPrice(price));
}

