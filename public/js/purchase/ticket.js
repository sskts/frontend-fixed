$(function () {
    totalPrice();
    var modal = new SASAKI.Modal();
    /**
         * 券種クリックイベント
         */
    $(document).on('click', '.modal[data-modal="ticket-type"] a', function (event) {
        event.preventDefault();
        var ticket = $(this).attr('data-ticket');
        var triggerIndex = $('.modal[data-modal="ticket-type"]').attr('data-modal-trigger-index');
        var target = modal.getTrigger().parent().parent().parent();
        target.find('.button')
            .removeClass('button')
            .addClass('ghost-button');
        target.find('dd').attr('data-ticket', ticket)
        target.find('dd a').text(JSON.parse(ticket).ticket_name);
        modal.close();
        totalPrice();
    });

    /**
     * 次へクリックイベント
     */
    $(document).on('click', '.next-button button', function (event) {
        event.preventDefault();
        var result = {};
        var flag = true;
        $('.seats li').each(function (index, elem) {
            var code = $(elem).find('dt').text();
            var ticket = ($(elem).find('dd').attr('data-ticket')) ? JSON.parse($(elem).find('dd').attr('data-ticket')) : null;
            result[code] = ticket;
            if (!code || !ticket) {
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

