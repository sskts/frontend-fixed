$(function () {
    // 初期化
    pageInit();
    // 券種クリックイベント
    $(document).on('click', '.modal[data-modal=ticketType] .button a', function (event) {
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
            if (!ticket.ticketCode) {
                flag = false;
            }
        });

        if (!flag) {
            modal.open('ticketNotSelect');
        } else {
            // location.hrefにpostする
            var form = $('form');
            var dom = $('<input type="hidden" name="reserveTickets">').val(JSON.stringify(result));
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
        seatCode: target.attr('data-seat-code'), // 座席番号
        ticketCode: target.attr('data-ticket-code'), // チケットコード
        ticketName: target.attr('data-ticket-name'), // チケット名
        salePrice: Number(target.attr('data-sale-price')), // 販売単価
        glasses: (target.attr('data-glasses') === 'true') ? true : false, // メガネ有り無し
        addPriceGlasses: Number(target.attr('data-add-price-glasses')), // メガネ加算単価
        mvtkNum: (target.attr('data-mvtk-num')) ? target.attr('data-mvtk-num') : '' // ムビチケ購入番号
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
        ticketCode: target.attr('data-ticket-code'), // チケットコード
        ticketName: target.attr('data-ticket-name'), // チケット名
        salePrice: Number(target.attr('data-sale-price')), // 販売単価
        glasses: (target.attr('data-glasses') === 'true') ? true : false, // メガネ有り無し
        addPriceGlasses: Number(target.attr('data-add-price-glasses')), // メガネ加算単価
        mvtkNum: (target.attr('data-mvtk-num')) ? target.attr('data-mvtk-num') : '' // ムビチケ購入番号
    };
}

/**
 * 初期化
 * @function pageInit
 * @returns {void}
 */
function pageInit() {
    if ($('.ticket-validation').val()) {
        modal.open('ticketValidation');
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
    var triggerIndex = $('.modal[data-modal=ticketType]').attr('data-modal-trigger-index');

    target.find('.button')
        .removeClass('button')
        .addClass('ghost-button');
    var beforeData = getTicketData(target);
    var afterData = {
        section: beforeData.section, // 座席セクション
        seatCode: beforeData.seatCode, // 座席番号
        ticketCode: ticket.ticketCode, // チケットコード
        ticketName: ticket.ticketName, // チケット名
        salePrice: ticket.salePrice, // 販売単価
        addPriceGlasses: ticket.addPriceGlasses, // メガネ加算単価
        glasses: ticket.glasses, // メガネ有り無し
        mvtkNum: ticket.mvtkNum // ムビチケ購入番号
    };
    target.find('dd a').text(afterData.ticketName + ' ￥' + afterData.salePrice);
    if (isFixed()) {
        // 券売機
        target.find('dd a').html('<div class="small-text mb-x-small">' + afterData.ticketName + '</div><div><strong>￥' + afterData.salePrice + '</strong></div>');
    }
    target.attr({
        'data-section': afterData.section, // 座席セクション
        'data-seat-code': afterData.seatCode, // 座席番号
        'data-ticket-code': afterData.ticketCode, // チケットコード
        'data-ticket-name': afterData.ticketName, // チケット名
        'data-sale-price': afterData.salePrice, // 販売単価
        'data-add-price-glasses': ticket.addPriceGlasses, // メガネ加算単価
        'data-glasses': afterData.glasses, // メガネ有り無し
        'data-mvtk-num': afterData.mvtkNum, // ムビチケ購入番号
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
    var modalDom = $('.modal[data-modal=ticketType]');
    if (beforeData && beforeData.mvtkNum) {
        var limit = (beforeData.addPriceGlasses > 0) ? 2 : 1;
        var count = 0;
        modalDom.find('li').each(function (index, elem) {
            var target = $(elem);
            var data = getSalseTicketData(target.find('.button a'));
            if (data.mvtkNum === beforeData.mvtkNum
                && data.ticketCode === beforeData.ticketCode
                && target.is(':hidden')) {
                if (count < limit) {
                    target.show();
                    count++;
                }
            }
        });
    }
    if (afterData && afterData.mvtkNum) {
        var limit = (afterData.addPriceGlasses > 0) ? 2 : 1;
        var count = 0;
        modalDom.find('li').each(function (index, elem) {
            var target = $(elem);
            var data = getSalseTicketData(target.find('.button a'));
            if (data.mvtkNum === afterData.mvtkNum
                && data.ticketCode === afterData.ticketCode
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

