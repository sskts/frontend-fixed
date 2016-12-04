$(function () {
    new Modal();
    var url = location.pathname;
    if (url === '/purchase/seatSelect') {
        new ScreenSeatStatusesMap($('.screen'));
    }
});