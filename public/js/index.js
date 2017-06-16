$(function() {
    var inquiryUrl = '/inquiry/login?theater=' + window.config.theater; 
    $('.inquiry-button a').attr('href', inquiryUrl);
    var qr = createQRCode($('input[name=portalSite]').val() + inquiryUrl);
    $('.qr-code').append(qr);
});

/**
 * QRコード生成
 * @function createQRCode
 * @param {string} url QRコードURL
 * @param {any} option オプション
 * @returns {HTMLImageElement} QR画像
 */
function createQRCode(url, options) {
    options = options || {};
    var width = (options.width !== undefined) ? options.width : 100;
    var height = (options.height !== undefined) ? options.height : 100;
    var alt = (options.alt !== undefined) ? options.alt : '';
    var ext = (options.ext !== undefined) ? options.ext : 'png';
    // QR
    var qr = new VanillaQR({
        url: url,
        width: width,
        height: height,
        colorLight: '#FFF',
        colorDark: '#000',
        noBorder: true
    });
    var image = qr.toImage(ext);
    image.width = width;
    image.height = height;
    image.alt = alt;
    return image;
}