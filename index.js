const PORT = process.env.PORT || 8069

const express = require('express')
const puppeteer = require('puppeteer')



const app = express()

const furrorBaseUrl = "https://furorjeans.com"



let saleProducts = []


async function getTotalPages(requiredPages) {

    //if the required pages are less then we dont need to check further to the end

    const navButtonsListSelector = '.ProductList > nav > ul.CategoryPagination > li.CategoryPagination-ListItem'
    const nextButton = navButtonsListSelector + ":last-child"


    const browser = await puppeteer.launch({
        // headless: false,
        defaultViewport: false,
        userDataDir: "./tmp",
    })

    const page = await browser.newPage()
    await page.goto(`${furrorBaseUrl}/sale`)

    let totalPages = 1


    while (true) {
        await page.waitForSelector(navButtonsListSelector)
        await page.waitForSelector(nextButton)
        await page.waitForSelector('a')

        //will click next button (i.e, the last button in the list) until it got no anchor tag inside it
        const isNextPageAvailable = await page.$eval(nextButton, (button) => {
            return button.querySelector('a') !== null
        });

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
    return totalPages
}


async function fetchFurrorProducts(numOfPages) {

    const saleProductsSelector = '.CategoryPage-ProductListWrapper > div'
    const productCardSelector = '.ProductCard'
    const titleSelector = '.ProductCard-Content > p.ProductCard-Name'
    const imgSelector = '.ProductCard-FigureReview > figure > div > img'
    const productLinkSelector = 'a'
    const discountPriceSelector = '.ProductPrice span'
    const originalPriceSelector = '.ProductPrice-HighPrice'

    const navButtonsListSelector = '.ProductList > nav > ul.CategoryPagination > li.CategoryPagination-ListItem' // for the next button
    const nextButton = navButtonsListSelector + ":last-child"

    const browser = await puppeteer.launch({
        // headless: false,
        defaultViewport: false,
        userDataDir: "./tmp",
    })

    const page = await browser.newPage()
    await page.goto(`${furrorBaseUrl}/sale`)

    let currentPage = 1

    while (currentPage <= numOfPages) {
        console.log('currentPage is ', currentPage)
        // Wait for the page to fully load and execute JavaScript
        await page.waitForSelector(saleProductsSelector) //list of main sale products
        await page.waitForSelector(productCardSelector)

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
}




app.get('/', (req, res) => {
    res.json("Sale Products APIProductCard. Developed with ❤️ by Meer M. Muazzam")
})

app.get('/api', (req, res) => {
    res.json({
        'paths': {
            1: "furror",
            2: "outfitters",
        },
        'author': 'Meer M. Muazzam',
        'version': '1.0.0'
    })
})




// the request will look like this: /api/furror?pages=3
app.get('/api/furror', async (req, res) => {
    try {
        let numPages = 1;
        if (req.query.pages != null) {
            numPages = parseInt(req.query.pages);
            if (isNaN(numPages) || numPages < 1) {
                res.status(400).json({ error: 'Invalid number of pages' });
                return;
            }
        }

        const totalPages = await getTotalPages(numPages);
        if (totalPages < numPages) {
            res.status(400).json({ error: `Only ${totalPages} pages available` });
            return;
        }

        saleProducts = [] //reset the products
        await fetchFurrorProducts(numPages);
        res.json(saleProducts);
    } catch (error) {
        console.error('Error fetching Furror products:', error);
        res.status(500).json({ error: 'Failed to fetch Furror products' });
    }
});


app.listen(PORT, () => {
    console.log(`server running on ${PORT}`)
})