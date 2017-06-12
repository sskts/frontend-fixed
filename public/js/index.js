$(function() {
    var inquiryUrl = '/inquiry/login?theater=' + window.config.theater; 
    $('.inquiry-button a').attr('href', inquiryUrl);
});