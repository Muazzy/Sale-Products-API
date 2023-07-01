const PORT = process.env.PORT || 8060

const express = require('express')
const furror = require('./furor')
const fetchFittedProducts = require('./fitted')
const fetchOutfitterProducts = require('./outfitters')

const app = express()



app.get('/', (req, res) => {
    res.json("Welcom to Sale Products API, Developed with ❤️ by Meer M. Muazzam")
})

app.get('/api', (req, res) => {
    res.json({
        'paths': {
            1: { 'path': "https://sale-products-api.onrender.com/api/furror", 'optional query': "pages (number, pages > 0)", 'example': 'https://sale-products-api.onrender.com/api/furror?pages=2', },
            2: { 'path': "https://sale-products-api.onrender.com/api/fitted", 'optional query': "", 'example': 'https://sale-products-api.onrender.com/api/fitted', },
            3: { 'path': "https://sale-products-api.onrender.com/api/outfitters", 'optional query': "products (number, products > 0)", 'example': 'https://sale-products-api.onrender.com/api/outfitters?products=20', },
        },
        'author': 'Meer M. Muazzam',
        'version': '1.0.0'
    })
})


// the request will look like this: /api/furror?pages=3
app.get('/api/furror', async (req, res) => {
    try {
        let saleProducts = []
        let numPages = 1 //default number of pages

        if (req.query.pages != null) {
            numPages = parseInt(req.query.pages)
            if (isNaN(numPages) || numPages < 1) {
                res.status(400).json({ error: 'Invalid number of pages' })
                return;
            }
        }

        const totalPages = await furror.getTotalFurrorPages(numPages)
        if (totalPages < numPages) {
            res.status(400).json({ error: `Only ${totalPages} pages available` })
            return;
        }

        saleProducts = await furror.fetchFurrorProducts(numPages)
        res.json(saleProducts)

    } catch (error) {
        console.error('Error fetching Furror products:', error);
        res.status(500).json({ error: 'Failed to fetch Furror products' });
    }
});


app.get('/api/fitted', async (req, res) => {
    try {
        const saleProducts = await fetchFittedProducts();
        res.json(saleProducts);
    } catch (error) {
        console.error('Error fetching Fitted products:', error);
        res.status(500).json({ error: 'Failed to fetch Fitted products' });
    }
});

// the request will look like this: /api/outfitters?products=20
app.get('/api/outfitters', async (req, res) => {
    try {
        let saleProducts = []
        let requiredProducts = 10 //default number of products

        if (req.query.products != null) {
            requiredProducts = parseInt(req.query.products)
            if (isNaN(requiredProducts) || requiredProducts < 1) {
                res.status(400).json({ error: 'Invalid number of products' })
                return;
            }
        }

        saleProducts = await fetchOutfitterProducts(requiredProducts)
        res.json(saleProducts)

    }
    catch (error) {
        console.error('Error fetching Outfitters products:', error)
        res.status(500).json({ error: 'Failed to fetch Outfitters products' })
    }
});


app.listen(PORT, () => {
    console.log(`server running on ${PORT}`)
})