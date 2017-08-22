$(function () {
    if (!isFixed()) {
        saveInquiry();
        showQRCode();
    }

    /**
     * チケット情報へ移動
     */
    $(document).on('click', '.ticket-scroll-button a', function(event) {
        event.preventDefault();
        var target = $('.qr-tickets');
        var top = target.offset().top - 20;
        $('html,body').animate({scrollTop: top}, 300);
    });

    /**
     * チケット発券
     */
    $(document).on('click', '.print-button a', function(event) {
        event.preventDefault();
        showComplete();
    });
});

/**
 * QRコード表示
 * @function showQRCode
 * @returns {void}
 */
function showQRCode() {
    $('.qr-code').each(function(index, element) {
        var target = $(element);
        var url = target.attr('data-qrcode');
        var code = createQRCode(url, {
            alt: 'QRコード'
        });
        target.append(code);
    });
}

/**
 * 照会情報保存
 * @function saveInquiry
 * @returns {void}
 */
function saveInquiry() {
    var inquiryInfo = {
        transaction_id: $('input[name=transaction_id]').val(),
        theater_code: $('input[name=theater_code]').val(),
        reserve_num: $('input[name=reserve_num]').val(),
        tel_num: $('input[name=tel_num]').val(),
        expire: $('input[name=expire]').val()
    };
    var data = localStorage.getItem('inquiryInfo');
    var saveData = [];
    if (data) {
        try {
            saveData = JSON.parse(data);
        } catch (err) {
            console.log(err);
        }
    }
    saveData.push(inquiryInfo);
    localStorage.setItem('inquiryInfo', JSON.stringify(saveData));
}

/**
 * 完了画面表示
 * @function showError
 * @param {any} result
 * @returns {void}
 */
function showComplete() {
    var printDom = $('.inquiry-print');
    var navigationDom = $('.navigation .buttons');
    navigationDom.hide();
    $('.ticket-length').text($('input[name=ticketLength]').val());
    //コンテンツ切り替え
    $('.inquiry-confirm').remove();
    printDom.show();
    $(window).scrollTop(0);
    printTicket(0, function () {
        var transactionId = $('input[name=transaction_id]').val();
        var theaterCode = $('input[name=theater_code]').val();
        // 計測
        collection({
            client: 'sskts-frontend',
            label: 'inquiryPrintConversion-' + theaterCode,
            action: 'print',
            category: 'inquiry',
            message: '発券完了',
            transaction: transactionId
        });
        try {
            ga('send', {
                hitType: 'event',
                eventCategory: 'inquiry',
                eventAction: 'print',
                eventLabel: 'conversion-' + theaterCode
            });
        } catch (err) {
            console.error(err);
        }
        //step変更
        $('.steps li').removeClass('active');
        $('.steps li:last-child').addClass('active');
        navigationDom.find('.prev-button').hide();
        navigationDom.show();
        //コンテンツ切り替え
        printDom.remove();
        $('.inquiry-complete').show();
        $(window).scrollTop(0);
    });
}