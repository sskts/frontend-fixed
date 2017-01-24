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
let capabilities = {
    'browserstack.user': 'akitohataguchi1',
    'browserstack.key': '91NcdgSQ6KR9vqHP33xp',
    'browserName': 'Chrome',
    'browser_version': '55.0',
    'os': 'Windows',
    'os_version': '10',
    'resolution': '1920x1080',
    'browserstack.debug': true
};
let driver = new webdriver.Builder()
    .usingServer('http://hub-cloud.browserstack.com/wd/hub')
    .withCapabilities(capabilities)
    .build();
driver.get('https://devsasakiticketfrontendprototypewebapp-sasaki-ticket-11.azurewebsites.net/');
let by = webdriver.By;
main().then(() => {
    driver.quit();
    console.log('done');
}, (err) => {
    console.log(err);
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield performanceSelect();
        yield seat();
        yield ticket();
        yield input();
        yield confirm();
    });
}
function performanceSelect() {
    return __awaiter(this, void 0, void 0, function* () {
        yield driver.sleep(1000);
        console.log('パフォーマンス一覧');
        let lists = yield driver
            .findElement(by.className('performances'))
            .findElements(by.tagName('li'));
        let num = Math.floor(Math.random() * lists.length - 1);
        console.log('パフォーマンス' + num);
        yield driver
            .findElement(by.className('performances'))
            .findElement(by.xpath(`li[${num}]`))
            .findElement(by.className('blue-button'))
            .findElement(by.tagName('a'))
            .click();
    });
}
function seat() {
    return __awaiter(this, void 0, void 0, function* () {
        yield driver.sleep(1000);
        console.log('座席選択');
        yield driver.sleep(3000);
        let seats = yield driver
            .findElement(by.className('screen'))
            .findElements(by.className('default'));
        let num = Math.floor(Math.random() * seats.length - 1);
        console.log('座席選択' + num);
        yield seats[num].click();
        yield nextClick();
    });
}
function ticket() {
    return __awaiter(this, void 0, void 0, function* () {
        yield driver.sleep(3000);
        console.log('券種選択');
        let seats = yield driver
            .findElement(by.className('seats'))
            .findElements(by.tagName('li'));
        console.log('券種選択' + seats.length + '個');
        for (var i = 0; i < seats.length; i++) {
            yield seats[i].findElement(by.tagName('a')).click();
            let tickets = yield driver
                .findElement(by.className('modal'))
                .findElements(by.className('blue-button'));
            let num = Math.floor(Math.random() * tickets.length - 1);
            console.log('券種選択' + num);
            yield tickets[num]
                .findElement(by.tagName('a'))
                .click();
        }
        yield nextClick();
    });
}
function input() {
    return __awaiter(this, void 0, void 0, function* () {
        yield driver.sleep(1000);
        console.log('購入者情報入力');
        yield driver.findElement(by.name('last_name_hira')).clear();
        yield driver.findElement(by.name('first_name_hira')).clear();
        yield driver.findElement(by.name('mail')).clear();
        yield driver.findElement(by.name('mail_confirm')).clear();
        yield driver.findElement(by.name('tel')).clear();
        yield driver.findElement(by.name('last_name_hira')).sendKeys('もーしょん');
        yield driver.findElement(by.name('first_name_hira')).sendKeys('ぴくちゃー');
        yield driver.findElement(by.name('mail')).sendKeys('hataguchi@motionpicture.jp');
        yield driver.findElement(by.name('mail_confirm')).sendKeys('hataguchi@motionpicture.jp');
        yield driver.findElement(by.name('tel')).sendKeys('0362778824');
        yield driver.findElement(by.name('agree')).click();
        yield driver.findElement(by.name('cardno')).sendKeys('4111111111111111');
        yield driver.findElement(by.name('credit_year')).sendKeys('2017');
        yield driver.findElement(by.name('credit_month')).sendKeys('10');
        yield driver.findElement(by.name('securitycode')).sendKeys('123');
        yield nextClick();
    });
}
function confirm() {
    return __awaiter(this, void 0, void 0, function* () {
        yield driver.sleep(1000);
        console.log('購入者内容確認');
        yield nextClick();
    });
}
function nextClick() {
    driver.findElement(by.className('button-area'))
        .findElement(by.className('next-button'))
        .findElement(by.tagName('button'))
        .click();
}
