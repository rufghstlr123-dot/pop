import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:3001');
  
  await new Promise(r => setTimeout(r, 2000));
  
  const content = await page.content();
  console.log("Found items?", content.includes("총 0건") || content.includes("대여자"));
  
  await browser.close();
})();
