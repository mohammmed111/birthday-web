import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1200, height: 630 });
  
  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Playfair+Display:wght@700&family=Noto+Kufi+Arabic:wght@400;700&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          padding: 0;
          width: 1200px;
          height: 630px;
          background-color: #051937;
          background-image: radial-gradient(circle at center, #0a254e 0%, #051937 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: #E8B54D;
          font-family: 'Amiri', 'Playfair Display', serif;
          position: relative;
          overflow: hidden;
        }
        
        .stars {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(2px 2px at 20px 30px, #E8B54D, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 40px 70px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 50px 160px, #E8B54D, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 90px 40px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 130px 80px, #E8B54D, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 160px 120px, #ffffff, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 200px 200px;
          opacity: 0.3;
        }

        .content {
          text-align: center;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .icon {
          font-size: 100px;
          margin-bottom: 20px;
          filter: drop-shadow(0 0 20px rgba(232, 181, 77, 0.4));
        }

        .title {
          font-size: 72px;
          font-weight: 700;
          margin: 0;
          line-height: 1.2;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .title-en {
          font-family: 'Playfair Display', serif;
        }

        .subtitle {
          font-family: 'Noto Kufi Arabic', sans-serif;
          font-size: 36px;
          color: #CBD5E1;
          margin-top: 20px;
          font-weight: 400;
          letter-spacing: 1px;
        }
        
        .glow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(232,181,77,0.15) 0%, rgba(232,181,77,0) 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
        }
      </style>
    </head>
    <body>
      <div class="stars"></div>
      <div class="glow"></div>
      <div class="content">
        <div class="icon">🎂</div>
        <h1 class="title">
          تهنئة عيد ميلاد
          <span style="color: #64748b; font-size: 60px; font-family: sans-serif;">—</span>
          <span class="title-en">Birthday Wishes</span>
        </h1>
        <div class="subtitle">أنشئ تهنئتك الخاصة الآن ✨</div>
      </div>
    </body>
    </html>
  `;
  
  await page.setContent(htmlContent, { waitUntil: 'networkidle2' });
  // Wait a little extra to ensure fonts are applied
  await new Promise(resolve => setTimeout(resolve, 2000));
  await page.screenshot({ path: 'public/og-image.png' });
  
  await browser.close();
  console.log('OG Image generated successfully!');
})();
