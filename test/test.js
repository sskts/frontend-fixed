let webdriver = require('selenium-webdriver');

// Input capabilities
let capabilities = {
    'browserstack.user': 'akitohataguchi1',
    'browserstack.key': '91NcdgSQ6KR9vqHP33xp',
    'browserName': 'Chrome',
    'browser_version': '55.0',
    'os': 'Windows',
    'os_version': '10',
    'resolution': '1920x1080',
    'browserstack.debug': true
}

let driver = new webdriver.Builder().
    usingServer('http://hub-cloud.browserstack.com/wd/hub').
    withCapabilities(capabilities).
    build();

//アクセス
driver.get('https://devsasakiticketfrontendprototypewebapp-sasaki-ticket-11.azurewebsites.net/');


performance();
seat();
ticket();
input();
confirm();

driver.quit();

let by = webdriver.By;

//performance
async function performance() {
    console.log('performance');
    await driver.sleep(3000);
    let lists = await driver
        .findElement(by.className('performances'))
        .findElements(by.tagName('li'));
    let num = Math.floor( Math.random() * lists.length - 1 );
    driver
        .findElement(by.className('performances'))
        .findElement(by.xpath(`li[${num}]`))
        .findElement(by.className('blue-button'))
        .findElement(by.tagName('a'))
        .click();
}

//seat
async function seat() {
    console.log('seat');
    await driver.sleep(3000);
    let seats = await driver
        .findElement(by.className('screen'))
        .findElements(by.className('default'));
    let num = Math.floor( Math.random() * seats.length - 1 );
    seats[num].click();
    nextClick();
}

//ticket
async function ticket() {
    console.log('ticket');
    let seats =  await driver
        .findElement(by.className('seats'))
        .findElements(by.tagName('li'));
    for (var i = 0; i < seats.length - 1; i++) {
        seats[i].findElement(by.tagName('a')).click();
        driver
            .findElement(by.className('modal'))
            .findElements(by.className('blue-button'))
            .findElement(by.tagName('a'))
            .click();
    }
    
    nextClick();
}

//enterPurchase
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

//confirm
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