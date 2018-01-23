"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 座席テスト
 * @namespace Screen.ScreenModule
 */
const COA = require("@motionpicture/coa-service");
const debug = require("debug");
const fs = require("fs-extra");
const HTTPStatus = require("http-status");
const ErrorUtilModule_1 = require("../Util/ErrorUtilModule");
const UtilModule = require("../Util/UtilModule");
const log = debug('SSKTS:Screen.ScreenModule');
/**
 * 座席選択
 * @memberof Screen.ScreenModule
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function index(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.query.theaterCode === undefined
                || req.query.screenCode === undefined) {
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            }
            const theaterCode = `00${req.query.theaterCode}`.slice(UtilModule.DIGITS['02']);
            const screenCode = `000${req.query.screenCode}`.slice(UtilModule.DIGITS['03']);
            const screen = yield fs.readJSON(`./app/theaters/${theaterCode}/${screenCode}.json`);
            const setting = yield fs.readJSON('./app/theaters/setting.json');
            let state;
            if (req.query.dateJouei !== undefined
                && req.query.titleCode !== undefined
                && req.query.titleBranchNum !== undefined
                && req.query.timeBegin !== undefined) {
                state = yield COA.services.reserve.stateReserveSeat({
                    theaterCode: req.query.theaterCode,
                    dateJouei: req.query.dateJouei,
                    titleCode: req.query.titleCode,
                    titleBranchNum: req.query.titleBranchNum,
                    timeBegin: req.query.timeBegin,
                    screenCode: req.query.screenCode // スクリーンコード
                });
            }
            const createScreenArgs = {
                setting: setting,
                screen: screen,
                state: state,
                option: {
                    resources: req.query.resources,
                    width: req.query.width
                }
            };
            let html = yield createScreen(createScreenArgs);
            const resources = (req.query.resources !== undefined) ? req.query.resources : '';
            html += `<link href="${resources}/css/screen.css" rel="stylesheet">`;
            // tslint:disable-next-line:no-multiline-string
            html += `<script>
        window.onload = function() {
            var inner = document.querySelector('.screen-inner');
            var scroll = document.querySelector('.screen-scroll');
            var scale = Number(scroll.style.transform.replace(/[^-^0-9^\.]/g, ''));
            var data = {
                width: inner.clientWidth * scale,
                height: inner.scrollHeight * scale
            };
            window.parent.postMessage(JSON.stringify(data), '*');
        }
        </script>`;
            res.send(html);
        }
        catch (err) {
            if (err.code !== undefined && err.code === HTTPStatus.BAD_REQUEST) {
                res.status(err.code);
            }
            else {
                res.status(HTTPStatus.NOT_FOUND);
            }
            log(res.statusCode);
            res.send();
        }
    });
}
exports.index = index;
/**
 * スクリーンHTML取得
 * @memberof Screen.ScreenModule
 * @function getScreenHtml
 * @param {Request} req
 * @param {Response} res
 */
function getScreenHtml(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.query.theaterCode === undefined
                || req.query.screenCode === undefined) {
                throw new ErrorUtilModule_1.AppError(HTTPStatus.BAD_REQUEST, ErrorUtilModule_1.ErrorType.Property);
            }
            const theaterCode = `00${req.query.theaterCode}`.slice(UtilModule.DIGITS['02']);
            const screenCode = `000${req.query.screenCode}`.slice(UtilModule.DIGITS['03']);
            const screen = yield fs.readJSON(`./app/theaters/${theaterCode}/${screenCode}.json`);
            const setting = yield fs.readJSON('./app/theaters/setting.json');
            let state;
            if (req.query.dateJouei !== undefined
                && req.query.titleCode !== undefined
                && req.query.titleBranchNum !== undefined
                && req.query.timeBegin !== undefined) {
                state = yield COA.services.reserve.stateReserveSeat({
                    theaterCode: req.query.theaterCode,
                    dateJouei: req.query.dateJouei,
                    titleCode: req.query.titleCode,
                    titleBranchNum: req.query.titleBranchNum,
                    timeBegin: req.query.timeBegin,
                    screenCode: req.query.screenCode // スクリーンコード
                });
            }
            const createScreenArgs = {
                setting: setting,
                screen: screen,
                state: state,
                option: req.query.option
            };
            const html = yield createScreen(createScreenArgs);
            const resources = (req.query.option !== undefined || req.query.option.resources !== undefined)
                ? req.query.option.resources : '';
            res.json({
                result: {
                    html: html,
                    style: `${resources}/css/screen.css`
                }
            });
        }
        catch (err) {
            if (err.code !== undefined && err.code === HTTPStatus.BAD_REQUEST) {
                res.status(err.code);
            }
            else {
                res.status(HTTPStatus.NOT_FOUND);
            }
            log(res.statusCode);
            res.json({ error: err });
        }
    });
}
exports.getScreenHtml = getScreenHtml;
/**
 * スクリーン生成
 * @function createScreen
 * @param {ICreateScreenArgs} args スクリーン固有設定
 * @returns {Promise<string>}
 */
// tslint:disable:max-func-body-length cyclomatic-complexity no-magic-numbers
function createScreen(args) {
    return __awaiter(this, void 0, void 0, function* () {
        log('createScreen');
        const screen = args.screen;
        const setting = args.setting;
        const state = args.state;
        const option = args.option;
        let html = '';
        //スクリーンタイプ
        let screenType = '';
        switch (screen.type) {
            case 1:
                screenType = 'screen-imax';
                break;
            case 2:
                screenType = 'screen-4dx';
                break;
            default:
                screenType = '';
                break;
        }
        const scale = (option !== undefined && option.width !== undefined) ? option.width / screen.size.w : 1;
        //html挿入の場合
        if (screen.html !== undefined) {
            return `<div class="screen-cover ${screenType}">
        <div class="screen">
            <div class="screen-scroll"
            style="transform-origin: 0px 0px 0px;
            transform: scale(${scale});
            height: ${screen.size.h * scale}px">
                <div class="screen-inner" style=" width: ${screen.size.w}px; height: ${screen.size.h}px;">
                    ${screen.html}
                </div>
            </div>
        </div>
    </div>`;
        }
        //style挿入の場合
        if (screen.style !== undefined) {
            html = screen.style;
        }
        //通路大きさ
        const aisle = (screen.aisle !== undefined) ? screen.aisle : setting.aisle;
        //座席同士の間隔
        const seatMargin = (screen.seatMargin !== undefined) ? screen.seatMargin : setting.seatMargin;
        //座席の大きさ
        const seatSize = (screen.seatSize !== undefined) ? screen.seatSize : setting.seatSize;
        //座席ラベル位置
        const seatLabelPos = (screen.seatLabelPos !== undefined) ? screen.seatLabelPos : setting.seatLabelPos;
        //座席番号位置
        const seatNumberPos = (screen.seatNumberPos !== undefined) ? screen.seatNumberPos : setting.seatNumberPos;
        //y軸ラベル
        const labels = [];
        const startLabelNo = 65;
        const endLabelNo = 91;
        for (let i = startLabelNo; i < endLabelNo; i += 1) {
            labels.push(String.fromCharCode(i));
        }
        //ポジション
        const pos = { x: 0, y: 0 };
        //HTML
        const objectsHtml = [];
        const seatNumberHtml = [];
        const seatLabelHtml = [];
        const seatHtml = [];
        let labelCount = 0;
        for (const object of screen.objects) {
            const imageUrl = (option !== undefined && option.resources !== undefined)
                ? (option.resources + object.image)
                : object.image;
            objectsHtml.push(`<div class="object"
        style="width: ${object.w}px;
        height: ${object.h}px;
        top: ${object.y}px;
        left: ${object.x}px;
        background-image: url(${imageUrl});
        background-size: ${object.w}px ${object.h}px;"></div>`);
        }
        for (let y = 0; y < screen.map.length; y += 1) {
            if (y === 0)
                pos.y = 0;
            //ポジション設定
            if (y === 0) {
                pos.y += screen.seatStart.y;
            }
            else if (screen.map[y].length === 0) {
                pos.y += aisle.middle.h - seatMargin.h;
            }
            else {
                labelCount += 1;
                pos.y += seatSize.h + seatMargin.h;
            }
            for (let x = 0; x < screen.map[y].length; x += 1) {
                if (x === 0)
                    pos.x = screen.seatStart.x;
                //座席ラベルHTML生成
                if (x === 0) {
                    // tslint:disable-next-line:max-line-length
                    seatLabelHtml.push(`<div
                class="object label-object line-object line-object-${labelCount}"
                style="width: ${seatSize.w}px; height: ${seatSize.h}px; top:${pos.y}px; left:${(pos.x - seatLabelPos)}px">
                ${labels[labelCount]}</div>`);
                }
                if (screen.map[y][x] === 8) {
                    pos.x += aisle.middle.w;
                }
                else if (screen.map[y][x] === 9) {
                    pos.x += aisle.middle.w;
                }
                else if (screen.map[y][x] === 10) {
                    pos.x += (seatSize.w / 2) + seatMargin.w;
                }
                else if (screen.map[y][x] === 11) {
                    pos.x += (seatSize.w / 2) + seatMargin.w;
                }
                //座席番号HTML生成
                if (y === 0) {
                    seatNumberHtml.push(`<div
                class="object label-object column-object column-object-${x}"
                style="width: ${seatSize.w}px; height: ${seatSize.h}px; top:${(pos.y - seatNumberPos)}px; left:${pos.x}px">
                ${(x + 1)}</div>`);
                }
                if (screen.map[y][x] === 1
                    || screen.map[y][x] === 4
                    || screen.map[y][x] === 5
                    || screen.map[y][x] === 8
                    || screen.map[y][x] === 10) {
                    //座席HTML生成
                    const code = `${toFullWidth(labels[labelCount])}－${toFullWidth(String(x + 1))}`;
                    const label = `${labels[labelCount]}${String(x + 1)}`;
                    if (screen.hc.indexOf(label) !== -1) {
                        seatHtml.push(`<div class="seat seat-hc"
                    style="top:${pos.y}px; left:${pos.x}px">
                        <a href="javascript:void(0)"
                        class="default"
                        style="width: ${seatSize.w}px; height: ${seatSize.h}px"
                        data-seat-code="${code}"
                        data-seat-section="">
                            <span>${label}</span>
                        </a>
                    </div>`);
                    }
                    else {
                        let section = '';
                        let seat;
                        if (state !== undefined) {
                            state.listSeat.forEach((listSeat) => {
                                if (seat !== undefined) {
                                    return;
                                }
                                seat = listSeat.listFreeSeat.find((freeSeat) => {
                                    return (freeSeat.seatNum === code);
                                });
                                if (seat !== undefined) {
                                    section = listSeat.seatSection;
                                }
                            });
                        }
                        seatHtml.push(`<div class="seat"
                    style="top:${pos.y}px; left:${pos.x}px">
                        <a href="javascript:void(0)"
                        class="${(seat === undefined) ? 'disabled' : 'default'}"
                        style="width: ${seatSize.w}px; height: ${seatSize.h}px"
                        data-seat-code="${code}"
                        data-seat-section="${section}">
                            <span>${label}</span>
                        </a>
                    </div>`);
                    }
                }
                //ポジション設定
                if (screen.map[y][x] === 2) {
                    pos.x += aisle.middle.w + seatMargin.w;
                }
                else if (screen.map[y][x] === 3) {
                    pos.x += aisle.small.w + seatMargin.w;
                }
                else if (screen.map[y][x] === 4) {
                    pos.x += aisle.middle.w + seatSize.w + seatMargin.w;
                }
                else if (screen.map[y][x] === 5) {
                    pos.x += aisle.small.w + seatSize.w + seatMargin.w;
                }
                else if (screen.map[y][x] === 6) {
                    pos.x += aisle.middle.w + seatSize.w + seatMargin.w;
                }
                else if (screen.map[y][x] === 7) {
                    pos.x += aisle.small.w + seatSize.w + seatMargin.w;
                }
                else {
                    pos.x += seatSize.w + seatMargin.w;
                }
            }
        }
        html += `
        ${objectsHtml.join('\n')}
        ${seatNumberHtml.join('\n')}
        ${seatLabelHtml.join('\n')}
        ${seatHtml.join('\n')}
    `;
        return `<div class="screen-cover ${screenType}">
        <div class="screen">
            <div class="screen-scroll"
            style="transform-origin: 0px 0px 0px;
            transform: scale(${scale});
            height: ${screen.size.h * scale}px">
                <div class="screen-inner" style=" width: ${screen.size.w}px; height: ${screen.size.h}px;">
                    ${html}
                </div>
            </div>
        </div>
    </div>`;
    });
}
/**
 * 半角=>全角
 * @function toFullWidth
 * @param {string} value
 * @returns {string}
 */
function toFullWidth(value) {
    return value.replace(/./g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);
    });
}
