document.addEventListener('DOMContentLoaded', function () {
    loadingStart();
    var machineProperties = JSON.parse(window.localStorage.getItem('config')) || {};
    if (!machineProperties.device_id) {
        printAlert('スター精密プリンターのIPアドレスが設定されていません');
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
        printAlert('プリンターの呼び出しでエラーが発生しました。\n大変お手数ですが係員をお呼びください。\n' + errorMsg);
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
        printAlert('印刷情報が取得できません');

        return;
    }
    $.ajax({
        dataType: 'json',
        url: '/fixed/getInquiryData',
        type: 'POST',
        timeout: 60000,
        data: {
            theater_code: $('input[name=theater_code]').val(),
            reserve_num: $('input[name=reserve_num]').val(),
            tel_num: $('input[name=tel_num]').val()
        },
    }).done(function (res) {
        var reservations = res.result;
        if (reservations !== null) {
            // 予約オブジェクトを投げ込んで印刷する (Promiseが返ってくる。配列の場合はprintReservationArray()を使う)
            window.starThermalPrint.printReservationArray(reservations).then(function () {
                // printAlert('印刷完了');
                cb();
            }).catch(function (errMsg) {
                printAlert('印刷に失敗しました\n' + errMsg);
            });
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
