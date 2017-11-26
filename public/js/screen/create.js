/**
 * スクリーン生成
 * @function createScreen
 * @param {Object} setting スクリーン共通設定
 * @param {Object} screen スクリーン固有設定
 * @returns {JQuery}
 */
function createScreen(setting, screen) {
    var screenDom = $('.screen .screen-scroll');

    //html挿入の場合
    if (screen.html) {
        return screenDom.append(screen.html);
    }

    //通路大きさ
    var aisle = (screen.aisle) ? screen.aisle : setting.aisle;
    //座席同士の間隔
    var seatMargin = (screen.seatMargin) ? screen.seatMargin : setting.seatMargin;
    //座席の大きさ
    var seatSize = (screen.seatSize) ? screen.seatSize : setting.seatSize;
    //座席の大きさ
    var seatSize = (screen.seatSize) ? screen.seatSize : setting.seatSize;
    //座席ラベル位置
    var seatLabelPos = (screen.seatLabelPos) ? screen.seatLabelPos : setting.seatLabelPos;
    //座席番号位置
    var seatNumberPos = (screen.seatNumberPos) ? screen.seatNumberPos : setting.seatNumberPos;

    //y軸ラベル
    var labels = [];
    var startLabelNo = 65;
    var endLabelNo = 91;
    for (var i = startLabelNo; i < endLabelNo; i++) {
        labels.push(String.fromCharCode(i));
    }

    //ポジション
    var pos = { x: 0, y: 0 };

    //HTML
    var objectsHtml = [];
    var seatNumberHtml = [];
    var seatLabelHtml = [];
    var seatHtml = [];
    var labelCount = 0;

    for (var i = 0; i < screen.objects.length; i++) {
        var object = screen.objects[i];
        objectsHtml.push('<div class="object" style="' +
            'width: ' + object.w + 'px; ' +
            'height: ' + object.h + 'px; ' +
            'top: ' + object.y + 'px; ' +
            'left: ' + object.x + 'px; ' +
            'background-image: url(' + object.image + '); ' +
            'background-size: ' + object.w + 'px ' + object.h + 'px; ' +
            '"></div>');
    }

    for (var y = 0; y < screen.map.length; y++) {
        if (y === 0) pos.y = 0;
        //ポジション設定
        if (y === 0) {
            pos.y += screen.seatStart.y;
        } else if (screen.map[y].length === 0) {
            pos.y += aisle.middle.h - seatMargin.h;
        } else {
            labelCount++;
            pos.y += seatSize.h + seatMargin.h;
        }

        for (var x = 0; x < screen.map[y].length; x++) {
            if (x === 0) pos.x = screen.seatStart.x;

            //座席ラベルHTML生成
            if (x === 0) {
                seatLabelHtml.push('<div class="object label-object" style="width: ' + seatSize.w + 'px; height: ' + seatSize.h + 'px; top:' + pos.y + 'px; left:' + (pos.x - seatLabelPos) + 'px">' + labels[labelCount] + '</div>');
            }

            if (screen.map[y][x] === 8) {
                pos.x += aisle.middle.w;
            } else if (screen.map[y][x] === 9) {
                pos.x += aisle.middle.w;
            } else if (screen.map[y][x] === 10) {
                pos.x += (seatSize.w / 2) + seatMargin.w;
            } else if (screen.map[y][x] === 11) {
                pos.x += (seatSize.w / 2) + seatMargin.w;
            }

            //座席番号HTML生成
            if (y === 0) {
                seatNumberHtml.push('<div class="object label-object" style="width: ' + seatSize.w + 'px; height: ' + seatSize.h + 'px; top:' + (pos.y - seatNumberPos) + 'px; left:' + pos.x + 'px">' + (x + 1) + '</div>');
            }
            if (screen.map[y][x] === 1 || screen.map[y][x] === 4 || screen.map[y][x] === 5 || screen.map[y][x] === 8 || screen.map[y][x] === 10) {
                //座席HTML生成
                var code = toFullWidth(labels[labelCount]) + '－' + toFullWidth(String(x + 1)); //Ａ－１９
                var label = labels[labelCount] + String(x + 1);
                if (screen.hc.indexOf(label) !== -1) {
                    seatHtml.push('<div class="seat seat-hc" style="top:' + pos.y + 'px; left:' + pos.x + 'px">' +
                        '<a href="#" style="width: ' + seatSize.w + 'px; height: ' + seatSize.h + 'px" data-seat-code="' + code + '" data-seat-section=""><span>' + label + '</span></a>' +
                        '</div>');
                } else {
                    seatHtml.push('<div class="seat" style="top:' + pos.y + 'px; left:' + pos.x + 'px">' +
                        '<a href="#" style="width: ' + seatSize.w + 'px; height: ' + seatSize.h + 'px" data-seat-code="' + code + '" data-seat-section=""><span>' + label + '</span></a>' +
                        '</div>');
                }

            }
            //ポジション設定
            if (screen.map[y][x] === 2) {
                pos.x += aisle.middle.w + seatMargin.w;
            } else if (screen.map[y][x] === 3) {
                pos.x += aisle.small.w + seatMargin.w;
            } else if (screen.map[y][x] === 4) {
                pos.x += aisle.middle.w + seatSize.w + seatMargin.w;
            } else if (screen.map[y][x] === 5) {
                pos.x += aisle.small.w + seatSize.w + seatMargin.w;
            } else if (screen.map[y][x] === 6) {
                pos.x += aisle.middle.w + seatSize.w + seatMargin.w;
            } else if (screen.map[y][x] === 7) {
                pos.x += aisle.small.w + seatSize.w + seatMargin.w;
            } else {
                pos.x += seatSize.w + seatMargin.w;
            }
        }
    }
    //スクリーンタイプ
    var type = '';
    switch (screen.type) {
        case 1:
            type = 'screen-imax';
            break;
        case 2:
            type = 'screen-4dx';
            break;
        default:
            type = '';
            break;
    }
    $('.screen-cover').addClass(type);
    var html = '<div class="screen-inner" style=" width: ' + screen.size.w + 'px; height: ' + screen.size.h + 'px;">' +
        objectsHtml.join('\n') +
        seatNumberHtml.join('\n') +
        seatLabelHtml.join('\n') +
        seatHtml.join('\n') +
        '<div>';

    return screenDom.append(html);
}