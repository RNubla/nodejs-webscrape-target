const puppeteer = require('puppeteer-extra')
const fs = require('fs')

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

// puppeteer usage as normal
puppeteer.launch({
    headless: true, args: ['--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"']
}).then(async browser => {
    console.log('Running tests..')
    const page = await browser.newPage()
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36")
    await page.setViewport({ width: 1920, height: 1080 })
    // await page.goto('https://www.target.com/c/unlocked-cell-phones-electronics/-/N-5xte3', { waitUntil: 'networkidle2'})
    await page.goto('https://www.target.com/c/laptops-computers-office-electronics/-/N-5xtf4?lnk=Laptops', { waitUntil: 'networkidle2'})

    const autoscroll = page =>
        page.evaluate(
            async () =>
            await new Promise((resolve, reject) => {
                let totalHeight = 0;
                let distance = 100;
                let timer = setInterval(() => {
                    let scrollHeight = document.body.scrollHeight
                    window.scrollBy(0, distance);
                    totalHeight += distance
                    if(totalHeight >= scrollHeight){
                        clearInterval(timer)
                        resolve()
                    }
                }, 300)
            })
        )
        await autoscroll(page)

    // await page.waitFor(5000)

    // const title = await page.body.querySelector('.Link-sc-1khjl8b-0').textContent;
    // const title = await page.evaluate(() => {
    //     return document.querySelectorAll('[data-test="product-title"').textContent
    // })

    // const price = await page.evaluate(() => {
    //     return document.querySelectorAll('[data-test="product-price"]').textContent
    // })

    const product = await page.evaluate(() => {
        let products = []
        // let imgSrc = document.querySelectorAll('.Images__FadePrimaryOnHover-sc-1gcxa3z-0 cplQpb')
        let titles = document.querySelectorAll('[data-test="product-title"')
        let prices = document.querySelectorAll('[data-test="product-price"]')

        if(titles.length == prices.length){
            for (i = 0; i < titles.length; i++){
                products.push({
                    'title': titles[i].textContent,
                    'price' : prices[i].textContent
                    // 'img': imgSrc[i].textContent
                })
            }
        }
        return {
            products
        }
    })


    console.log(product)
    storeData(product, 'results.json')
    // console.log({title, price})
    // await page.waitForNavigation({ waitUntil: 'networkidle0' })
    // await page.screenshot({ path: 'testresult.png', fullPage: true })
    await browser.close()
    console.log(`All done, check the screenshot. ✨`)
})

const storeData = (data, path) => {
    try {
        fs.writeFileSync(path, JSON.stringify(data))
    } catch (error) {
        console.log(error)
    }
}