$(function() {
    var inquiryUrl = '/inquiry/login?theater=' + window.config.theater; 
    $('.inquiry-button a').attr('href', inquiryUrl);
    createQRCode($('input[name=portalSite]').val() + inquiryUrl);
});

/**
 * QRコード生成
 * @function createQRCode
 * @param {string} url QRコードURL
 * @param {any} option オプション
 */
function createQRCode(url, option) {
    var width = (option !== undefined && option.width !== undefined) ? option.width : 100;
    var height = (option !== undefined && option.height !== undefined) ? option.height : 100;
    var alt = (option !== undefined && option.alt !== undefined) ? option.alt : '';
    // QR
    var qr = new VanillaQR({
        url: url,
        width: width,
        height: height,
        colorLight: '#FFF',
        colorDark: '#000',
        noBorder: true
    });
    var image = qr.toImage('png');
    image.width = width;
    image.height = height;
    image.alt = alt;
    $('.qr-code').append(image);
}