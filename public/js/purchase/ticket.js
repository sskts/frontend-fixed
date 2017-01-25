$(function () {
    totalPrice();
    var modal = new SASAKI.Modal();
    /**
         * 券種クリックイベント
         */
    $(document).on('click', '.modal[data-modal="ticket-type"] a', function (event) {
        event.preventDefault();
        var ticket = $(this).attr('data-ticket');
        if (!ticket) return;
        var triggerIndex = $('.modal[data-modal="ticket-type"]').attr('data-modal-trigger-index');
        var target = modal.getTrigger().parent().parent().parent();
        target.find('.button')
            .removeClass('button')
            .addClass('ghost-button');
        ticket = JSON.parse(ticket);
        var ticketBefore = JSON.parse(target.find('dt').attr('data-ticket'));
        var ticketAfter = {
            section: ticketBefore.section,
            seat_code: ticketBefore.seat_code,
            ticket_code: ticket.ticket_code,
            ticket_name_ja: ticket.ticket_name,
            ticket_name_en: ticket.ticket_name_eng,
            ticket_name_kana: ticket.ticket_name_kana,
            std_price: ticket.std_price,
            add_price: ticket.add_price,
            dis_price: 0,
            sale_price: ticket.sale_price,
        };
        
        target.find('dd a').text(ticketAfter.ticket_name_ja + ' ￥' + ticketAfter.sale_price);
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
            alert('未選択');
        } else {
            // location.hrefにpostする
            var form = $('form');
            var dom = $('<input type="hidden" name="reserve_tickets">').val(JSON.stringify(result));
            form.append(dom);
            form.submit();
        }
    });
})

/**
 * 合計金額計算
 */
function totalPrice() {
    var price = 0;
    $('.seats li').each(function (index, elem) {
        if ($(elem).find('dd').attr('data-ticket')) {
            var data = JSON.parse($(elem).find('dd').attr('data-ticket'));
            price += data.sale_price;
        }
    });
    $('.total .price strong span').text(formatPrice(price));
}

