import webdriver = require('selenium-webdriver');

// Input capabilities
let capabilities = {
    // 'browserstack.user': 'akitohataguchi1',
    // 'browserstack.key': '91NcdgSQ6KR9vqHP33xp',
    'browserstack.user': 'tetsuyamazaki1',
    'browserstack.key': 'Ef2optk5kygevGh5muCg',
    'browserName': 'Chrome',
    'browser_version': '55.0',
    'os': 'Windows',
    'os_version': '10',
    'resolution': '1920x1080',
    'browserstack.debug': true
}
//設定
console.log(`
ブラウザ: ${capabilities.browserName} ${capabilities.browser_version}
OS: ${capabilities.os} ${capabilities.os_version}
画面: ${capabilities.resolution}
`);

let driver = new webdriver.Builder()
    .usingServer('http://hub-cloud.browserstack.com/wd/hub')
    .withCapabilities(capabilities)
    .build();

//要素表示待機20秒
console.log('要素表示待機20秒')
driver.manage().timeouts().implicitlyWait(20000);

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
async function performanceSelect(): Promise<void> {
    await driver.findElements(by.css('.performances li'));
    console.log('パフォーマンス一覧');
    let lists = await driver.findElements(by.css('.performances li'));
    let num = Math.floor(Math.random() * lists.length - 1);
    console.log('パフォーマンス' + num);
    await driver
        .findElement(by.css('.performances'))
        .findElement(by.xpath(`li[${num}]`))
        .findElement(by.css('.blue-button a'))
        .click();
}

//座席選択
async function seat(): Promise<void> {
    await driver.findElement(by.className('purchase-seat'));
    console.log('座席選択');
    let defaultSeats = await driver
        .findElement(by.className('screen'))
        .findElements(by.className('default'));
    let count = (defaultSeats.length > 5) ? Math.floor(Math.random() * (5 - 1) + 1) : Math.floor(Math.random() * (defaultSeats.length - 1) + 1);
    console.log(`座席選択数: ${count}`);
    for (let i = 0; i < count; i++) {
        let seats = await driver
            .findElement(by.className('screen'))
            .findElements(by.className('default'));
        let num = Math.floor(Math.random() * seats.length - 1);
        console.log(`座席: ${num}`);
        await seats[num].click();
    }    
    
    await driver
        .findElement(by.className('button-area'))
        .findElement(by.className('next-button'))
        .findElement(by.tagName('button'))
        .click();
    console.log('次へクリック');
}

//券種選択
async function ticket(): Promise<void> {
    await driver.findElement(by.className('purchase-ticket'));
    console.log('券種選択');
    let seats = await driver
        .findElement(by.className('seats'))
        .findElements(by.tagName('li'));
    console.log(`座席数: ${seats.length}`);
    for (var i = 0; i < seats.length; i++) {
        await seats[i].findElement(by.tagName('a')).click();
        await driver.sleep(1000);
        let tickets = await driver
            .findElement(by.className('modal'))
            .findElements(by.className('blue-button'));
        let num = Math.floor(Math.random() * tickets.length - 1);
        console.log(`券種: ${num}`);
        await tickets[num]
            .findElement(by.tagName('a'))
            .click();
        // await driver.sleep(1000);
    }

    await driver
        .findElement(by.className('button-area'))
        .findElement(by.className('next-button'))
        .findElement(by.tagName('button'))
        .click();
    console.log('次へクリック');
}

//購入者情報入力
async function input(): Promise<void> {
    await driver.findElement(by.className('purchase-input'));
    console.log('購入者情報入力');
    await driver.findElement(by.name('last_name_hira')).clear();
    await driver.findElement(by.name('first_name_hira')).clear();
    await driver.findElement(by.name('mail_addr')).clear();
    await driver.findElement(by.name('mail_confirm')).clear();
    await driver.findElement(by.name('tel_num')).clear();
    console.log('入力削除');
    await driver.findElement(by.name('last_name_hira')).sendKeys('もーしょん');
    await driver.findElement(by.name('first_name_hira')).sendKeys('ぴくちゃー');
    await driver.findElement(by.name('mail_addr')).sendKeys('hataguchi@motionpicture.jp');
    await driver.findElement(by.name('mail_confirm')).sendKeys('hataguchi@motionpicture.jp');
    await driver.findElement(by.name('tel_num')).sendKeys('0362778824');
    await driver.findElement(by.name('agree')).click();
    await driver.findElement(by.name('cardno')).sendKeys('4111111111111111');
    await driver.findElement(by.name('credit_year')).sendKeys('2017');
    await driver.findElement(by.name('credit_month')).sendKeys('10');
    await driver.findElement(by.name('securitycode')).sendKeys('123');
    console.log('入力完了');
    await driver
        .findElement(by.className('button-area'))
        .findElement(by.className('next-button'))
        .findElement(by.tagName('button'))
        .click();
    console.log('次へクリック');
}

//購入者内容確認
async function confirm(): Promise<void> {
    await driver.findElement(by.className('purchase-confirm'));
    console.log('購入者内容確認');
    await driver
        .findElement(by.className('purchase-confirm'))
        .findElement(by.className('button-area'))
        .findElement(by.className('next-button'))
        .findElement(by.tagName('button'))
        .click();
    console.log('次へクリック');
}




