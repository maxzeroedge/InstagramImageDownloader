const Webdriver = require('selenium-webdriver');
const chromedriver = require('chromedriver');
let chrome = require('selenium-webdriver/chrome');
// const firefox = require('selenium-webdriver/firefox');

class InstagramImageDownloader{
    constructor(username, url){
        let self = this
        if(url === undefined){
            self.url = `https://www.instagram.com/${username}/`
        } else {
            self.url = url
        } 
    }

    setup(){
        this.setup_chrome()
    }
    
    setup_chrome(self){
        let chromeCapabilities = webdriver.Capabilities.chrome();
        // Setting browser to be incognito and headless
        let chromeOptions = {
            'args': ['--headless', '--incognito']
        };
        chromeCapabilities.set('chromeOptions', chromeOptions);
        const service = new chrome.ServiceBuilder(chromedriver.path).build();
        chrome.setDefaultService(service);
        this.driver = new Webdriver.Builder()
            .forBrowser('chrome')
            .withCapabilities(chromeCapabilities)
            .build();
    }
        
    setup_firefox(self){
        // TODO: 
        // firefox_options = Options()  
        // firefox_options.add_argument("--headless")  
        // firefox_options.binary_location = FIREFOX_BINARY_LOCATION    

        // self.driver = webdriver.Firefox(executable_path=GECKO_DRIVER_LOCATION, options=firefox_options)  
        // self.driver.get(self.url)
        this.driver = new webdriver.Builder()
            .forBrowser('firefox')
            .setFirefoxOptions(/* ... */)
            .build(); 
    }
}