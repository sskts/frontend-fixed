document.addEventListener('DOMContentLoaded', function () {
    loadingStart();
    var machineProperties = JSON.parse(window.localStorage.getItem('config')) || {};
    if (!machineProperties.device_id || !machineProperties.printer) {
        // printAlert('スター精密プリンターのIPアドレスが設定されていません');
        loadingEnd();
        return;
    }
    // console.log('machineProperties', machineProperties);

    // IPを指定して接続(Promiseが返ってくる。失敗してもそのままもう一度実行可能)
    window.starThermalPrint.init({
        ipAddress: machineProperties.printer,
        deviceId: machineProperties.device_id,
        timeout: 100000
    }).then(function () {
        loadingEnd();
    }).catch(function (errorMsg) {
        printAlert('プリンターの呼び出しでエラーが発生しました。<br>劇場係員をお呼びください。<br>' + '<div class="small-text">' + errMsg.replace(/\n/g, '<br>') + '</div>');
    });
});

/**
 * 発券
 * @function printTicket
 * @param {number} count
 * @param {Function} cb
 * @returns {void}
 */
function printTicket(count, cb) {
    var retryTime = 5000;
    var limit = 10;
    count++;
    if (count > limit) {
        printAlert('印刷情報が取得できません<br>劇場係員をお呼びください。');

        return;
    }
    $.ajax({
        dataType: 'json',
        url: '/fixed/getInquiryData',
        type: 'POST',
        timeout: 60000,
        data: {
            theater_code: $('input[name=theater_code]').val(),
            reserve_num: $('input[name=reserve_num]').val(
            ),
            tel_num: $('input[name=tel_num]').val()
        },
    }).done(function (res) {
        var reservations = res.result;
        if (reservations !== null) {
            printerSend(reservations, cb);
        } else {
            setTimeout(function () {
                printTicket(count, cb);
            }, retryTime);
        }
    }).fail(function (jqxhr, textStatus, error) {
        setTimeout(function () {
            printTicket(count, cb);
        }, retryTime);
    });
}

/**
 * プリンタへ送信
 * @function printerSend
 * @param {*} reservations 
 * @param {*} cb 
 */
function printerSend(reservations, cb) {
    // 予約オブジェクトを投げ込んで印刷する (Promiseが返ってくる。配列の場合はprintReservationArray()を使う)
    window.starThermalPrint.printReservationArray(reservations).then(function () {
        loadingEnd();
        cb();
        var timer = 10000;
        setTimeout(function () {
            location.href = '/';
        }, timer);
    }).catch(function (errMsg) {
        printAlert('印刷に失敗しました<br>劇場係員をお呼びください。<br>' + '<div class="small-text">' + errMsg.replace(/\n/g, '<br>') + '</div>');
        $('body').append('<div class="staff-button"><a href="#"></a></div>');
        $('.staff-button a').on('click', function (event) {
            event.preventDefault();
            modal.close();
            loadingEnd();
            $('.staff-button').remove();
            printerSend(reservations, cb);
        });
    });
}

/**
 * // プリンターアラート
 * @function printAlert
 * @param {string} msg
 * @returns {void}
 */
function printAlert(msg) {
    window.modal = window.modal || new SASAKI.Modal();
    var modalBody = $('.modal[data-modal=print] .modal-body');
    modalBody.html(msg);
    loadingEnd();
    modal.open('print');
}
