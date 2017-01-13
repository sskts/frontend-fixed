$(function () {
    /**
     * 閉じるクリックイベント
     */
    $(document).on('click', '.close-link a', function (event) {
        event.preventDefault();
        window.close();
    });

});
