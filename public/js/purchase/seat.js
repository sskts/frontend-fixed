var screenSeatStatusesMap;
$(function () {
    $('.seat-limit-text').text($('.screen-cover').attr('data-limit'));
    var modal = new SASAKI.Modal();
    loadingStart(function () {
        screenStateUpdate(function () {
            loadingEnd();
        });
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
                modal.open('seat_upper_limit');
                return;
            }
        }

        $(this).toggleClass('active');
    });

    // 次へクリックイベント
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
    var target = $('.screen-cover');
    $.ajax({
        dataType: 'json',
        url: '/purchase/getScreenStateReserve',
        type: 'POST',
        timeout: 1000,
        data: {
            theater_code: target.attr('data-theater'), // 施設コード
            date_jouei: target.attr('data-day'), // 上映日
            title_code: target.attr('data-coa-title-code'), // 作品コード
            title_branch_num: target.attr('data-coa-title-branch-num'), // 作品枝番
            time_begin: target.attr('data-time-start'), // 上映時刻
            screen_code: target.attr('data-screen-code'), // スクリーンコード
        },
        beforeSend: function () { }
    }).done(function (res) {
        console.log(res);
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
    if (state && state.cnt_reserve_free > 0) {
        //空いている座席設定
        var freeSeats = state.list_seat[0].list_free_seat;
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
 * スクリーン生成
 * @function createScreen
 * @param {Object} setting スクリーン共通設定
 * @param {Object} screen スクリーン固有設定
 * @returns {JQuery}
 */
function createScreen(setting, screen) {
    var screenDom = $('.screen .screen-scroll');

    //html挿入の場合
    if (screen.html) {
        return screenDom.append(screen.html);
    }

    //通路大きさ
    var aisle = (screen.aisle) ? screen.aisle : setting.aisle;
    //座席同士の間隔
    var seatMargin = (screen.seatMargin) ? screen.seatMargin : setting.seatMargin;
    //座席の大きさ
    var seatSize = (screen.seatSize) ? screen.seatSize : setting.seatSize;
    //座席の大きさ
    var seatSize = (screen.seatSize) ? screen.seatSize : setting.seatSize;
    //座席ラベル位置
    var seatLabelPos = (screen.seatLabelPos) ? screen.seatLabelPos : setting.seatLabelPos;
    //座席番号位置
    var seatNumberPos = (screen.seatNumberPos) ? screen.seatNumberPos : setting.seatNumberPos;

    //y軸ラベル
    var labels = [];
    var startLabelNo = 65;
    var endLabelNo = 91;
    for (var i = startLabelNo; i < endLabelNo; i++) {
        labels.push(String.fromCharCode(i));
    }

    //ポジション
    var pos = { x: 0, y: 0 };

    //HTML
    var objectsHtml = [];
    var seatNumberHtml = [];
    var seatLabelHtml = [];
    var seatHtml = [];
    var labelCount = 0;

    for (var i = 0; i < screen.objects.length; i++) {
        var object = screen.objects[i];
        objectsHtml.push('<div class="object" style="' +
            'width: ' + object.w + 'px; ' +
            'height: ' + object.h + 'px; ' +
            'top: ' + object.y + 'px; ' +
            'left: ' + object.x + 'px; ' +
            'background-image: url(' + object.image + '); ' +
            'background-size: ' + object.w + 'px ' + object.h + 'px; ' +
            '"></div>');
    }

    for (var y = 0; y < screen.map.length; y++) {
        if (y === 0) pos.y = 0;
        //ポジション設定
        if (y === 0) {
            pos.y += screen.seatStart.y;
        } else if (screen.map[y].length === 0) {
            pos.y += aisle.middle.h - seatMargin.h;
        } else {
            labelCount++;
            pos.y += seatSize.h + seatMargin.h;
        }

        for (var x = 0; x < screen.map[y].length; x++) {
            if (x === 0) pos.x = screen.seatStart.x;

            //座席ラベルHTML生成
            if (x === 0) {
                seatLabelHtml.push('<div class="object label-object" style="width: ' + seatSize.w + 'px; height: ' + seatSize.h + 'px; top:' + pos.y + 'px; left:' + (pos.x - seatLabelPos) + 'px">' + labels[labelCount] + '</div>');
            }
            //座席番号HTML生成
            if (y === 0) {
                seatNumberHtml.push('<div class="object label-object" style="width: ' + seatSize.w + 'px; height: ' + seatSize.h + 'px; top:' + (pos.y - seatNumberPos) + 'px; left:' + pos.x + 'px">' + (x + 1) + '</div>');
            }
            if (screen.map[y][x] === 1 || screen.map[y][x] === 4 || screen.map[y][x] === 5) {
                //座席HTML生成
                var code = toFullWidth(labels[labelCount]) + '－' + toFullWidth(String(x + 1)); //Ａ－１９
                var label = labels[labelCount] + String(x + 1);
                if (screen.hc.indexOf(label) !== -1) {
                    seatHtml.push('<div class="seat seat-hc" style="top:' + pos.y + 'px; left:' + pos.x + 'px">' +
                        '<a href="#" style="width: ' + seatSize.w + 'px; height: ' + seatSize.h + 'px" data-seat-code="' + code + '"><span>' + label + '</span></a>' +
                        '</div>');
                } else {
                    seatHtml.push('<div class="seat" style="top:' + pos.y + 'px; left:' + pos.x + 'px">' +
                        '<a href="#" style="width: ' + seatSize.w + 'px; height: ' + seatSize.h + 'px" data-seat-code="' + code + '"><span>' + label + '</span></a>' +
                        '</div>');
                }

            }
            //ポジション設定
            if (screen.map[y][x] === 2) {
                pos.x += aisle.middle.w + seatMargin.w;
            } else if (screen.map[y][x] === 3) {
                pos.x += aisle.small.w + seatMargin.w;
            } else if (screen.map[y][x] === 4) {
                pos.x += aisle.middle.w + seatSize.w + seatMargin.w;
            } else if (screen.map[y][x] === 5) {
                pos.x += aisle.small.w + seatSize.w + seatMargin.w;
            } else if (screen.map[y][x] === 6) {
                pos.x += aisle.middle.w + seatSize.w + seatMargin.w;
            } else if (screen.map[y][x] === 7) {
                pos.x += aisle.small.w + seatSize.w + seatMargin.w;
            } else {
                pos.x += seatSize.w + seatMargin.w;
            }
        }
    }
    //スクリーンタイプ
    var type = '';
    switch (screen.type) {
        case 1:
            type = 'screen-imax';
            break;
        case 2:
            type = 'screen-4dx';
            break;
        default:
            type = '';
            break;
    }
    $('.screen-cover').addClass(type);
    var html = '<div class="screen-inner" style=" width: ' + screen.size.w + 'px; height: ' + screen.size.h + 'px;">' +
        objectsHtml.join('\n') +
        seatNumberHtml.join('\n') +
        seatLabelHtml.join('\n') +
        seatHtml.join('\n') +
        '<div>';

    return screenDom.append(html);
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
