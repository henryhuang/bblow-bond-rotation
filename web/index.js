const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');
const {username, password, userTitle} = require('../.user_config.json')

class SessionLoader {

    async run () {
        chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());
        let driver = await new Builder().forBrowser('chrome').build();
        let session = null;
        try {
            await driver.get('https://www.jisilu.cn/account/login/');
            await driver.findElement(By.id('aw-login-user-name')).sendKeys(username);
            await driver.findElement(By.id('aw-login-user-password')).sendKeys(password);
            await driver.findElement(By.id('agreement_chk')).click();
            await driver.findElement(By.id('login_submit')).click();
            const userNameSelector = By.css('#user_menu > span');
            await driver.wait(until.elementTextIs(driver.wait(until.elementLocated(userNameSelector)), userTitle), 10000);
            const cookies = await driver.manage().getCookies();
            const selected = []
            cookies.forEach(cookie => {
                if (cookie.domain.indexOf('.jisilu.cn') > -1) {
                    selected.push(`${cookie.name}=${cookie.value}`)
                }
            })
            session = selected.join(";")
        } finally {
            await driver.quit();
        }
        return session;
    }
}

module.exports = SessionLoader;
