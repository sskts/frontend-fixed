var screenSeatStatusesMap;

$(function () {
    $('.purchase-complete').hide();
    var modal = new SASAKI.Modal();
    /**
     * 次へクリックイベント
     */
    $(document).on('click', '.next-button button', function (event) {
        event.preventDefault();
        validation();
        if ($('.validation-text').length > 0) {
            validationScroll();
            return;
        }
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
            if (res.err) {
                console.log(res);
                if (res.err.type === 'expired') {
                    //コンテンツ切り替え
                    $('.error-expired .read').html(res.err.message);
                    $('.purchase-confirm').remove();
                    $('.header .steps').remove();
                    $('.error-expired').show();
                    $(window).scrollTop(0);
                    history.pushState(null, null, '/error');
                } else if (res.err.type === 'updateReserve') {
                    $('.modal[data-modal=update_reserve_error] .modal-ttl strong').text(res.err.message);
                    modal.open('update_reserve_error');
                }
                
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

    /**
     * 確認クリックイベント
     */
    $('.confirm-button a').on('click', function (event) {
        event.preventDefault();
        loadingStart(function () {
            screenStateUpdate(function () {
                modal.open('screen');
                setTimeout(function () {
                    screenSeatStatusesMap.init();
                    modal.resize();
                }, 0);
            });
        });
    });
});


/**
 * スクリーン状態取得
 * @function getScreenStateReserve
 * @param {function} cb
 * @returns {void}
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
        cb(res.result);
    }).fail(function (jqxhr, textStatus, error) {
        alert('スケジュール取得失敗');
    }).always(function () {
        loadingEnd();
    });
}

/**
 * スクリーン状態更新
 * @function screenStateChange
 * @returns {void}
 */
function screenStateChange() {
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
}


/**
 * スクリーン状態更新
 * @function screenStateUpdate
 * @returns {void}
 */
function screenStateUpdate(cb) {
    getScreenStateReserve(function (result) {
        screenStateChange(result);
        var screen = $('.screen');
        screen.css('visibility', 'visible');
        screenSeatStatusesMap = new SASAKI.ScreenSeatStatusesMap(screen);
        screenSeatStatusesMap.setPermission(false);
        cb();
    });
}

/**
 * バリデーションスクロール
 * @function validationScroll
 * @returns {void}
 */
function validationScroll() {
    var target = $('.validation').eq(0);
    var top = target.offset().top - 20;
    $('html,body').animate({ scrollTop: top }, 300);
}

/**
 * バリデーション
 * @function validation
 * @returns {void}
 */
function validation() {
    $('.validation').removeClass('validation');
    $('.validation-text').remove();

    var validationList = [
        { name: 'notes_agree', label: locales.label.notes, agree: true },
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