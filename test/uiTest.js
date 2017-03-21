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
 * UIテスト
 */
const debug = require("debug");
const webdriver = require("selenium-webdriver");
const debugLog = debug('SSKTS ');
const width = 1920;
const height = 1080;
const capabilities = {
    'browserstack.user': 'tetsuyamazaki2',
    'browserstack.key': 'mguKp7EvNcdzPiyJi7yp',
    browserName: 'Chrome',
    browser_version: '55.0',
    os: 'Windows',
    os_version: '10',
    resolution: `${width}x${height}`,
    'browserstack.debug': true
};
//設定
debugLog(`-------------------
ブラウザ: ${capabilities.browserName} ${capabilities.browser_version}
OS: ${capabilities.os} ${capabilities.os_version}
画面: ${capabilities.resolution}
-------------------`);
test().then(() => {
    debugLog('DONE');
}).catch((err) => {
    debugLog(err);
});
//test
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        debugLog('テスト開始-----------------------------------');
        const driver = new webdriver.Builder()
            .usingServer('http://hub-cloud.browserstack.com/wd/hub')
            .withCapabilities(capabilities)
            .build();
        const url = 'https://devsasakiticketfrontendprototypewebapp-sasaki-ticket-11.azurewebsites.net/';
        //要素表示待機10秒
        const waitTime = 10000;
        driver.manage().timeouts().implicitlyWait(waitTime);
        //画面サイズfull
        driver.manage().window().setSize(width, height);
        //アクセスURL
        yield driver.get(url);
        //各ページ処理
        yield performanceSelect(driver);
        yield seat(driver);
        yield ticket(driver);
        yield input(driver);
        yield confirm(driver);
        driver.quit();
        debugLog('テスト終了-----------------------------------');
    });
}
/**
 * パフォーマンス一覧
 */
function performanceSelect(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        yield driver.findElements(webdriver.By.css('.performances li'));
        debugLog('パフォーマンス一覧');
        const lists = yield driver.findElements(webdriver.By.css('.performances li'));
        const num = Math.floor(Math.random() * lists.length);
        debugLog('パフォーマンス' + num);
        const performances = yield driver.findElements(webdriver.By.css('.performances li'));
        yield performances[num]
            .findElement(webdriver.By.css('.blue-button a'))
            .click();
        debugLog('次へクリック');
    });
}
/**
 * 座席選択
 */
function seat(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        yield driver.findElement(webdriver.By.css('.purchase-seat'));
        debugLog('座席選択');
        const defaultSeats = yield driver.findElements(webdriver.By.css('.screen .seat .default'));
        const maxCount = 5;
        const count = (defaultSeats.length > maxCount)
            ? Math.floor(Math.random() * (maxCount - 1) + 1)
            : Math.floor(Math.random() * defaultSeats.length);
        debugLog(`座席選択数: ${count}`);
        for (let i = 0; i < count; i += 1) {
            const seats = yield driver.findElements(webdriver.By.css('.screen .seat .default'));
            const num = Math.floor(Math.random() * seats.length);
            debugLog(`座席: ${num}`);
            yield seats[num].click();
        }
        yield driver.findElement(webdriver.By.css('label[for=agree]')).click();
        yield driver
            .findElement(webdriver.By.css('.button-area .next-button button'))
            .click();
        debugLog('次へクリック');
    });
}
/**
 * 券種選択
 */
function ticket(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        yield driver.findElement(webdriver.By.className('purchase-ticket'));
        debugLog('券種選択');
        const seats = yield driver.findElements(webdriver.By.css('.seats li'));
        debugLog(`座席数: ${seats.length}`);
        for (const seat of seats) {
            yield seat.findElement(webdriver.By.tagName('a')).click();
            const tickets = yield driver.findElements(webdriver.By.css('.modal .blue-button'));
            const num = Math.floor(Math.random() * tickets.length);
            debugLog(`券種: ${num}`);
            yield tickets[num]
                .findElement(webdriver.By.tagName('a'))
                .click();
        }
        yield driver
            .findElement(webdriver.By.css('.button-area .next-button button'))
            .click();
        debugLog('次へクリック');
    });
}
/**
 * 購入者情報入力
 */
function input(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        yield driver.findElement(webdriver.By.className('purchase-input'));
        debugLog('購入者情報入力');
        yield driver.findElement(webdriver.By.name('last_name_hira')).clear();
        yield driver.findElement(webdriver.By.name('first_name_hira')).clear();
        yield driver.findElement(webdriver.By.name('mail_addr')).clear();
        yield driver.findElement(webdriver.By.name('mail_confirm')).clear();
        yield driver.findElement(webdriver.By.name('tel_num')).clear();
        debugLog('入力削除');
        yield driver.findElement(webdriver.By.name('last_name_hira')).sendKeys('もーしょん');
        yield driver.findElement(webdriver.By.name('first_name_hira')).sendKeys('ぴくちゃー');
        yield driver.findElement(webdriver.By.name('mail_addr')).sendKeys('hataguchi@motionpicture.jp');
        yield driver.findElement(webdriver.By.name('mail_confirm')).sendKeys('hataguchi@motionpicture.jp');
        yield driver.findElement(webdriver.By.name('tel_num')).sendKeys('0362778824');
        yield driver.findElement(webdriver.By.name('cardno')).sendKeys('4111111111111111');
        yield driver.findElement(webdriver.By.name('credit_year')).sendKeys('2017');
        yield driver.findElement(webdriver.By.name('credit_month')).sendKeys('10');
        yield driver.findElement(webdriver.By.name('securitycode')).sendKeys('123');
        debugLog('入力完了');
        yield driver
            .findElement(webdriver.By.css('.button-area .next-button button'))
            .click();
        debugLog('次へクリック');
    });
}
/**
 * 購入者内容確認
 */
function confirm(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        yield driver.findElement(webdriver.By.css('.purchase-confirm'));
        debugLog('購入者内容確認');
        yield driver.findElement(webdriver.By.css('label[for=notes]')).click();
        yield driver
            .findElement(webdriver.By.css('.purchase-confirm .button-area .next-button button'))
            .click();
        debugLog('次へクリック');
        yield driver.findElement(webdriver.By.css('.purchase-complete'));
        debugLog('購入完了');
        const sleepTime = 5000;
        yield driver.sleep(sleepTime);
    });
}
