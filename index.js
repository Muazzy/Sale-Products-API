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
    const titleSelector = '.ProductCard-Content > p'
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

    for (const saleProduct of saleProductHandles) {

        //setting default values of each product in case if something goes wrong
        let title = ""
        let originalPrice = ""
        let img = ""
        let discountPrice = ""
        let productLink = ""

        try {
            title = await page.evaluate(
                (el, selector) => el.querySelector(selector)?.innerHTML || '',
                saleProduct,
                titleSelector
            );

            img = await page.evaluate(
                (el, selector) => el.querySelector(selector)?.getAttribute("src") || '',
                saleProduct,
                imgSelector
            );

            productLink = await page.evaluate(
                (el, selector, baseUrl) => baseUrl + el.querySelector(selector)?.getAttribute("href") || '',
                saleProduct,
                productLinkSelector,
                furrorBaseUrl
            );

            discountPrice = await page.evaluate(
                (el, selector) => el.querySelector(selector)?.textContent || '',
                saleProduct,
                discountPriceSelector
            );

            originalPrice = await page.evaluate(
                (el, selector) => el.querySelector(selector)?.textContent || '',
                saleProduct,
                originalPriceSelector
            );


        } catch (error) {
            console.error(error)
        }

        if (title.length != 0 && img.length != 0 && productLink.length != 0 && discountPrice.length != 0 && originalPrice.length != 0) {
            saleProducts.push({
                title, img, productLink, originalPrice, discountPrice
            })
        }
    }
    //close the browser after fetching all the products
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

app.listen(PORT, () => {
    console.log(`server running on ${PORT}`)
})





// async function fetchFurrorProducts() {

//     const saleProductsSelector = '.CategoryPage-ProductListWrapper > div'
//     const productCardSelector = '.ProductCard'

//     const titleSelector = '.ProductCard-Content > p'
//     const imgSelector = '.ProductCard-FigureReview > figure > div > img'
//     const productLinkSelector = 'a'

//     const discountPriceSelector = '.ProductPrice span'
//     const originalPriceSelector = '.ProductPrice-HighPrice'


//     const browser = await puppeteer.launch({
//         // headless: false,
//         defaultViewport: false,
//         userDataDir: "./tmp",
//     })

//     const page = await browser.newPage()
//     await page.goto(`${furrorBaseUrl}/sale`)

//     // Wait for the page to fully load and execute JavaScript
//     await page.waitForSelector('.CategoryPage-ProductListWrapper > div') //list of main sale products
//     await page.waitForSelector('.ProductCard')

//     const saleProductHandles = await page.$$(".ProductCard");

//     // console.log(saleProductHandles.length)

//     for (const saleProduct of saleProductHandles) {

//         //setting default values of each product in case if something goes wrong
//         let title = ""
//         let originalPrice = ""
//         let img = ""
//         let discountPrice = ""
//         let productLink = ""

//         try {
//             title = await page.evaluate(
//                 (el) => el.querySelector(".ProductCard-Content > p").innerHTML, saleProduct
//             );
//             img = await page.evaluate(
//                 (el) => el.querySelector(".ProductCard-FigureReview > figure > div > img").getAttribute("src"), saleProduct
//             );

//             productLink = await page.evaluate(
//                 (el) => el.querySelector("a").getAttribute("href"), saleProduct
//             );
//             productLink = furrorBaseUrl + productLink  // adding the base url

//             discountPrice = await page.evaluate(
//                 (el) => el.querySelector(".ProductPrice span").textContent, saleProduct
//             );

//             originalPrice = await page.evaluate(
//                 (el) => el.querySelector(".ProductPrice-HighPrice").textContent, saleProduct
//             );

//         } catch (error) {
//             console.error(error)
//         }

//         // try {
//         //     img = await page.evaluate(
//         //         (el) => el.querySelector(".ProductCard-FigureReview > figure > div > img").getAttribute("src"), saleProduct
//         //     );
//         // } catch (error) {

//         // }

//         // try {
//         //     productLink = await page.evaluate(
//         //         (el) => el.querySelector("a").getAttribute("href"), saleProduct
//         //     );
//         //     productLink = furrorBaseUrl + productLink
//         // } catch (error) {

//         // }

//         // try {
//         //     discountPrice = await page.evaluate(
//         //         (el) => el.querySelector(".ProductPrice span").textContent, saleProduct
//         //     );
//         // } catch (error) {

//         // }


//         // try {
//         //     originalPrice = await page.evaluate(
//         //         (el) => el.querySelector(".ProductPrice-HighPrice").textContent, saleProduct
//         //     );
//         // } catch (error) {

//         // }

//         if (title.length != 0 && img.length != 0 && productLink.length != 0 && discountPrice.length != 0 && originalPrice.length != 0) {
//             // console.log("title", title)
//             // console.log("img", img)
//             // console.log("link", productLink)
//             // console.log("discount price", discountPrice)
//             // console.log("original price", originalPrice)

//             saleProducts.push({
//                 title, img, productLink, originalPrice, discountPrice
//             })
//         }
//     }
//     // console.log(saleProducts)
// }