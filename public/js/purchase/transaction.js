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
        if (res.redirect !== null) {
            location.replace(res.redirect);
        } else if (res.contents === 'access-congestion') {
            $('.' + res.contents).show();
            $('.wrapper-inner').show();
            retry();
        } else {
            $('.' + res.contents).show();
            $('.wrapper-inner').show();
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
    setTimeout(function(){
        getTransaction();
    }, timer);
}
