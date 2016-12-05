$(function () {
    new Modal();

    var url = location.pathname;
    if (url === '/purchase/seatSelect') {
        var screenSeatStatusesMap = new ScreenSeatStatusesMap($('.screen'));
        /**
         * 座席クリックイベント
         */
        $(document).on('click', '.screen .seat a', function () {
            // スマホで拡大操作
            if (screenSeatStatusesMap.isDeviceType('sp') && screenSeatStatusesMap.state === ScreenSeatStatusesMap.STATE_DEFAULT) {
                return;
            }
            var limit = Number($('.screen-limit').attr('data-limit'));
            // 座席数上限チェック
            if (!$(this).hasClass('active')) {
                if ($('.screen .seat a.active').length > limit - 1) {
                    alert('上限');
                    return;
                }
            }

            $(this).toggleClass('active');
        });

        /**
         * 次へクリックイベント
         */
        $(document).on('click', '.next-button button', function (event) {
            event.preventDefault();
            // 座席コードリストを取得
            var seatCodes = $('.screen .seat a.active').map(function () { 
                return $(this).attr('data-seat-code') }
            ).get();

            if (seatCodes.length < 1) {
                alert('未選択');
            } else {
                // location.hrefにpostする
                var form = $('form');
                var dom = $('<input type="hidden" name="seatCodes">').val(JSON.stringify(seatCodes));
                form.append(dom);
                form.submit();
            }
        });
    } else if (url === '/purchase/denominationSelect') {
        /**
         * 券種クリックイベント
         */
        $(document).on('click', '.modal[data-modal="ticket-type"] a', function (event) {
            event.preventDefault();
            var ticketType = $(this).attr('data-ticket-type');
            var ticketName = $(this).parent().parent().parent().find('dt').text();
            var triggerIndex = $('.modal[data-modal="ticket-type"]').attr('data-modal-trigger-index');
            var target = $('.seats li').eq(triggerIndex);
            target.find('dd a').text(ticketName);
            target.find('dd').attr('data-seat-type', ticketType);
        });

        /**
         * 次へクリックイベント
         */
        $(document).on('click', '.next-button button', function (event) {
            event.preventDefault();
            var result = [];
            var flag = true;
            $('.seats li').each(function(index, elm){
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
                var dom = $('<input type="hidden" name="seatCodes">').val(JSON.stringify(result));
                form.append(dom);
                form.submit();
            }
        });
    }
});