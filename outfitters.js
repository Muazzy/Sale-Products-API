const puppeteer = require('puppeteer')
const priceFormatter = require('./price_formatter')
require("dotenv").config()


const puppeteerLaunchArgs = {
    // headless: false,
    defaultViewport: false,
    args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
    ],
    executablePath:
        process.env.NODE_ENV === "production"
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : puppeteer.executablePath(),
    headless: false
}

//SELECTORS
const saleProductsGridSelector = '#product-grid'
const saleProductSelector = '.grid__item'

const titleSelector = '.card__heading a.product-link-main'
const originalPriceSelector = '.price__sale .price-item--regular .money'
const discountPriceSelector = '.price__sale .price-item--sale .money'
const imgSelector = '.card__media .media img.motion-reduce.image-second'
const productLinkSelector = 'a.product-link-main'


//BASE URL's
const outfittersBaseUrl = 'https://outfitters.com.pk'
const salePath = '/collections/men-early-summer-sale'
//for product image
const imgBaseUrl = 'https:'

async function fetchOutfittersProducts(requiredProducts) {

    try {
        let saleProducts = []

        const browser = await puppeteer.launch(puppeteerLaunchArgs)
        const page = await browser.newPage()

        page.setDefaultNavigationTimeout(0) //this will set the navigation timeout to infinite. i.e it will wait for navigation as long as its needed

        await page.goto(`${outfittersBaseUrl}${salePath}`)

        let previousHeight = 0.0

        while (requiredProducts > saleProducts.length) {
            // Wait for the page to fully load and execute JavaScript
            await page.waitForSelector(saleProductsGridSelector, { timeout: 1000 * 60 }) //list of main sale products
            await page.waitForSelector(saleProductSelector, { timeout: 1000 * 60 })
            await page.waitForSelector('a', { timeout: 1000 * 60 })


            const saleProductHandles = await page.$$(saleProductSelector)

            // if()

            console.log('total products found on page', saleProductHandles.length)

            for (const saleProduct of saleProductHandles) {

                //setting default values of each product in case if something goes wrong
                let title = ""
                let originalPrice = ""
                let img = ""
                let discountPrice = ""
                let productLink = ""

                try {
                    title = await page.evaluate(
                        (el, selector) => el.querySelector(selector).getAttribute("aria-label"),
                        saleProduct,
                        titleSelector
                    );

                    img = await page.evaluate(
                        (el, selector, baseUrl) => baseUrl + el.querySelector(selector).getAttribute("src"),
                        saleProduct,
                        imgSelector,
                        imgBaseUrl
                    );

                    productLink = await page.evaluate(
                        (el, selector, baseUrl) => baseUrl + el.querySelector(selector).getAttribute("href"),
                        saleProduct,
                        productLinkSelector,
                        outfittersBaseUrl
                    );

                    discountPrice = await page.evaluate(
                        (el, selector) => el.querySelector(selector).textContent,
                        saleProduct,
                        discountPriceSelector
                    );

                    originalPrice = await page.evaluate(
                        (el, selector) => el.querySelector(selector).textContent,
                        saleProduct,
                        originalPriceSelector
                    );
                } catch (error) {
                    console.error('error is', error) //ignore the errors that occur due to these for now.
                }

                if (title.length != 0 && img.length != 0 && productLink.length != 0 && discountPrice.length != 0 && originalPrice.length != 0) {
                    //FORMATTING
                    originalPrice = priceFormatter(originalPrice)
                    discountPrice = priceFormatter(discountPrice)
                    title = title.toUpperCase()
                    img = img.split('?')[0] //this will split the string in two parts whereever it sees a '?' symbol and we are only intreseted in the first one so.

                    saleProducts.push({
                        title, img, productLink, originalPrice, discountPrice
                    })
                }

                saleProducts = saleProducts.filter((item, index, self) =>
                    index === self.findIndex((t) => t.productLink === item.productLink)
                );

                if (saleProducts.length >= requiredProducts) {
                    break;
                }
            }

            //PAGINATION/NAVIGATION LOGIC FOR INFINITE SCROLL
            previousHeight = await page.evaluate("document.body.scrollHeight");
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
            await page.waitForFunction(
                `document.body.scrollHeight > ${previousHeight}`
            );

            // Wait for the page to fully load and execute JavaScript
            await page.waitForSelector(saleProductsGridSelector, { timeout: 1000 * 60 }) //list of main sale products
            await page.waitForSelector(saleProductSelector, { timeout: 1000 * 60 })
            await page.waitForSelector('a', { timeout: 1000 * 60 })


            const currentProductsCount = (await page.$$(saleProductSelector)).length;

            //compares the current product count (i.e after navigation to bottom) to the old product count. (product count refers to sale products found on the page)
            if (currentProductsCount === saleProductHandles.length) {
                break;
            }
        }

        console.log(saleProducts.length)
        // close the browser after fetching all the products
        await browser.close()
        //finally return the products
        return saleProducts
    } catch (error) {
        console.error('Error fetching Outfitters products:', error)
        throw error; // Rethrow the error to be handled by the caller. i.e in the api route
    }

}

module.exports = fetchOutfittersProducts