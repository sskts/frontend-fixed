$(function () {
    var link = $('.inquiry-button a').attr('href');
    $('.inquiry-login-link').attr('href', link);
    heightFix();

    /**
     * 印刷
     */
    $(document).on('click', '.print-button a', function (event) {
        event.preventDefault();
        print();
    });

});