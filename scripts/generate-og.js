import fs from 'fs';
import path from 'path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { html } from 'satori-html';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontsDir = path.join(__dirname, '../assets/fonts');

async function downloadFont(url, filepath) {
  if (fs.existsSync(filepath)) return fs.readFileSync(filepath);
  
  console.log(`Downloading font from ${url}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch font: ${res.statusText}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, buffer);
  return buffer;
}

async function main() {
  try {
    // 1. Download or load fonts
    const fontUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/tajawal/Tajawal-Bold.ttf';
    const fontData = await downloadFont(fontUrl, path.join(fontsDir, 'Tajawal-Bold.ttf'));

    // 2. Define the design using satori-html
    const markup = html`
      <div style="width: 1200px; height: 630px; display: flex; flex-direction: column; align-items: center; justify-content: center; background-image: linear-gradient(to bottom, #051937, #020B18); position: relative; overflow: hidden; font-family: 'Tajawal', sans-serif; direction: rtl;">
        
        <!-- Sparkles -->
        <div style="position: absolute; top: 15%; left: 20%; color: #E8B54D; opacity: 0.2; font-size: 30px;">✦</div>
        <div style="position: absolute; top: 25%; right: 15%; color: #E8B54D; opacity: 0.15; font-size: 20px;">✦</div>
        <div style="position: absolute; bottom: 30%; left: 10%; color: #E8B54D; opacity: 0.2; font-size: 25px;">✦</div>
        <div style="position: absolute; bottom: 20%; right: 25%; color: #E8B54D; opacity: 0.1; font-size: 35px;">✦</div>
        <div style="position: absolute; top: 50%; left: 5%; color: #E8B54D; opacity: 0.1; font-size: 15px;">✦</div>
        <div style="position: absolute; top: 60%; right: 5%; color: #E8B54D; opacity: 0.15; font-size: 22px;">✦</div>

        <!-- Content Wrapper -->
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: -60px;">
          
          <!-- Circular Seal -->
          <div style="width: 110px; height: 110px; border-radius: 50%; border: 2px solid #E8B54D; display: flex; justify-content: center; align-items: center; margin-bottom: 30px; background-color: rgba(232, 181, 77, 0.03);">
            <svg viewBox="0 0 24 24" style="width: 50px; height: 50px;" fill="none" stroke="#E8B54D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 14v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4"></path>
              <path d="M4 14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2 0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2z"></path>
              <path d="M12 12V8"></path>
              <path d="M12 8c-.6 0-1-.6-1-1.2 0-.8 1-1.8 1-1.8s1 1 1 1.8c0 .6-.4 1.2-1 1.2z" fill="rgba(232, 181, 77, 0.3)"></path>
            </svg>
          </div>

          <!-- Headline -->
          <div style="font-size: 84px; font-weight: 700; color: #FBF3E7; margin-bottom: 20px; line-height: 1;">
            تهنئة عيد ميلاد فاخرة
          </div>
          
          <!-- Tagline -->
          <div style="font-size: 32px; font-weight: 700; color: #BFD6F5;">
            احتفل بلحظة مميزة... بطريقة لا تُنسى
          </div>
          
        </div>

        <!-- Footer Strip -->
        <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 90px; display: flex; justify-content: space-between; align-items: center; padding: 0 50px; border-top: 1px solid rgba(124, 147, 176, 0.2); background-color: rgba(2, 11, 24, 0.8);">
          <div style="font-size: 20px; color: #7C93B0;">
            أنشئ تهنئتك التفاعلية الآن — كيك، شموع، وموسيقى في ثوانٍ
          </div>
          <div style="font-size: 16px; color: rgba(124, 147, 176, 0.5); direction: ltr;">
            birthdayweb-ae7a4.web.app
          </div>
        </div>
        
      </div>
    `;

    // 3. Render SVG with Satori
    const svg = await satori(markup, {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Tajawal',
          data: fontData,
          weight: 700,
          style: 'normal',
        }
      ],
    });

    // 4. Convert SVG to PNG using resvg-js
    const resvg = new Resvg(svg, {
      background: '#051937',
      fitTo: {
        mode: 'width',
        value: 1200,
      },
    });
    
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    // 5. Save PNG
    const outPath = path.join(__dirname, '../public/og-image.png');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, pngBuffer);
    
    console.log(`Success! OG Image generated at: ${outPath}`);
  } catch (error) {
    console.error('Error generating OG Image:', error);
    process.exit(1);
  }
}

main();
