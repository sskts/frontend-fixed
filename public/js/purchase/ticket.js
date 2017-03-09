$(function () {
    totalPrice();
    var modal = new SASAKI.Modal();
    /**
         * 券種クリックイベント
         */
    $(document).on('click', '.modal[data-modal=ticket_type] a', function (event) {
        event.preventDefault();
        var ticket = $(this).attr('data-ticket');
        if (!ticket) return;
        var triggerIndex = $('.modal[data-modal=ticket_type]').attr('data-modal-trigger-index');
        var target = modal.getTrigger().parent().parent().parent();
        target.find('.button')
            .removeClass('button')
            .addClass('ghost-button');
        ticket = JSON.parse(ticket);
        var ticketBefore = JSON.parse(target.find('dt').attr('data-ticket'));
        var ticketAfter = {
            section: ticketBefore.section, // 座席セクション
            seat_code: ticketBefore.seat_code, // 座席番号
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

        target.find('dd a').text(ticketAfter.ticket_name + ' ￥' + ticketAfter.sale_price);
        target.find('dt').attr('data-ticket', JSON.stringify(ticketAfter));
        modal.close();
        totalPrice();
    });

    /**
     * 次へクリックイベント
     */
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

