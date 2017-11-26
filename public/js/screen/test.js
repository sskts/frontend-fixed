var screenSeatStatusesMap;
$(function () {
    $('.seat-limit-text').text($('.screen-cover').attr('data-limit'));
    loadingStart();
    screenStateUpdate(function () {
        loadingEnd();
    });

    // 座席クリックイベント
    $(document).on('click', '.zoom-btn a', function (event) {
        event.preventDefault();
        if (screenSeatStatusesMap.isZoom()) {
            screenSeatStatusesMap.scaleDown();
        }
    });

    // 座席クリックイベント
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
                modal.open('seatUpperLimit');
                return;
            }
        }

        $(this).toggleClass('active');
    });

    // スクロール
    $(window).on('scroll', function (event) {
        zoomButtonScroll();
    });
});

/**
 * ズームボタンスクロール
 * @function zoomButtonScroll
 * @returns {void}
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
    if (screenTop < winTop && (screenTop + screenH - targetH - fixH * 2) > winTop) {
        target.css({ top: fixH + 'px', right: screenRight + fixH + 'px' });
        target.addClass('scroll');
    } else if ((screenTop + screenH - targetH - fixH * 2) < winTop) {
        target.css({ top: screenH - targetH - fixH + 'px', right: fixH + 'px' });
        target.removeClass('scroll');
    } else {
        target.css({ top: fixH + 'px', right: fixH + 'px' });
        target.removeClass('scroll');
    }
}


/**
 * スクリーン状態取得
 * @function getScreenStateReserve
 * @param {number} count
 * @param {function} cb
 * @returns {void}
 */
function getScreenStateReserve(count, cb) {
    var params = getParameter();
    if (params.theater === undefined || params.screen === undefined) {
        alert('パラメータが不適切です');
    }
    var target = $('.screen-cover');
    $.ajax({
        dataType: 'json',
        url: '/screen',
        type: 'POST',
        timeout: 10000,
        data: {
            theaterCode: params.theater, // 施設コード
            screenCode: params.screen, // スクリーンコード
        },
        beforeSend: function () { }
    }).done(function (res) {
        if (!res.result) return retry(count, cb);
        cb(res.result);
        loadingEnd();
    }).fail(function (jqxhr, textStatus, error) {
        retry(count, cb)
    }).always(function () {
        
    });
}

/**
 * リトライ
 * @function retry
 * @param {number} count
 * @param {function} cb
 * @returns {void}
 */
function retry(count, cb) {
    count++;
    var limit = 10;
    if (count > limit) return location.replace = '/error';
    var timer = 3000;
    setTimeout(function () {
        getScreenStateReserve(count, cb);
    }, timer);
}

/**
 * スクリーン状態更新
 * @function screenStateChange
 * @param {Object} state
 * @returns {void}
 */
function screenStateChange(state) {
    var screen = $('.screen');
    //席状態変更
    $('.seat a').addClass('disabled');

    var purchaseSeats = ($('input[name=seats]').val()) ? JSON.parse($('input[name=seats]').val()) : '';
    if (purchaseSeats) {
        //予約している席設定
        for (var i = 0, len = purchaseSeats.listTmpReserve.length; i < len; i++) {
            var purchaseSeat = purchaseSeats.listTmpReserve[i];
            var seatNum = purchaseSeat.seatNum;
            var seat = $('.seat a[data-seat-code=' + seatNum + ']');
            seat.removeClass('disabled');
            seat.addClass('active');
        }
    }
    if (state && state.cntReserveFree > 0) {
        //空いている座席設定
        var freeSeats = state.listSeat[0].listFreeSeat;
        for (var i = 0, len = freeSeats.length; i < len; i++) {
            var freeSeat = freeSeats[i];
            // var seatNum = replaceHalfSize(freeseat.seatNum);
            var seat = $('.seat a[data-seat-code=' + freeSeat.seatNum + ']');
            if (seat && !seat.hasClass('active')) {
                seat.removeClass('disabled');
                seat.addClass('default');
            }
        }
    }
}

/**
 * スクリーン状態更新
 * @function screenStateUpdate
 * @param {function} cb
 * @returns {void}
 */
function screenStateUpdate(cb) {
    getScreenStateReserve(0, function (result) {
        createScreen(result.setting, result.screen);
        screenStateChange(result.state);
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
