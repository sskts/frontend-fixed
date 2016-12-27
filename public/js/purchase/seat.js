$(function () {
    var screenSeatStatusesMap = new SASAKI.ScreenSeatStatusesMap($('.screen'));
    /**
     * 座席クリックイベント
     */
    $('.screen').on('click', '.seat a', function () {
        // スマホで拡大操作
        if (screenSeatStatusesMap.isDeviceType('sp') && !screenSeatStatusesMap.isZoomState()) {
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
        var seat_codes = $('.screen .seat a.active').map(function () {
            return $(this).attr('data-seat-code')
        }).get();

        if (seat_codes.length < 1) {
            alert('未選択');
        } else {
            // location.hrefにpostする
            var form = $('form');
            var dom = $('<input type="hidden" name="seat_codes">').val(JSON.stringify(seat_codes));
            form.append(dom);
            form.submit();
        }
    });
});