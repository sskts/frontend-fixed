var screenSeatStatusesMap;
$(function () {
    var modal = new SASAKI.Modal();
    getScreenStateReserve(function (result) {
        var screen = $('.screen');
        //席状態変更
        $('.seat a').addClass('disabled');
        
        var purchaseSeats = ($('input[name=seats]').val()) ? JSON.parse($('input[name=seats]').val()) : '';
        if (purchaseSeats) {
            console.log(purchaseSeats)
            //予約している席設定
            for (var i = 0, len = purchaseSeats.list_tmp_reserve.length; i < len; i++) {
                var purchaseSeat = purchaseSeats.list_tmp_reserve[i];
                var seatNum = purchaseSeat.seat_num;
                var seat = $('.seat a[data-seat-code='+ seatNum +']');
                seat.removeClass('disabled');
                seat.addClass('active');
            }
        }
        if (result && result.cnt_reserve_free > 0) {
            //空いている座席設定
            var freeSeats = result.list_seat[0].list_free_seat;
            for (var i = 0, len = freeSeats.length; i < len; i++) {
                var freeSeat = freeSeats[i];
                // var seatNum = replaceHalfSize(freeSeat.seat_num);
                var seat = $('.seat a[data-seat-code='+ freeSeat.seat_num +']');
                if (seat && !seat.hasClass('active')) {
                    seat.removeClass('disabled');
                    seat.addClass('default');
                }
            }
        }
        
        

        screen.show();
        screenSeatStatusesMap = new SASAKI.ScreenSeatStatusesMap(screen);
        screenSeatStatusesMap.setScaleUpCallback(function(){
            $('.zoom-btn').show();
        });
        screenSeatStatusesMap.setScaleDownCallback(function(){
            $('.zoom-btn').hide();
        });
        
    });

    /**
     * 座席クリックイベント
     */
    $(document).on('click', '.zoom-btn a', function(event) {
        event.preventDefault();
        if (screenSeatStatusesMap.isZoom()) {
            screenSeatStatusesMap.scaleDown();
        }
    });

    /**
     * 座席クリックイベント
     */
    $('.screen').on('click', '.seat a', function () {
        //スマホで拡大操作
        if ($('.screen .device-type-sp').is(':visible') && !screenSeatStatusesMap.isZoom()) {
            return;
        }
        var limit = Number($('.screen-cover').attr('data-limit'));
        if ($(this).hasClass('disabled')) {
            return;
        }
        // 座席数上限チェック
        if (!$(this).hasClass('active')) {
            if ($('.screen .seat a.active').length > limit - 1) {
                modal.open('seat_upper_limit');
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
        var seats = [];
        $('.screen .seat a.active').each(function(index, elem) {
            seats.push({
                seat_num: $(this).attr('data-seat-code'),
                seat_section: '0'
            });
        });
        

        if (seats.length < 1) {
            modal.open('seat_not_select');
        } else {
            var reserveTickets = [];
            var form = $('form');
            $('input[name=seats]').val(JSON.stringify(seats));
            
            form.submit();
            loadingStart();
            $(this).prop('disabled', true);
        }
    });
});


/**
 * スクリーン状態取得
 */
function getScreenStateReserve(cb) {
    var target = $('.screen-cover');
    $.ajax({
        dataType: 'json',
        url: '/purchase/getScreenStateReserve',
        type: 'POST',
        timeout: 1000,
        data: {
            /** 施設コード */
            theater_code: target.attr('data-theater'),
            /** 上映日 */
            date_jouei: target.attr('data-day'),
            /** 作品コード */
            title_code: target.attr('data-coa-title-code'),
            /** 作品枝番 */
            title_branch_num: target.attr('data-coa-title-branch-num'),
            /** 上映時刻 */
            time_begin: target.attr('data-time-start'),
            /** スクリーンコード */
            screen_code: target.attr('data-screen-code'),
        },
        beforeSend: function () { }
    }).done(function (res) {
        //TODO
        console.log(res)
        cb(res.result);
    }).fail(function (jqxhr, textStatus, error) {
        alert('スケジュール取得失敗');
    }).always(function () { });
}

