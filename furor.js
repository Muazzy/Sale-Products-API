const puppeteer = require('puppeteer')
const priceFormatter = require('./price_formatter')
require("dotenv").config()

// BASE URL's
const furrorBaseUrl = "https://furorjeans.com"
const salePath = "/sale"

// SELECTORS
const saleProductsSelector = process.env.FURROR_SALE_PRODUCTS_SELECTOR
const productCardSelector = process.env.FURROR_PRODUCT_CARD_SELECTOR
const titleSelector = process.env.FURROR_TITLE_SELECTOR
const imgSelector = process.env.FURROR_IMG_SELECTOR
const productLinkSelector = process.env.FURROR_PRODUCT_LINK_SELECTOR
const discountPriceSelector = process.env.FURROR_DISCOUNT_PRICE_SELECTOR
const originalPriceSelector = process.env.FURROR_ORIGINAL_PRICE_SELECTOR
//for the pagination (navigation)
const navButtonsListSelector = process.env.FURROR_NAV_BUTTONS_SELECTOR // for the next button
const nextButton = navButtonsListSelector + ":last-child"


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

/**
 * The function `fetchFurrorProducts` uses Puppeteer to scrape a website and fetches sale products from
 * multiple pages.
 * @param numOfPages - The `numOfPages` parameter is the number of pages you want to fetch products
 * from. It determines how many times the code will navigate to the next page and fetch products.
 * @returns The function `fetchFurrorProducts` returns a promise that resolves to an array of sale
 * products.
 */
async function fetchFurrorProducts(numOfPages) {
    try {
        let saleProducts = []

        const browser = await puppeteer.launch(puppeteerLaunchArgs)

        const page = await browser.newPage()

        page.setDefaultNavigationTimeout(0) //this will set the navigation timeout to infinite. i.e it will wait for navigation as long as its needed
        page.setDefaultTimeout(0) //disable the timeout. i.e waitforSelector or anyother timeout will be disabled

        await page.goto(`${furrorBaseUrl}${salePath}`)

        let currentPage = 1

        while (currentPage <= numOfPages) {
            console.log('currentPage is ', currentPage)
            // Wait for the page to fully load and execute JavaScript
            await page.waitForSelector(saleProductsSelector) //list of main sale products
            await page.waitForSelector(productCardSelector)

            //for the navigation
            await page.waitForSelector(navButtonsListSelector)
            await page.waitForSelector(nextButton)
            await page.waitForSelector('a')


            const saleProductHandles = await page.$$(productCardSelector);

            // console.log(saleProductHandles.length)

            for (const saleProduct of saleProductHandles) {

                //setting default values of each product in case if something goes wrong
                let title = ""
                let originalPrice = ""
                let img = ""
                let discountPrice = ""
                let productLink = ""

                try {
                    title = await page.evaluate(
                        (el, selector) => el.querySelector(selector).innerHTML,
                        saleProduct,
                        titleSelector
                    );
                    // console.log("title", title)
                    img = await page.evaluate(
                        (el, selector) => el.querySelector(selector).getAttribute("src"),
                        saleProduct,
                        imgSelector
                    );
                    // console.log("img", img)


                    productLink = await page.evaluate(
                        (el, selector, baseUrl) => baseUrl + el.querySelector(selector).getAttribute("href"),
                        saleProduct,
                        productLinkSelector,
                        furrorBaseUrl
                    );
                    // console.log("productLink", productLink)

                    discountPrice = await page.evaluate(
                        (el, selector) => el.querySelector(selector).textContent,
                        saleProduct,
                        discountPriceSelector
                    );
                    // console.log("discountPrice", discountPrice)

                    originalPrice = await page.evaluate(
                        (el, selector) => el.querySelector(selector).textContent,
                        saleProduct,
                        originalPriceSelector
                    );
                    // console.log("original price", originalPrice)



                } catch (error) {
                    console.error('error is', error) //ignore the errors that occur due to these now.
                }

                if (title.length != 0 && img.length != 0 && productLink.length != 0 && discountPrice.length != 0 && originalPrice.length != 0) {
                    originalPrice = priceFormatter(originalPrice)
                    discountPrice = priceFormatter(discountPrice)
                    saleProducts.push({
                        title, img, productLink, originalPrice, discountPrice
                    })
                }
            }


            const isNextPageAvailable = await page.$eval(nextButton, (button) => {
                return button.querySelector('a') !== null
            });

            if (isNextPageAvailable && currentPage <= numOfPages) {
                console.log('isNextPageAvailable', isNextPageAvailable)
                await Promise.all([
                    // await page.$eval(nextButton, button =>
                    //     button.querySelector('a').scrollIntoView()
                    // ),
                    await page.$eval(nextButton, button =>
                        button.querySelector('a').click()
                    ),
                    // await page.waitForNavigation(), //not neccessary cuz the page was dynamically navigating or something like that i dont know
                ]);
            }
            else {
                break
            }
            //lastly increment the page
            currentPage++
        }
        console.log(saleProducts)


        // close the browser after fetching all the products
        await browser.close()

        return saleProducts
    } catch (error) {
        console.error('Error fetching Furror products:', error)
        throw error; // Rethrow the error to be handled by the caller. i.e in the api route
    }

}

/**
 * The function `getTotalFurrorPages` uses Puppeteer to navigate through pages and determine the total
 * number of pages on a website called Furror.
 * @param requiredPages - The `requiredPages` parameter is the number of pages that you want to check
 * for a specific condition or perform some action on.
 * @returns the total number of pages required.
 */

async function getTotalFurrorPages(requiredPages) {
    let totalPages = 1

    if (requiredPages === 1) {
        return totalPages
    }

    const browser = await puppeteer.launch(puppeteerLaunchArgs)


    const page = await browser.newPage()
    await page.goto(`${furrorBaseUrl}/sale`)



    while (true) {
        await page.waitForSelector(navButtonsListSelector)
        await page.waitForSelector(nextButton)
        await page.waitForSelector('a')

        //will click next button (i.e, the last button in the list) until it got no anchor tag inside it
        const isNextPageAvailable = await page.$eval(nextButton, (button) => {
            return button.querySelector('a') !== null
        });

        //if the required pages are less then the complete available pages on the website then we dont need to check further
        if (!isNextPageAvailable || requiredPages <= totalPages) {
            await browser.close()
            break
        }

        totalPages = await page.$eval(nextButton, (button) => {
            const href = button.querySelector('a').getAttribute("href");
            const pageNumber = parseInt(href.match(/page=(\d+)/)[1]);
            return pageNumber;
        });

        await page.$eval(nextButton, button =>
            button.querySelector('a').click()
        )
    }
    console.log(totalPages)

    await browser.close()
    return totalPages
}


module.exports = {
    'fetchFurrorProducts': fetchFurrorProducts,
    'getTotalFurrorPages': getTotalFurrorPages,
}