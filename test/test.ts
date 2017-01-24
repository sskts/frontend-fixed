import webdriver = require('selenium-webdriver');

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

let driver = new webdriver.Builder()
    .usingServer('http://hub-cloud.browserstack.com/wd/hub')
    .withCapabilities(capabilities)
    .build();

//アクセス
driver.get('https://devsasakiticketfrontendprototypewebapp-sasaki-ticket-11.azurewebsites.net/');
// driver.get('https://192.168.138.31:8080/');

let by = webdriver.By;

main().then(() => {
    driver.quit();
    console.log('done')
}, (err) => {
    console.log(err)
});


//main
async function main() {
    await performanceSelect();
    await seat();
    await ticket();
    await input();
    await confirm();
}

//パフォーマンス一覧
async function performanceSelect() {
    await driver.sleep(1000);
    console.log('パフォーマンス一覧');
    let lists = await driver
        .findElement(by.className('performances'))
        .findElements(by.tagName('li'));
    let num = Math.floor(Math.random() * lists.length - 1);
    console.log('パフォーマンス' + num);
    await driver
        .findElement(by.className('performances'))
        .findElement(by.xpath(`li[${num}]`))
        .findElement(by.className('blue-button'))
        .findElement(by.tagName('a'))
        .click();
}

//座席選択
async function seat() {
    await driver.sleep(1000);
    console.log('座席選択');
    await driver.sleep(3000);
    let seats = await driver
        .findElement(by.className('screen'))
        .findElements(by.className('default'));
    let num = Math.floor(Math.random() * seats.length - 1);
    console.log('座席選択' + num);
    await seats[num].click();
    await nextClick();
}

//券種選択
async function ticket() {
    await driver.sleep(3000);
    console.log('券種選択');
    let seats = await driver
        .findElement(by.className('seats'))
        .findElements(by.tagName('li'));
    console.log('券種選択' + seats.length + '個');
    for (var i = 0; i < seats.length; i++) {
        await seats[i].findElement(by.tagName('a')).click();
        let tickets = await driver
            .findElement(by.className('modal'))
            .findElements(by.className('blue-button'));
        let num = Math.floor(Math.random() * tickets.length - 1);
        console.log('券種選択' + num);
        await tickets[num]
            .findElement(by.tagName('a'))
            .click();
    }
    
    await nextClick();
}

//購入者情報入力
async function input() {
    await driver.sleep(1000);
    console.log('購入者情報入力');
    await driver.findElement(by.name('last_name_hira')).clear();
    await driver.findElement(by.name('first_name_hira')).clear();
    await driver.findElement(by.name('mail')).clear();
    await driver.findElement(by.name('mail_confirm')).clear();
    await driver.findElement(by.name('tel')).clear();

    await driver.findElement(by.name('last_name_hira')).sendKeys('もーしょん');
    await driver.findElement(by.name('first_name_hira')).sendKeys('ぴくちゃー');
    await driver.findElement(by.name('mail')).sendKeys('hataguchi@motionpicture.jp');
    await driver.findElement(by.name('mail_confirm')).sendKeys('hataguchi@motionpicture.jp');
    await driver.findElement(by.name('tel')).sendKeys('0362778824');
    await driver.findElement(by.name('agree')).click();
    await driver.findElement(by.name('cardno')).sendKeys('4111111111111111');
    await driver.findElement(by.name('credit_year')).sendKeys('2017');
    await driver.findElement(by.name('credit_month')).sendKeys('10');
    await driver.findElement(by.name('securitycode')).sendKeys('123');
    await nextClick();
}

//購入者内容確認
async function confirm() {
    await driver.sleep(1000);
    console.log('購入者内容確認');
    await nextClick();
}

function nextClick() {
    driver.findElement(by.className('button-area'))
        .findElement(by.className('next-button'))
        .findElement(by.tagName('button'))
        .click();
}


