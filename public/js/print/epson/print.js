


document.addEventListener('DOMContentLoaded', function () {
    loadingStart();
    var machineProperties = JSON.parse(window.localStorage.getItem('config')) || {};
    if (!machineProperties.printer) {
        printAlert('プリンターのIPアドレスが設定されていません');
        return window.location.replace('/setting');
    }
    // console.log('machineProperties', machineProperties);

    // setIntervalのプリンタ監視で異常が出たらdocumentにカスタムイベントで通知される (e.detailの中に詳細)
    document.addEventListener('printerError', function (e) {
        printAlert('プリンター異常発生<br>' + JSON.stringify(e.detail));
    });

    // ↑の異常が解消されたらdocumentに通知される
    document.addEventListener('printerErrorClear', function () {
        modal = modal || new SASAKI.Modal();
        modal.close('print');
        // printAlert('プリンター異常解消');
    });

    // IPを指定して接続(Promiseが返ってくる。失敗してもそのままもう一度実行可能)
    window.epsonThermalPrint.init(machineProperties.printer).then(function () {
        // printButton.innerText = '入場券を印刷';
        // printButton.disabled = false;
        loadingEnd();
    }).catch(function (errorMsg) {
        printAlert('プリンターの呼び出しでエラーが発生しました。<br>大変お手数ですが係員をお呼びください。<br>' + errorMsg);
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
        timeout: 10000,
        data: {
            theater_code: $('input[name=theater_code]').val(),
            reserve_num: $('input[name=reserve_num]').val(),
            tel_num: $('input[name=tel_num]').val()
        },
    }).done(function (res) {
        var reservations = res.result;
        if (reservations !== null) {
            // 予約オブジェクトを投げ込んで印刷する (Promiseが返ってくる。配列の場合はprintReservationArray()を使う)
            window.epsonThermalPrint.printReservationArray(reservations).then(function () {
                // printAlert('印刷完了');
                cb();
            }).catch(function (errMsg) {
                printAlert('印刷に失敗しました\n' + errMsg);
            });
        } else {
            setTimeout(function(){
                printTicket(count, cb);
            }, retryTime);
        }
    }).fail(function (jqxhr, textStatus, error) {
        setTimeout(function(){
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
    // modal.open('print');
}
