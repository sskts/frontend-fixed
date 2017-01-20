var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let webdriver = require('selenium-webdriver');
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
}, () => {
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
        console.log('performance');
        yield driver.sleep(3000);
        let lists = yield driver
            .findElement(by.className('performances'))
            .findElements(by.tagName('li'));
        let num = Math.floor(Math.random() * lists.length - 1);
        console.log(num);
        driver
            .findElement(by.className('performances'))
            .findElement(by.xpath(`li[${num}]`))
            .findElement(by.className('blue-button'))
            .findElement(by.tagName('a'))
            .click();
    });
}
function seat() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('seat');
        yield driver.sleep(3000);
        let seats = yield driver
            .findElement(by.className('screen'))
            .findElements(by.className('default'));
        let num = Math.floor(Math.random() * seats.length - 1);
        console.log(num);
        seats[num].click();
        nextClick();
    });
}
function ticket() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('ticket');
        let seats = yield driver
            .findElement(by.className('seats'))
            .findElements(by.tagName('li'));
        for (var i = 0; i < seats.length - 1; i++) {
            seats[i].findElement(by.tagName('a')).click();
            let tickets = driver
                .findElement(by.className('modal'))
                .findElements(by.className('blue-button'));
            let num = Math.floor(Math.random() * tickets.length - 1);
            console.log(num);
            tickets[num]
                .findElement(by.tagName('a'))
                .click();
        }
        nextClick();
    });
}
function input() {
    console.log('input');
    driver.findElement(by.name('last_name_hira')).clear();
    driver.findElement(by.name('first_name_hira')).clear();
    driver.findElement(by.name('mail')).clear();
    driver.findElement(by.name('mail_confirm')).clear();
    driver.findElement(by.name('tel')).clear();
    driver.findElement(by.name('last_name_kanji')).sendKeys('モーション');
    driver.findElement(by.name('first_name_kanji')).sendKeys('ピクチャー');
    driver.findElement(by.name('last_name_hira')).sendKeys('もーしょん');
    driver.findElement(by.name('first_name_hira')).sendKeys('ぴくちゃー');
    driver.findElement(by.name('mail')).sendKeys('hataguchi@motionpicture.jp');
    driver.findElement(by.name('mail_confirm')).sendKeys('hataguchi@motionpicture.jp');
    driver.findElement(by.name('tel')).sendKeys('0362778824');
    driver.findElement(by.name('cardno')).sendKeys('4111111111111111');
    driver.findElement(by.name('credit_year')).sendKeys('2017');
    driver.findElement(by.name('credit_month')).sendKeys('10');
    driver.findElement(by.name('securitycode')).sendKeys('123');
    nextClick();
}
function confirm() {
    console.log('confirm');
    nextClick();
}
function nextClick() {
    driver.findElement(by.className('button-area'))
        .findElement(by.className('next-button'))
        .findElement(by.tagName('button'))
        .click();
}
