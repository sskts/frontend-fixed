var screenSeatStatusesMap;
$(function () {
    var modal = new SASAKI.Modal();
    loadingStart(function () {
        screenStateUpdate(function () {
            loadingEnd();
        });
    });


    /**
     * 座席クリックイベント
     */
    $(document).on('click', '.zoom-btn a', function (event) {
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
        var seats = {
            list_tmp_reserve: []
        };
        $('.screen .seat a.active').each(function (index, elem) {
            seats.list_tmp_reserve.push({
                seat_num: $(this).attr('data-seat-code'),
                seat_section: '0'
            });
        });


        if (seats.list_tmp_reserve.length < 1) {
            modal.open('seat_not_select');
            return;
        }
        validation();
        if ($('.validation-text').length > 0) {
            validationScroll();
            return;
        }

        var reserveTickets = [];
        var form = $('form');
        $('input[name=seats]').val(JSON.stringify(seats));

        loadingStart(function () {
            form.submit();
        });
    });

    /**
     * スクロール
     */
    $(window).on('scroll', function (event) {
        zoomButtonScroll();
    });
    
});

/**
 * ズームボタンスクロール
 */
function zoomButtonScroll() {
    if (screenSeatStatusesMap && !screenSeatStatusesMap.isZoom()) return;
    var win = $(window);
    var winTop = win.scrollTop();
    var screen = $('.screen');
    var screenTop = screen.offset().top;
    var screenRight = screen.offset().left;
    var screenH = screen.height();
    var target = $('.zoom-btn');
    var targetH = target.height();
    var fixH = 10;
    if (screenTop < winTop
        && (screenTop + screenH - targetH - fixH * 2) > winTop) {
        target.css({
            top: fixH + 'px',
            right: screenRight + fixH + 'px'
        });
        target.addClass('scroll');
    } else if ((screenTop + screenH - targetH - fixH * 2) < winTop) {
        target.css({
            top: screenH - targetH - fixH + 'px',
            right: fixH + 'px'
        });
        target.removeClass('scroll');
    } else {
        target.css({
            top: fixH + 'px',
            right: fixH + 'px'
        });
        target.removeClass('scroll');
    }
    
}


/**
 * スクリーン状態取得
 */
function getScreenStateReserve(_cb) {
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
        _cb(res.result);
    }).fail(function (jqxhr, textStatus, error) {
        alert('スケジュール取得失敗');
    }).always(function () {
        loadingEnd();
    });
}

/**
 * スクリーン状態更新
 */
function screenStateChange(result) {
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
            var seat = $('.seat a[data-seat-code=' + seatNum + ']');
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
            var seat = $('.seat a[data-seat-code=' + freeSeat.seat_num + ']');
            if (seat && !seat.hasClass('active')) {
                seat.removeClass('disabled');
                seat.addClass('default');
            }
        }
    }
}


/**
 * スクリーン状態更新
 */
function screenStateUpdate(_cb) {
    getScreenStateReserve(function (result) {
        screenStateChange(result);
        var screen = $('.screen');
        screen.css('visibility', 'visible');
        screenSeatStatusesMap = new SASAKI.ScreenSeatStatusesMap(screen);
        screenSeatStatusesMap.setScaleUpCallback(function () {
            $('.zoom-btn').show();
            zoomButtonScroll();
        });
        screenSeatStatusesMap.setScaleDownCallback(function () {
            $('.zoom-btn').hide();
        });
        _cb();
    });
}   

/**
 * バリデーションスクロール
 */
function validationScroll() {
    var target = $('.validation').eq(0);
    var top = target.offset().top - 20;
    $('html,body').animate({ scrollTop: top }, 300);
}

/**
 * バリデーション
 */
function validation() {
    $('.validation').removeClass('validation');
    $('.validation-text').remove();

    var validationList = [
        { name: 'agree', label: locales.label.agree, agree: true },
    ];


    validationList.forEach(function (validation, index) {

        var target = $('input[name=' + validation.name + ']');
        var value = target.val();

        if (validation.required
            && !value
            && value == '') {
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + locales.validation.required + '</div>');
        } else if (validation.maxLength
            && value.length > validation.maxLength) {
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + locales.validation.required + '</div>');
        } else if (validation.regex
            && !value.match(validation.regex[0])) {
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + validation.regex[1] + '</div>');
        } else if (validation.equals
            && value !== $('input[name=' + validation.equals + ']').val()) {
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + locales.validation.equals + '</div>');
        } else if (validation.agree
            && !target.is(':checked')) {
            target = $('label[for=' + validation.name + ']');
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + locales.validation.agree + '</div>');
        }
    });

}