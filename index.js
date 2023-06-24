const PORT = process.env.PORT || 8069

const express = require('express')
// const cheerio = require('cheerio')
// const axios = require('axios')
const puppeteer = require('puppeteer')

// const pretty = require('pretty')


const app = express()

const furrorBaseUrl = "https://furorjeans.com"



let saleProducts = []

async function fetchFurrorProducts() {

    const saleProductsSelector = '.CategoryPage-ProductListWrapper > div'
    const productCardSelector = '.ProductCard'
    const titleSelector = '.ProductCard-Content > p.ProductCard-Name'
    const imgSelector = '.ProductCard-FigureReview > figure > div > img'
    const productLinkSelector = 'a'
    const discountPriceSelector = '.ProductPrice span'
    const originalPriceSelector = '.ProductPrice-HighPrice'


    const browser = await puppeteer.launch({
        // headless: false,
        defaultViewport: false,
        userDataDir: "./tmp",
    })

    const page = await browser.newPage()
    await page.goto(`${furrorBaseUrl}/sale`)

    // Wait for the page to fully load and execute JavaScript
    await page.waitForSelector(saleProductsSelector) //list of main sale products
    await page.waitForSelector(productCardSelector)

    const saleProductHandles = await page.$$(productCardSelector);

    console.log(saleProductHandles.length)

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
    //close the browser after fetching all the products
    console.log(saleProducts)
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



app.get('/api/furror', async (req, res) => {
    try {
        await fetchFurrorProducts();
        res.json(saleProducts);
    } catch (error) {
        console.error('Error fetching Furror products:', error);
        res.status(500).json({ error: 'Failed to fetch Furror products' });
    }
})

// // the request will look like this: /api/furror?pages=3

// app.get('/api/furror', async (req, res) => {
//     try {
//         let numPages = 1;
//         if (req.query.pages != null) {
//             numPages = parseInt(req.query.pages);
//             if (isNaN(numPages) || numPages < 1) {
//                 res.status(400).json({ error: 'Invalid number of pages' });
//                 return;
//             }
//         }

//         const totalPages = await getTotalPages();
//         if (totalPages < numPages) {
//             res.status(400).json({ error: `Only ${totalPages} pages available` });
//             return;
//         }

//         saleProducts = [];
//         await fetchFurrorProducts(numPages);
//         res.json(saleProducts);
//     } catch (error) {
//         console.error('Error fetching Furror products:', error);
//         res.status(500).json({ error: 'Failed to fetch Furror products' });
//     }
// });


app.listen(PORT, () => {
    console.log(`server running on ${PORT}`)
})