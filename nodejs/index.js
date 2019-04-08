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

    get_image_list(self, depth=10){
        let image_list = {}
        let self = this
        try{
            self.setup()
            // # Load whole page
            self.load_more(depth)
            // # The image tags we need to worry about
            let img_elements = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "article"))
            )
            img_elements = img_elements.find_elements_by_tag_name('a')
            // # image_list = [img.get_attribute('src') for img in img_elements]
            img_elements.forEach((img, key)=>{
                const img_img = img.find_elements_by_tag_name('img')
                if(len(img_img) > 0){
                    const link = img.get_attribute('href')
                    const src = img_img[0].get_attribute('src')
                    image_list[link] = src
                }
            })
        } finally{
            self.driver.quit()
        }
        return image_list
    }
}