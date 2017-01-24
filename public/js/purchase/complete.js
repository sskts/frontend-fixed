$(function () {
    heightFix();

    /**
     * QR確認
     */
    $(document).on('click', '.inquiry-button a', function (event) {
        event.preventDefault();
        var purchaseNo = $('.purchase-number dd strong').text();
        $('input[name=reserve_num]').val(purchaseNo);
        $('.inquiry-form').submit();
    });

});