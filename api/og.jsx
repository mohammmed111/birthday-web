import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract a name if we want to make it dynamic later
    // e.g. /api/og?name=سارة
    const name = searchParams.get('name');
    
    // Default text
    const titleText = name ? `تهنئة عيد ميلاد لـ ${name}` : 'تهنئة عيد ميلاد فاخرة';

    // We fetch the Arabic font Amiri from Google Fonts
    // You would typically host this file or fetch it at runtime
    const fontResponse = await fetch(
      new URL('https://fonts.googleapis.com/css2?family=Amiri:wght@700&display=swap')
    );
    // Note: To use custom fonts in @vercel/og perfectly, you fetch the .ttf file.
    // For brevity, we assume the default sans-serif will fallback, or you load the font buffer:
    /*
    const fontData = await fetch(new URL('https://github.com/googlefonts/amiri/raw/main/fonts/ttf/Amiri-Bold.ttf')).then((res) => res.arrayBuffer());
    */

    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#051937',
            backgroundImage: 'linear-gradient(to bottom, #051937, #020B18)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Background Elements (Sparkles) */}
          <div
            style={{
              position: 'absolute',
              top: '20%',
              left: '15%',
              color: '#E8B54D',
              opacity: 0.2,
              fontSize: '24px',
            }}
          >✦</div>
          <div
            style={{
              position: 'absolute',
              top: '15%',
              right: '25%',
              color: '#E8B54D',
              opacity: 0.1,
              fontSize: '40px',
            }}
          >✦</div>
          <div
            style={{
              position: 'absolute',
              bottom: '25%',
              left: '30%',
              color: '#E8B54D',
              opacity: 0.15,
              fontSize: '30px',
            }}
          >✦</div>
          <div
            style={{
              position: 'absolute',
              bottom: '35%',
              right: '15%',
              color: '#E8B54D',
              opacity: 0.2,
              fontSize: '20px',
            }}
          >✦</div>

          {/* Content Wrapper */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 10,
              paddingBottom: '20px',
            }}
          >
            {/* Circular Seal / Icon */}
            <div
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                border: '2px solid #E8B54D',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '40px',
                position: 'relative',
                backgroundColor: 'rgba(232, 181, 77, 0.05)',
              }}
            >
              <svg viewBox="0 0 24 24" style={{ width: '50px', height: '50px' }}>
                <path d="M4 14v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4" fill="none" stroke="#E8B54D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2 0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2z" fill="none" stroke="#E8B54D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 12V8" fill="none" stroke="#E8B54D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 8c-.6 0-1-.6-1-1.2 0-.8 1-1.8 1-1.8s1 1 1 1.8c0 .6-.4 1.2-1 1.2z" fill="rgba(232, 181, 77, 0.3)" stroke="#E8B54D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Titles */}
            <h1
              style={{
                fontSize: '84px',
                fontWeight: 700,
                color: '#FBF3E7',
                margin: '0 0 16px 0',
                letterSpacing: '-0.5px',
                textShadow: '0 10px 30px rgba(0,0,0,0.5)',
              }}
            >
              {titleText}
            </h1>
            <h2
              style={{
                fontSize: '32px',
                fontWeight: 400,
                color: '#BFD6F5',
                letterSpacing: '0.5px',
                margin: 0,
              }}
            >
              احتفل بلحظة مميزة... بطريقة لا تُنسى
            </h2>
          </div>

          {/* Footer Strip */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              padding: '30px 50px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(124, 147, 176, 0.2)',
              backgroundColor: 'rgba(2, 11, 24, 0.8)',
            }}
          >
            <div
              style={{
                fontSize: '20px',
                color: '#7C93B0',
                letterSpacing: '0.5px',
              }}
            >
              أنشئ تهنئتك التفاعلية الآن — كيك، شموع، وموسيقى في ثوانٍ
            </div>
            <div
              style={{
                fontSize: '16px',
                color: 'rgba(124, 147, 176, 0.5)',
                letterSpacing: '1px',
              }}
            >
              birthdayweb-ae7a4.web.app
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        // fonts: [
        //   {
        //     name: 'Amiri',
        //     data: fontData,
        //     style: 'normal',
        //   },
        // ],
      }
    );
  } catch (e) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
