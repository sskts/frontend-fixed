$(function () {
    var id = getParameter()['id'];
    if (id) {
        getTransaction(id);
    }
});

/**
 * 取引取得
 * @param {string} id
 * @returns {void}
 */
function getTransaction(id) {
    $.ajax({
        dataType: 'json',
        url: '/purchase/transaction',
        type: 'POST',
        timeout: 10000,
        data: {
            id: id
        },
        beforeSend: function () {
            loadingStart();
        }
    }).done(function (res) {
        if (!res.err && res.redirect) {
            location.replace(res.redirect);
        } else {
            retry();
        }
    }).fail(function (jqxhr, textStatus, error) {
        retry();
    }).always(function () {
        loadingEnd();
    });
}

/**
 * リトライ
 * @function retry
 * @returns {void}
 */
function retry() {
    var timer = 30000;
    $('.wrapper-inner').show();
    setTimeout(function(){
        getTransaction();
    }, timer);
}
