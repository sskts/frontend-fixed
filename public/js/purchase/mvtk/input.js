$(function () {
    $(document).on('click', '.add-button a', function(event){
        event.preventDefault();
        addTicket();
    });
});

function addTicket() {
    console.log($('.ticket-list li').length)
    if($('.ticket-list li').length > 2) {
        $('.add-button').remove();
    } else {
        var dom = '<li class="box bg-light-gray mb-small">' +
            '<dl>' +
                '<dt>ムビチケ購入番号(10桁)</dt>' +
                '<dd>' +
                    '<input type="text" name="" value="" placeholder="(例)1111111111" maxlength="10">' +
                '</dd> ' +
                '<dt>ムビチケ暗証番号(4桁)</dt>' +
                '<dd>' +
                    '<input type="text" name="" value="" placeholder="ムビチケ暗証番号(4桁)" maxlength="4">' +
                '</dd>' +
            '</dl>' +
        '</li>';
        
        $('.ticket-list').append(dom);
    };
}