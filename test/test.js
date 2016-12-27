var webdriver = require('selenium-webdriver');

// Input capabilities
var capabilities = {
    'browserstack.user': 'akitohataguchi1',
    'browserstack.key': '91NcdgSQ6KR9vqHP33xp',
    'browserName': 'Chrome',
    'browser_version': '55.0',
    'os': 'Windows',
    'os_version': '10',
    'resolution': '1920x1080',
    'browserstack.debug': true
}

var driver = new webdriver.Builder().
    usingServer('http://hub-cloud.browserstack.com/wd/hub').
    withCapabilities(capabilities).
    build();

//アクセス
driver.get('https://devsasakiticketfrontendprototypewebapp.azurewebsites.net/');


performance();
seatSelect();
ticketTypeSelect();
enterPurchase();
confirm();

driver.quit();



//performance
function performance() {
    console.log('performance');
    driver.findElement(webdriver.By.className('blue-button'))
        .findElement(webdriver.By.tagName('a'))
        .click();
}

//seatSelect
function seatSelect() {
    console.log('seatSelect');
    driver.findElement(webdriver.By.className('screen'))
        .findElement(webdriver.By.className('seat'))
        .findElement(webdriver.By.tagName('a'))
        .click();
    nextClick();
}

//ticketTypeSelect
function ticketTypeSelect() {
    console.log('ticketTypeSelect');
    driver.findElement(webdriver.By.className('seats'))
        .findElement(webdriver.By.className('blue-button'))
        .findElement(webdriver.By.tagName('a'))
        .click();
    driver.findElement(webdriver.By.className('modal'))
        .findElement(webdriver.By.className('blue-button'))
        .findElement(webdriver.By.tagName('a'))
        .click();
    nextClick();
}

//enterPurchase
function enterPurchase() {
    console.log('enterPurchase');
    driver.findElement(webdriver.By.name('last_name_kanji')).clear();
    driver.findElement(webdriver.By.name('first_name_kanji')).clear();
    driver.findElement(webdriver.By.name('last_name_hira')).clear();
    driver.findElement(webdriver.By.name('first_name_hira')).clear();
    driver.findElement(webdriver.By.name('mail')).clear();
    driver.findElement(webdriver.By.name('mail_confirm')).clear();
    driver.findElement(webdriver.By.name('tel')).clear();

    driver.findElement(webdriver.By.name('last_name_kanji')).sendKeys('モーション');
    driver.findElement(webdriver.By.name('first_name_kanji')).sendKeys('ピクチャー');
    driver.findElement(webdriver.By.name('last_name_hira')).sendKeys('もーしょん');
    driver.findElement(webdriver.By.name('first_name_hira')).sendKeys('ぴくちゃー');
    driver.findElement(webdriver.By.name('mail')).sendKeys('hataguchi@motionpicture.jp');
    driver.findElement(webdriver.By.name('mail_confirm')).sendKeys('hataguchi@motionpicture.jp');
    driver.findElement(webdriver.By.name('tel')).sendKeys('0362778824');
    driver.findElement(webdriver.By.name('cardno')).sendKeys('4111111111111111');
    driver.findElement(webdriver.By.name('credit_year')).sendKeys('2017');
    driver.findElement(webdriver.By.name('credit_month')).sendKeys('10');
    driver.findElement(webdriver.By.name('holdername')).sendKeys('TEST TEST');
    driver.findElement(webdriver.By.name('securitycode')).sendKeys('123');
    nextClick();
}

//confirm
function confirm() {
    console.log('confirm');
    nextClick();
}

function nextClick() {
    driver.findElement(webdriver.By.className('button-area'))
        .findElement(webdriver.By.className('next-button'))
        .findElement(webdriver.By.tagName('button'))
        .click();
}