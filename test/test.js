var webdriver = require('selenium-webdriver');

// Input capabilities
var capabilities = {
  'browserName' : 'firefox', 
  'browserstack.user' : 'akitohataguchi1',
  'browserstack.key' : '91NcdgSQ6KR9vqHP33xp',
  'browserstack.debug': true
}

var driver = new webdriver.Builder().
  usingServer('http://hub-cloud.browserstack.com/wd/hub').
  withCapabilities(capabilities).
  build();

driver.get('http://www.google.com');
driver.findElement(webdriver.By.name('q')).sendKeys('BrowserStack');
driver.findElement(webdriver.By.name('btnG')).click();

driver.getTitle().then(function(title) {
  console.log(title);
});

driver.quit();