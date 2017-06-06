


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
 * @function ticketing
 * @param {Function} cb
 * @returns {void}
 */
function ticketing(cb) {
    loadingStart();
    var reservations = JSON.parse($('input[name=reservations]').val());
    // 予約オブジェクトを投げ込んで印刷する (Promiseが返ってくる。配列の場合はprintReservationArray()を使う)
    window.epsonThermalPrint.printReservationArray(reservations).then(function () {
        // printAlert('印刷完了');
        cb();
    }).catch(function (errMsg) {
        printAlert('印刷に失敗しました\n' + errMsg);
    }).then(function () {
        loadingEnd();
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
