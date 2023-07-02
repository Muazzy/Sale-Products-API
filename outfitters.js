const puppeteer = require('puppeteer')
const priceFormatter = require('./price_formatter')
require("dotenv").config()


const puppeteerLaunchArgs = {
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
    headless: true
}

//SELECTORS
const saleProductsGridSelector = process.env.OUTFITTERS_SALE_PRODUCTS_GRID_SELECTOR
const saleProductSelector = process.env.OUTFITTERS_SALE_PRODUCT_SELECTOR

const titleSelector = process.env.OUTFITTERS_TITLE_SELECTOR
const originalPriceSelector = process.env.OUTFITTERS_ORIGINAL_PRICE_SELECTOR
const discountPriceSelector = process.env.OUTFITTERS_DISCOUNT_PRICE_SELECTOR
const imgSelector = process.env.OUTFITTERS_IMG_SELECTOR
const productLinkSelector = process.env.OUTFITTERS_PRODUCT_LINK_SELECTOR

//BASE URL's
const outfittersBaseUrl = 'https://outfitters.com.pk'
const salePath = '/collections/men-early-summer-sale'
//for product image
const imgBaseUrl = 'https:'



/**
 * The function fetchOutfittersProducts is an asynchronous function that uses Puppeteer to scrape a
 * website and fetch a specified number of sale products from the Outfitters website.
 * @param requiredProducts - The `requiredProducts` parameter is the number of products that you want
 * to fetch from the Outfitters website. The function will continue fetching products until it reaches
 * the specified number of products or until there are no more products available on the website.
 * @returns an array of sale products from the Outfitters website.
 */
async function fetchOutfittersProducts(requiredProducts) {
    try {
        let saleProducts = []

        const browser = await puppeteer.launch(puppeteerLaunchArgs)
        const page = await browser.newPage()

        page.setDefaultNavigationTimeout(0) //this will set the navigation timeout to infinite. i.e it will wait for navigation as long as its needed
        page.setDefaultTimeout(0) //disable the timeout. i.e waitforSelector or anyother timeout will be disabled

        await page.goto(`${outfittersBaseUrl}${salePath}`)

        let previousHeight = 0.0

        while (requiredProducts > saleProducts.length) {
            // Wait for the page to fully load and execute JavaScript
            await page.waitForSelector(saleProductsGridSelector) //list of main sale products
            await page.waitForSelector(saleProductSelector)
            await page.waitForSelector('a')


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
            //TODO: fix the issue where on navigating quickly to the bottom of page do not trigger the page to load products sometimes
            //PAGINATION/NAVIGATION LOGIC FOR INFINITE SCROLL
            previousHeight = await page.evaluate("document.body.scrollHeight");
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
            await page.waitForFunction(
                `document.body.scrollHeight > ${previousHeight}`
            );

            // Wait for the page to fully load and execute JavaScript
            await page.waitForSelector(saleProductsGridSelector) //list of main sale products
            await page.waitForSelector(saleProductSelector)
            await page.waitForSelector('a')


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