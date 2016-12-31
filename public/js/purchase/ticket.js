$(function () {
    var modal = new SASAKI.Modal();
    /**
         * 券種クリックイベント
         */
    $(document).on('click', '.modal[data-modal="ticket-type"] a', function (event) {
        event.preventDefault();
        var ticketType = $(this).attr('data-ticket-type');
        var ticketName = $(this).parent().parent().parent().find('dt').text();
        var ticketPrice = $(this).attr('data-ticket-price');
        var triggerIndex = $('.modal[data-modal="ticket-type"]').attr('data-modal-trigger-index');
        var target = modal.getTrigger().parent().parent().parent();
        target.find('.button')
            .removeClass('button')
            .addClass('ghost-button')
        target.find('dd a').text(ticketName);
        target.find('dd').attr('data-seat-type', ticketType);
        modal.close();
    });

    /**
     * 次へクリックイベント
     */
    $(document).on('click', '.next-button button', function (event) {
        event.preventDefault();
        var result = [];
        var flag = true;
        $('.seats li').each(function (index, elm) {
            var code = $(elm).find('dt').text();
            var type = $(elm).find('dd').attr('data-seat-type');
            result.push({
                code: code,
                type: type
            });
            if (!code || !type) {
                flag = false;
            }
        });

        if (!flag) {
            alert('未選択');
        } else {
            // location.hrefにpostする
            var form = $('form');
            var dom = $('<input type="hidden" name="seat_codes">').val(JSON.stringify(result));
            form.append(dom);
            form.submit();
        }
    });
})