var screenSeatStatusesMap;

$(function () {
    $('.purchase-complete').hide();
    var modal = new SASAKI.Modal();
    /**
     * 次へクリックイベント
     */
    $(document).on('click', '.next-button button', function (event) {
        event.preventDefault();
        $.ajax({
            dataType: 'json',
            url: '/purchase/confirm',
            type: 'POST',
            timeout: 100000,
            data: {
                toBeExpiredAt: $('input[name=toBeExpiredAt]').val(),
                isSecurityCodeSet: $('input[name=isSecurityCodeSet]').val(),
                transaction_id: $('input[name=transaction_id]').val()
            },
            beforeSend: function () {
                loadingStart();
            }
        }).done(function (res) {
            console.log(res)
            if (res.err) {

            } else {
                //購入番号
                $('.purchase-complete .purchase-number dd strong').text(res.result.reserve_num);
                //step変更
                $('.steps li').removeClass('active');
                $('.steps li:last-child').addClass('active');
                //コンテンツ切り替え
                $('.purchase-confirm').remove();
                $('.purchase-complete').show();
                $(window).scrollTop(0);
                history.pushState(null, null, '/purchase/complete');
                heightFix();
            }
            
        }).fail(function (jqxhr, textStatus, error) {

        }).always(function () {
            loadingEnd();
        });
    });

    var timer = false;
    $(window).on('resize', function () {
        if (timer !== false) {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            heightFix();
        }, 200);
    });


    getScreenStateReserve(function (result) {
        var screen = $('.screen');
        //席状態変更
        $('.seat a').addClass('disabled');

        var purchaseSeats = JSON.parse($('div[data-seats]').attr('data-seats'));
        if (purchaseSeats) {
            console.log(purchaseSeats)
            //予約している席設定
            for (var i = 0, len = purchaseSeats.list_tmp_reserve.length; i < len; i++) {
                var purchaseSeat = purchaseSeats.list_tmp_reserve[i];
                var seatNum = purchaseSeat.seat_num;
                var seat = $('.seat a[data-seat-code=' + seatNum + ']');
                seat.removeClass('disabled');
                seat.addClass('active');
            }
        }
        
        screen.show();
        screenSeatStatusesMap = new SASAKI.ScreenSeatStatusesMap(screen);
        screenSeatStatusesMap.setPermission(false);

    });

    $('.change-button a[data-modal=screen]').on('click', function (e) {
        setTimeout(function(){
            screenSeatStatusesMap.init();
            modal.resize();
        }, 0);
        
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


