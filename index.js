//###############################
// STOCKTWIT SCRAPER FOR GABRIEL
//###############################

const fs = require('fs');
const puppeteer = require('puppeteer');

function extractItems() {
    //This method does data extraction. Can change/apply logic here for data extraction
    const extractedElements = document.querySelectorAll('span.UserProfileLink__container___2JY3s, span.MessageStreamView__sentiment___11GoB ,a.MessageStreamView__created-at___HsSv2');
    const items = [];
    for (let element of extractedElements) {
        items.push(element.innerText);
    }
    return items;
}

async function scrapeInfiniteScrollItems(
    page,
    extractItems,
    itemTargetCount,
    scrollDelay = 5000,
) {
    let items = [];
    try {
        let previousHeight;
        while (items.length < itemTargetCount) {
            items = await page.evaluate(extractItems);

            //Logs the amount of data collected thus far
            console.log(items.length);
            previousHeight = await page.evaluate('document.body.scrollHeight');
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');

            //Set time out to be 15 minutes (hopefully enough haha)
            await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`,{timeout:900000});
            await page.waitFor(scrollDelay);
        }
    } catch(e) { 
        console.log(e) 
        //Log the error for debugging
    }
    
    return items;
}

(async () => {
    // Set up browser and page.
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    page.setViewport({ width: 1280, height: 926 });

    // Navigate to the page. Off timeout for slower internet connection
    await page.goto('https://stocktwits.com/symbol/BTC.X',{timeout:0});

    // Scroll and extract items from the page. Last argument denotes how many data is needed. Agar agar hor haha
    const items = await scrapeInfiniteScrollItems(page, extractItems, 1000000000000);

    // Save extracted items to a file. Change \n to any other delimiter if you want.
    //Change file name for different extension if needed
    fs.writeFileSync('./gab.csv', items.join('\n'));

    // Close the browser.
    await browser.close();
})();