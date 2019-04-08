import os, requests, time, threading
from selenium import webdriver  
from selenium.webdriver.common.keys import Keys  
from selenium.webdriver.chrome.options import Options 
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

CURR_FOLDER=str(os.sep).join(str(os.path.realpath(__file__)).split(os.sep)[:-1])
CHROME_BINARY_LOCATION="C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
CHROME_DRIVER_LOCATION="D:\\Projects\\Scrapers\\bin\\chromedriver.exe"
FIREFOX_BINARY_LOCATION="C:\\Program Files\\Mozilla Firefox\\firefox.exe"
GECKO_DRIVER_LOCATION="D:\\Projects\\Scrapers\\bin\\geckodriver.exe"

class InstagramImageDownloader:
    def __init__(self, username, url=None):
        if(url == None):
            self.url = 'https://www.instagram.com/{}/'.format(username)
        else:
            self.url = url 

    def setup(self):
        self.setup_chrome()
    
    def setup_chrome(self):
        chrome_options = Options()  
        chrome_options.add_argument("--headless")  
        chrome_options.add_argument("--incognito")  
        chrome_options.binary_location = CHROME_BINARY_LOCATION    

        self.driver = webdriver.Chrome(executable_path=CHROME_DRIVER_LOCATION, options=chrome_options)  
        self.driver.get(self.url) 
        
    def setup_firefox(self):
        firefox_options = Options()  
        firefox_options.add_argument("--headless")  
        firefox_options.binary_location = FIREFOX_BINARY_LOCATION    

        self.driver = webdriver.Firefox(executable_path=GECKO_DRIVER_LOCATION, options=firefox_options)  
        self.driver.get(self.url) 

    def get_image_list(self, depth=10):
        image_list = {}
        try:
            self.setup()
            # Load whole page
            self.load_more(depth)
            # The image tags we need to worry about
            img_elements = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "article"))
            )
            img_elements = img_elements.find_elements_by_tag_name('a')
            # image_list = [img.get_attribute('src') for img in img_elements]
            for img in img_elements:
                img_img = img.find_elements_by_tag_name('img')
                if(len(img_img) > 0):
                    link = img.get_attribute('href')
                    src = img_img[0].get_attribute('src')
                    image_list[link] = src
        finally:
            self.driver.quit()
        return image_list

    def load_more(self, depth=None):
        if depth == 0:
            return
        self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        try:
            # Wait for the loading spinner to arrive
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "svg"))
            )
            # Wait for it to go away
            loaded = True
            time.sleep(2)
            while(not loaded):
                svg_found = self.driver.find_elements_by_tag_name('svg')
                if(len(svg_found) == 0):
                    loaded = True
            if depth != None:
                depth -= 1
                print("Scrolls remaining: {}".format(depth))
            self.load_more(depth)
        finally:
            pass

    @staticmethod
    def download_image(folder, image, name):
        folder = os.path.join(CURR_FOLDER, 'downloads', folder)
        try:
            os.makedirs(folder)
        except:
            pass
        with open(os.path.join(folder, name), 'wb+') as f:
            response = requests.get(image, stream=True)
            if not response.ok:
                print(response)
            for block in response.iter_content(1024):
                if not block:
                    break
                f.write(block)

    def get_actual_image_url(self):
        img_url = ''
        try:
            self.setup()
            img_elements = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "article"))
            )
            img_elements = img_elements.find_elements_by_tag_name('img')
            img_url = img_elements[1].get_attribute('src')
        finally:
            self.driver.quit()
            # pass
        return img_url


if __name__=="__main__":
    print("I need 2 input parameters: username and depth. Say None if you want to download whole profile")
    time_start = time.time()
    username = 'a_geologist'
    iid = InstagramImageDownloader(username)
    print("Getting URLs")
    img_list = iid.get_image_list(10)
    print("Got {} Images".format(len(img_list.keys())))
    print("Downloading Thumbnails")
    for img in img_list.values():
        InstagramImageDownloader.download_image(os.path.join('thumbnails', username), img, img.split("?")[0].split("/")[::-1][0])
    img_list_new = []
    print("Downloading Images from {} pages".format(len(img_list.keys())))
    thread_list = []
    for img_page in img_list.keys():
        iid = InstagramImageDownloader(username, img_page)
        # img_list_new.append(iid.get_actual_image_url())
        img = iid.get_actual_image_url()
        thread_list.append(threading.Thread(target=InstagramImageDownloader.download_image, args=(os.path.join('full', username), img, img.split("?")[0].split("/")[::-1][0])))
        # InstagramImageDownloader.download_image(os.path.join('full', username), img, img.split("?")[0].split("/")[::-1][0])
    
    while len(thread_list) > 0:
        for i in range(0, 8):
            thread_list.pop().start()

    time_end = time.time()
    print("Ran for {} seconds", str(time_end - time_start))