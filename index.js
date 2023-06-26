const PORT = process.env.PORT || 8069

const express = require('express')
const furror = require('./furor')
const fetchFittedProducts = require('./fitted')

const app = express()



app.get('/', (req, res) => {
    res.json("Sale Products APIProductCard. Developed with ❤️ by Meer M. Muazzam")
})

app.get('/api', (req, res) => {
    res.json({
        'paths': {
            1: "/api/furror",
            2: "/api/fitted",
        },
        'author': 'Muazzam Soomro',
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



app.listen(PORT, () => {
    console.log(`server running on ${PORT}`)
})