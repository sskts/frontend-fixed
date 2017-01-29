$(function () {
    $(document).on('click', '.add-button a', function (event) {
        event.preventDefault();
        addTicket();
    });
});

function addTicket() {
    var dom = $('.clone').clone();
    dom.removeClass('clone');
    $('.ticket-list').append(dom);
    if ($('.ticket-list ul').length > 2) {
        $('.add-button').remove();
    };
}