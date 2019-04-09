const Webdriver = require('selenium-webdriver');
const Until = Webdriver.until;
const By = Webdriver.By;
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
        this.driver.get(this.url)
    }

    setup_chrome(self){
        let chromeCapabilities = Webdriver.Capabilities.chrome();
        // Setting browser to be incognito and headless
        // Remove headless if facing issues
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

    async get_image_list(depth=10){
        return new Promise(async (mainResolve, mainReject)=>{
            let image_list = {}
            let waitForIt = false
            let self = this
            try{
                self.setup()
                async function fetcher() {
                    return new Promise((resolve, reject)=>{
                        // # Load whole page
                        self.load_more(depth)
                        // # The image tags we need to worry about
                        let img_elements = self.driver.wait(Until.elementLocated(By.css("article")), 10000)
                        img_elements.then((img_elements)=>{
                            img_elements = img_elements.findElements(By.css('a'))
                            img_elements.then((img_elements)=>{
                                // # image_list = [img.get_attribute('src') for img in img_elements]
                                const image_count = img_elements.length;
                                img_elements.forEach((img, key)=>{
                                    img.findElements(By.css('img')).then(async (img_img)=>{
                                        if(img_img.length > 0){
                                            const link = await img.getAttribute('href')
                                            const src = await img_img[0].getAttribute('src')
                                            image_list[link] = src
                                        }
                                        if(image_count == Object.keys(image_list).length){
                                            console.log(image_list)
                                            resolve(image_list)
                                        }
                                    })
                                })
                            }).catch(err=>reject)
                        }).catch(err=>reject)
                    })
                }
                await fetcher()
            } catch(err){
                console.log(err)
            } finally{
                self.driver.quit()
            }
            mainResolve(image_list)
        })
    }
    
    load_more(depth=null, mainResolve=null){
        let self = this
        const callback = (resolve) => {
            if(depth == 0){
                return
            }
            self.driver.executeScript("window.scrollTo(0, document.body.scrollHeight);")
            try{
                // # Wait for the loading spinner to arrive
                self.driver.wait(Until.elementLocated(By.css("svg")), 10000).then(()=>{
                    // # Wait for it to go away
                    let intervalTimer = setInterval(() => {
                        self.driver.findElement(By.css('svg')).then((svg_found)=>{
                            if(!svg_found || svg_found.length == 0){
                                clearInterval(intervalTimer)
                                if(depth != null){
                                    depth -= 1
                                    console.log("Scrolls remaining: {}".format(depth))
                                }
                                self.load_more(depth)
                            }
                        })
                        
                    }, 1000);
                })
            } catch(e){
                console.error(e)
            }
        }
        if(mainResolve==null){
            return new Promise((resolve, reject) => {
                callback(resolve)
            })
        } else {
            callback(mainResolve)
        }
    }
}

let iid = new InstagramImageDownloader('a_geologist')
iid.get_image_list(10).then((data)=>{
    console.log(data)
})