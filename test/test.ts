import webdriver = require('selenium-webdriver');
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
}
//設定
console.log(`-------------------
ブラウザ: ${capabilities.browserName} ${capabilities.browser_version}
OS: ${capabilities.os} ${capabilities.os_version}
画面: ${capabilities.resolution}
-------------------`);








test().then(() => {
    console.log('DONE')
}, (err) => {
    console.log(err)
});


//test
async function test(): Promise<void> {
    console.log('テスト開始-----------------------------------')
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
    await driver.get(url);
    //各ページ処理
    await performanceSelect(driver);
    await seat(driver);
    await ticket(driver);
    await input(driver);
    await confirm(driver);
    driver.quit();
    console.log('テスト終了-----------------------------------')
}



//パフォーマンス一覧
async function performanceSelect(driver: webdriver.WebDriver): Promise<void> {
    await driver.findElements(webdriver.By.css('.performances li'));
    console.log('パフォーマンス一覧');
    let lists = await driver.findElements(webdriver.By.css('.performances li'));
    let num = Math.floor(Math.random() * lists.length);
    console.log('パフォーマンス' + num);
    let performances = await driver.findElements(webdriver.By.css('.performances li'))
    await performances[num]
        .findElement(webdriver.By.css('.blue-button a'))
        .click();
    console.log('次へクリック');
}

//座席選択
async function seat(driver: webdriver.WebDriver): Promise<void> {
    await driver.findElement(webdriver.By.css('.purchase-seat'));
    console.log('座席選択');
    let defaultSeats = await driver.findElements(webdriver.By.css('.screen .seat .default'));
    let count = (defaultSeats.length > 5) ? Math.floor(Math.random() * (5 - 1) + 1) : Math.floor(Math.random() * defaultSeats.length);
    console.log(`座席選択数: ${count}`);
    for (let i = 0; i < count; i++) {
        let seats = await driver.findElements(webdriver.By.css('.screen .seat .default'));
        let num = Math.floor(Math.random() * seats.length);
        console.log(`座席: ${num}`);
        await seats[num].click();
    }
    await driver.findElement(webdriver.By.css('label[for=agree]')).click();
    await driver
        .findElement(webdriver.By.css('.button-area .next-button button'))
        .click();
    console.log('次へクリック');
}

//券種選択
async function ticket(driver: webdriver.WebDriver): Promise<void> {
    await driver.findElement(webdriver.By.className('purchase-ticket'));
    console.log('券種選択');
    let seats = await driver.findElements(webdriver.By.css('.seats li'));
    console.log(`座席数: ${seats.length}`);
    for (let i = 0; i < seats.length; i++) {
        await seats[i].findElement(webdriver.By.tagName('a')).click();
        let tickets = await driver.findElements(webdriver.By.css('.modal .blue-button'));
        let num = Math.floor(Math.random() * tickets.length);
        console.log(`券種: ${num}`);
        await tickets[num]
            .findElement(webdriver.By.tagName('a'))
            .click();
    }

    await driver
        .findElement(webdriver.By.css('.button-area .next-button button'))
        .click();
    console.log('次へクリック');
}

//購入者情報入力
async function input(driver: webdriver.WebDriver): Promise<void> {
    await driver.findElement(webdriver.By.className('purchase-input'));
    console.log('購入者情報入力');
    await driver.findElement(webdriver.By.name('last_name_hira')).clear();
    await driver.findElement(webdriver.By.name('first_name_hira')).clear();
    await driver.findElement(webdriver.By.name('mail_addr')).clear();
    await driver.findElement(webdriver.By.name('mail_confirm')).clear();
    await driver.findElement(webdriver.By.name('tel_num')).clear();
    
    console.log('入力削除');
    await driver.findElement(webdriver.By.name('last_name_hira')).sendKeys('もーしょん');
    await driver.findElement(webdriver.By.name('first_name_hira')).sendKeys('ぴくちゃー');
    await driver.findElement(webdriver.By.name('mail_addr')).sendKeys('hataguchi@motionpicture.jp');
    await driver.findElement(webdriver.By.name('mail_confirm')).sendKeys('hataguchi@motionpicture.jp');
    await driver.findElement(webdriver.By.name('tel_num')).sendKeys('0362778824');
    await driver.findElement(webdriver.By.name('cardno')).sendKeys('4111111111111111');
    await driver.findElement(webdriver.By.name('credit_year')).sendKeys('2017');
    await driver.findElement(webdriver.By.name('credit_month')).sendKeys('10');
    await driver.findElement(webdriver.By.name('securitycode')).sendKeys('123');
    console.log('入力完了');
    await driver
        .findElement(webdriver.By.css('.button-area .next-button button'))
        .click();
    console.log('次へクリック');
}

//購入者内容確認
async function confirm(driver: webdriver.WebDriver): Promise<void> {
    await driver.findElement(webdriver.By.css('.purchase-confirm'));
    console.log('購入者内容確認');
    await driver.findElement(webdriver.By.css('label[for=notes]')).click();
    await driver
        .findElement(webdriver.By.css('.purchase-confirm .button-area .next-button button'))
        .click();
    console.log('次へクリック');
    await driver.findElement(webdriver.By.css('.purchase-complete'));
    console.log('購入完了');
    await driver.sleep(5000);
}




