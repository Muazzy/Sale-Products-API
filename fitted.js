const axios = require('axios')
const cheerio = require('cheerio')
const priceFormatter = require('./price_formatter')

const fittedBaseUrl = 'https://fittedshop.com/category/sale'

const saleProductSelector = '.product-singleArea'

const titleSelector = '.product-title a'
const imgSelector = '.product-img img'
const originalPriceSelector = '.product-pd .product-price'
const discountPriceSelector = '.product-pd .product-discount'
const productLinkSelector = '.product-title a'


async function fetchFittedProducts() {
    try {
        const response = await axios.get(fittedBaseUrl);
        const $ = cheerio.load(response.data);
        const saleProducts = [];

        $(saleProductSelector).each((index, element) => {
            let title = "";
            let img = "";
            let originalPrice = "";
            let discountPrice = "";
            let productLink = "";

            try {
                title = $(element).find(titleSelector).text();
                img = $(element).find(imgSelector).attr('data-src');
                originalPrice = $(element).find(originalPriceSelector).text().trim();
                discountPrice = $(element).find(discountPriceSelector).prev().text().trim();
                productLink = $(element).find(productLinkSelector).attr('href');
            } catch (e) {
                console.error('Error parsing product data:', e);
            }

            if (
                title.length !== 0 &&
                img.length !== 0 &&
                productLink.length !== 0 &&
                discountPrice.length !== 0 &&
                originalPrice.length !== 0
            ) {
                originalPrice = priceFormatter(originalPrice)
                discountPrice = priceFormatter(discountPrice)

                saleProducts.push({
                    title,
                    img,
                    productLink,
                    originalPrice,
                    discountPrice,
                });
            }
        });

        return saleProducts;
    } catch (error) {
        console.error('Error fetching Fitted products:', error);
        throw error; // Rethrow the error to be handled by the caller. i.e in the router
    }
}


module.exports = fetchFittedProducts