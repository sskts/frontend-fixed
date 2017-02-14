"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const webdriver = require("selenium-webdriver");
let width = 1920;
let height = 1080;
// Input capabilities
let capabilities = {
    // 'browserstack.user': 'akitohataguchi1',
    // 'browserstack.key': '91NcdgSQ6KR9vqHP33xp',
    'browserstack.user': 'tetsuyamazaki2',
    'browserstack.key': 'mguKp7EvNcdzPiyJi7yp',
    'browserName': 'Chrome',
    'browser_version': '55.0',
    'os': 'Windows',
    'os_version': '10',
    'resolution': `${width}x${height}`,
    'browserstack.debug': true
};
//設定
console.log(`-------------------
ブラウザ: ${capabilities.browserName} ${capabilities.browser_version}
OS: ${capabilities.os} ${capabilities.os_version}
画面: ${capabilities.resolution}
-------------------`);
test().then(() => {
    console.log('DONE');
}, (err) => {
    console.log(err);
});
//test
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('テスト開始-----------------------------------');
        let driver = new webdriver.Builder()
            .usingServer('http://hub-cloud.browserstack.com/wd/hub')
            .withCapabilities(capabilities)
            .build();
        let url = 'https://devsasakiticketfrontendprototypewebapp-sasaki-ticket-11.azurewebsites.net/';
        //要素表示待機10秒
        driver.manage().timeouts().implicitlyWait(10000);
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
        console.log('テスト終了-----------------------------------');
    });
}
//パフォーマンス一覧
function performanceSelect(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        yield driver.findElements(webdriver.By.css('.performances li'));
        console.log('パフォーマンス一覧');
        let lists = yield driver.findElements(webdriver.By.css('.performances li'));
        let num = Math.floor(Math.random() * lists.length);
        console.log('パフォーマンス' + num);
        let performances = yield driver.findElements(webdriver.By.css('.performances li'));
        yield performances[num]
            .findElement(webdriver.By.css('.blue-button a'))
            .click();
        console.log('次へクリック');
    });
}
//座席選択
function seat(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        yield driver.findElement(webdriver.By.css('.purchase-seat'));
        console.log('座席選択');
        let defaultSeats = yield driver.findElements(webdriver.By.css('.screen .seat .default'));
        let count = (defaultSeats.length > 5) ? Math.floor(Math.random() * (5 - 1) + 1) : Math.floor(Math.random() * defaultSeats.length);
        console.log(`座席選択数: ${count}`);
        for (let i = 0; i < count; i++) {
            let seats = yield driver.findElements(webdriver.By.css('.screen .seat .default'));
            let num = Math.floor(Math.random() * seats.length);
            console.log(`座席: ${num}`);
            yield seats[num].click();
        }
        yield driver.findElement(webdriver.By.css('label[for=agree]')).click();
        yield driver
            .findElement(webdriver.By.css('.button-area .next-button button'))
            .click();
        console.log('次へクリック');
    });
}
//券種選択
function ticket(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        yield driver.findElement(webdriver.By.className('purchase-ticket'));
        console.log('券種選択');
        let seats = yield driver.findElements(webdriver.By.css('.seats li'));
        console.log(`座席数: ${seats.length}`);
        for (let i = 0; i < seats.length; i++) {
            yield seats[i].findElement(webdriver.By.tagName('a')).click();
            let tickets = yield driver.findElements(webdriver.By.css('.modal .blue-button'));
            let num = Math.floor(Math.random() * tickets.length);
            console.log(`券種: ${num}`);
            yield tickets[num]
                .findElement(webdriver.By.tagName('a'))
                .click();
        }
        yield driver
            .findElement(webdriver.By.css('.button-area .next-button button'))
            .click();
        console.log('次へクリック');
    });
}
//購入者情報入力
function input(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        yield driver.findElement(webdriver.By.className('purchase-input'));
        console.log('購入者情報入力');
        yield driver.findElement(webdriver.By.name('last_name_hira')).clear();
        yield driver.findElement(webdriver.By.name('first_name_hira')).clear();
        yield driver.findElement(webdriver.By.name('mail_addr')).clear();
        yield driver.findElement(webdriver.By.name('mail_confirm')).clear();
        yield driver.findElement(webdriver.By.name('tel_num')).clear();
        console.log('入力削除');
        yield driver.findElement(webdriver.By.name('last_name_hira')).sendKeys('もーしょん');
        yield driver.findElement(webdriver.By.name('first_name_hira')).sendKeys('ぴくちゃー');
        yield driver.findElement(webdriver.By.name('mail_addr')).sendKeys('hataguchi@motionpicture.jp');
        yield driver.findElement(webdriver.By.name('mail_confirm')).sendKeys('hataguchi@motionpicture.jp');
        yield driver.findElement(webdriver.By.name('tel_num')).sendKeys('0362778824');
        yield driver.findElement(webdriver.By.name('cardno')).sendKeys('4111111111111111');
        yield driver.findElement(webdriver.By.name('credit_year')).sendKeys('2017');
        yield driver.findElement(webdriver.By.name('credit_month')).sendKeys('10');
        yield driver.findElement(webdriver.By.name('securitycode')).sendKeys('123');
        console.log('入力完了');
        yield driver
            .findElement(webdriver.By.css('.button-area .next-button button'))
            .click();
        console.log('次へクリック');
    });
}
//購入者内容確認
function confirm(driver) {
    return __awaiter(this, void 0, void 0, function* () {
        yield driver.findElement(webdriver.By.css('.purchase-confirm'));
        console.log('購入者内容確認');
        yield driver.findElement(webdriver.By.css('label[for=notes]')).click();
        yield driver
            .findElement(webdriver.By.css('.purchase-confirm .button-area .next-button button'))
            .click();
        console.log('次へクリック');
        yield driver.findElement(webdriver.By.css('.purchase-complete'));
        console.log('購入完了');
        yield driver.sleep(5000);
    });
}
