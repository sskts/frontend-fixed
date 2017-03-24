$(function () {
    heightFix();

    /**
     * 印刷
     */
    $(document).on('click', '.print-button a', function (event) {
        event.preventDefault();
        print();
    });

});