$(function () {
    var inquiryUrl = '/inquiry/login?theater=' + window.config.theater;
    $('.inquiry-button a').attr('href', inquiryUrl);
    var qr = createQRCode($('input[name=portalSite]').val() + inquiryUrl);
    $('.qr-code').append(qr);
    // ticketDesignTest();
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

/**
 * 券面デザイン確認用
 * @function ticketDesignTest
 * @returns {void} 
 */
function ticketDesignTest() {
    var device_id = 'TEST';
    var zp = function (num) { return (parseInt(num, 10) < 10) ? '0' + num : num; };
    var reservation = {
        reserve_no: '予約番号',
        film_name_ja: 'ガールズ＆パンツァー　劇場版【4DX版】効果マシマシ版',
        film_name_en: '作品名（英）',
        theater_name: '劇場名',
        screen_name: 'スクリーン名',
        performance_day: 'YYYY/MM/DD',
        performance_start_time: 'hh:mm',
        seat_code: 'Ａ－１',
        ticket_name: '券種',
        ticket_sale_price: '1000',
        qr_str: '12345678'
    }

    // -------
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = 560;
    canvas.height = 450;
    var left = 0;
    var center = canvas.width / 2;
    var right = canvas.width;
    var top = 0;
    var bottom = 450;

    // 劇場
    ctx.fillStyle = "black";
    ctx.font = "normal 24px sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(reservation.theater_name, center, 30);
    // 鑑賞日時
    ctx.font = "bold 30px sans-serif";
    ctx.fillText(reservation.performance_day + ' ' + reservation.performance_start_time + '～', center, 70);
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(80, 80);
    ctx.lineTo((canvas.width - 80), 80);
    ctx.closePath();
    ctx.stroke();
    
    // 作品名
    ctx.font = "normal 30px sans-serif";
    var title = reservation.film_name_ja;
    var titleLimit = 20;
    if (title.length > titleLimit) {
        ctx.fillText(title.slice(0, titleLimit), center, 120);
        ctx.fillText(title.slice(titleLimit, title.length), center, 160);
    } else {
        ctx.fillText(title, center, 120);
    }
    // スクリーン
    ctx.beginPath();
    ctx.fillRect(0, 170, canvas.width, 50);
    ctx.font = "bold 40px sans-serif";
    ctx.fillStyle = '#FFF';
    ctx.fillText(reservation.screen_name, center, 210);
    // 座席
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 220, canvas.width - 2, 50);
    ctx.fillStyle = '#000';
    ctx.fillText(reservation.seat_code, center, 260);
    // 券種
    ctx.textAlign = 'left';
    ctx.font = "normal 30px sans-serif";
    ctx.fillText(reservation.ticket_name, 0, 310);
    // 金額
    ctx.textAlign = 'right';
    ctx.fillText('￥' + reservation.ticket_sale_price + '-', right, 310);
    // QR
    var qr = new VanillaQR({
        url: reservation.qr_str,
        width: 120,
        height: 120,
        colorLight: '#FFF',
        colorDark: '#000',
        noBorder: true
    });

    ctx.drawImage(qr.domElement, (canvas.width - 120), 320, 120, 120);
    // 発券時間
    ctx.textAlign = 'left';
    ctx.font = "normal 24px sans-serif";
    var dateObj = new Date();
    var dateStr = '(' + dateObj.getFullYear() + '/' + zp(dateObj.getMonth() + 1) + '/' + zp(dateObj.getDate()) + ' ' + zp(dateObj.getHours()) + ':' + zp(dateObj.getMinutes()) + ' 発券)';
    ctx.fillText(dateStr, left, bottom);
    // 購入番号
    ctx.fillText('購入番号: ' + reservation.reserve_no, left, bottom - 60);
    // 端末ID
    ctx.fillText('端末ID: ' + device_id, left, bottom - 30);
    // --------
    canvas.style.backgroundColor = '#FFF';
    canvas.style.padding = '10px';
    $('.contents').append(canvas);
}