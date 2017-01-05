var screenSeatStatusesMap;
$(function () {
    getScreenStateReserve();
    screenSeatStatusesMap = new SASAKI.ScreenSeatStatusesMap($('.screen'));
    /**
     * 座席クリックイベント
     */
    $('.screen').on('click', '.seat a', function () {
        // スマホで拡大操作
        if (screenSeatStatusesMap.isDeviceType('sp') && !screenSeatStatusesMap.isZoomState()) {
            return;
        }
        var limit = Number($('.screen-cover').attr('data-limit'));
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


/**
 * スクリーン状態取得
 */
function getScreenStateReserve() {
    var target = $('.screen-cover');
    $.ajax({
        dataType: 'json',
        url: '/purchase/getScreenStateReserve',
        type: 'POST',
        timeout: 100000,
        data: {
            /** 施設コード */
            theater_code: target.attr('data-theater'),
            /** 上映日 */
            date_jouei: target.attr('data-day'),
            /** 作品コード */
            title_code: target.attr('data-film'),
            /** 作品枝番 */
            title_branch_num: target.attr('data-film-branch-code'),
            /** 上映時刻 */
            time_begin: target.attr('data-time-start'),
        },
        beforeSend: function () {}
    }).done(function (res) {
        console.log(res)
        if (res.err) {
            alert('スケジュール取得失敗');
        } else {
            console.log(res.result)
        }
    }).fail(function (jqxhr, textStatus, error) {
        alert('スケジュール取得失敗');
    }).always(function () {});
}