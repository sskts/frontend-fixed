$(function () {
    /**
     * 閉じるクリックイベント
     */
    $(document).on('click', '.close-button a', function (event) {
        event.preventDefault();
        window.close();
    });

});
