const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Fetching Indian channels & logos from iptv-org API...');
  const [channelsRes, logosRes] = await Promise.all([
    fetch('https://iptv-org.github.io/api/channels.json').then(r => r.json()),
    fetch('https://iptv-org.github.io/api/logos.json').then(r => r.json())
  ]);

  const logoMap = new Map();
  for (const l of logosRes) {
    if (l.channel && l.url) {
      logoMap.set(l.channel, l.url);
    }
  }

  // Build name-to-logo map from 1560 Indian channels
  const inChannels = channelsRes.filter(c => (c.country || '').toUpperCase() === 'IN');
  const nameToLogo = new Map();

  function norm(str) {
    return (str || '')
      .toLowerCase()
      .replace(/hd\+?|4k|sd|\(\d+p\)|\(\d+i\)|\[.*?\]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }

  for (const ch of inChannels) {
    const l = logoMap.get(ch.id);
    if (l) {
      nameToLogo.set(norm(ch.name), l);
      for (const alt of (ch.alt_names || [])) {
        nameToLogo.set(norm(alt), l);
      }
    }
  }
  console.log(`Loaded ${nameToLogo.size} normalized Indian TV logos!`);

  // Specific curated logos for popular channels
  const CURATED_LOGOS = {
    'suriya-tv': 'https://sund-images.sunnxt.com/202222/300x300_24News_202222_d63feca0-79ae-47ea-b75a-66c17d456f4c.png',
    'sun-tv': 'https://jiotvimages.cdn.jio.com/dare_images/images/Sun_TV.png',
    'sun-tv-hd': 'https://jiotvimages.cdn.jio.com/dare_images/images/Sun_TV_HD.png',
    'sun-surya-hd': 'https://jiotvimages.cdn.jio.com/dare_images/images/Surya_TV_HD.png',
    'surya-tv': 'https://jiotvimages.cdn.jio.com/dare_images/images/Surya_TV.png',
    'suriyan-tv': 'https://jiotvimages.cdn.jio.com/dare_images/images/Suriyan_TV.png',
    'ktv': 'https://jiotvimages.cdn.jio.com/dare_images/images/KTV_HD.png',
    'star-vijay': 'https://jiotvimages.cdn.jio.com/dare_images/images/Star_Vijay_HD.png',
    'vijay-takkar': 'https://jiotvimages.cdn.jio.com/dare_images/images/Vijay_Takkar.png',
    'zee-tamil': 'https://jiotvimages.cdn.jio.com/dare_images/images/Zee_Tamil_HD.png',
    'zee-tamil-hd': 'https://jiotvimages.cdn.jio.com/dare_images/images/Zee_Tamil_HD.png',
    'colors-tamil': 'https://jiotvimages.cdn.jio.com/dare_images/images/Colors_Tamil_HD.png',
    'colors-tamil-hd': 'https://jiotvimages.cdn.jio.com/dare_images/images/Colors_Tamil_HD.png',
    'polimer-tv': 'https://jiotvimages.cdn.jio.com/dare_images/images/Polimer_TV.png',
    'polimer-news': 'https://jiotvimages.cdn.jio.com/dare_images/images/Polimer_News.png',
    'puthiya-thalaimurai': 'https://jiotvimages.cdn.jio.com/dare_images/images/Puthiya_Thalaimurai.png',
    'thanthi-tv': 'https://jiotvimages.cdn.jio.com/dare_images/images/Thanthi_TV.png',
    'thanthi-one': 'https://jiotvimages.cdn.jio.com/dare_images/images/Thanthi_One.png',
    'news-7-tamil': 'https://jiotvimages.cdn.jio.com/dare_images/images/News_7_Tamil.png',
    'news-tamil-24x7': 'https://jiotvimages.cdn.jio.com/dare_images/images/News_Tamil_24x7.png',
    'raj-tv': 'https://jiotvimages.cdn.jio.com/dare_images/images/Raj_TV.png',
    'raj-digital-plus': 'https://jiotvimages.cdn.jio.com/dare_images/images/Raj_Digital_Plus.png',
    'raj-musix-tamil': 'https://jiotvimages.cdn.jio.com/dare_images/images/Raj_Musix_Tamil.png',
    'kalaignar-tv': 'https://jiotvimages.cdn.jio.com/dare_images/images/Kalaignar_TV.png',
    'kalaignar-murasu': 'https://jiotvimages.cdn.jio.com/dare_images/images/Murasu_TV.png',
    'kalaignar-seithigal': 'https://jiotvimages.cdn.jio.com/dare_images/images/Seithigal.png',
    'sirippoli-tv': 'https://jiotvimages.cdn.jio.com/dare_images/images/Sirippoli.png',
    'makkal-tv': 'https://jiotvimages.cdn.jio.com/dare_images/images/Makkal_TV.png',
    'malai-murasu-tv': 'https://jiotvimages.cdn.jio.com/dare_images/images/Malai_Murasu.png',
    'dd-tamil-hd': 'https://jiotvimages.cdn.jio.com/dare_images/images/DD_Podhigai.png',
    'mazhavil-manorama': 'https://jiotvimages.cdn.jio.com/dare_images/images/Mazhavil_Manorama_HD.png',
    'mazhavil-manorama-hd': 'https://jiotvimages.cdn.jio.com/dare_images/images/Mazhavil_Manorama_HD.png',
    'asianet': 'https://jiotvimages.cdn.jio.com/dare_images/images/Asianet_HD.png',
    'asianet-hd': 'https://jiotvimages.cdn.jio.com/dare_images/images/Asianet_HD.png',
    'asianet-news': 'https://jiotvimages.cdn.jio.com/dare_images/images/Asianet_News.png',
    'asianet-movies-hd': 'https://jiotvimages.cdn.jio.com/dare_images/images/Asianet_Movies_HD.png',
    'kairali-tv': 'https://jiotvimages.cdn.jio.com/dare_images/images/Kairali_TV.png',
    'amrita-tv': 'https://jiotvimages.cdn.jio.com/dare_images/images/Amrita_TV.png',
    'manorama-news': 'https://jiotvimages.cdn.jio.com/dare_images/images/Manorama_News.png',
    'mathrubhumi-news': 'https://jiotvimages.cdn.jio.com/dare_images/images/Mathrubhumi_News.png',
    '24-news': 'https://sund-images.sunnxt.com/202222/300x300_24News_202222_d63feca0-79ae-47ea-b75a-66c17d456f4c.png',
    'media-one': 'https://jiotvimages.cdn.jio.com/dare_images/images/Media_One.png',
    'kaumudy-tv': 'https://jiotvimages.cdn.jio.com/dare_images/images/Kaumudy.png',
    'reporter-tv': 'https://jiotvimages.cdn.jio.com/dare_images/images/Reporter_TV.png',
    'janam-tv': 'https://jiotvimages.cdn.jio.com/dare_images/images/Janam_TV.png',
    'jaihind-tv': 'https://jiotvimages.cdn.jio.com/dare_images/images/Jaihind_TV.png',
    'aaj-tak': 'https://jiotvimages.cdn.jio.com/dare_images/images/Aaj_Tak_HD.png',
    'aaj-tak-hd': 'https://jiotvimages.cdn.jio.com/dare_images/images/Aaj_Tak_HD.png',
    'abp-news': 'https://jiotvimages.cdn.jio.com/dare_images/images/ABP_News.png',
    'india-tv': 'https://jiotvimages.cdn.jio.com/dare_images/images/India_TV.png',
    'ndtv-india': 'https://jiotvimages.cdn.jio.com/dare_images/images/NDTV_India.png',
    'ndtv-24x7': 'https://jiotvimages.cdn.jio.com/dare_images/images/NDTV_24x7.png',
    'wion': 'https://jiotvimages.cdn.jio.com/dare_images/images/Wion.png',
    'india-today': 'https://jiotvimages.cdn.jio.com/dare_images/images/India_Today.png',
    'times-now': 'https://jiotvimages.cdn.jio.com/dare_images/images/Times_Now.png',
    'times-now-navbharat': 'https://jiotvimages.cdn.jio.com/dare_images/images/Times_Now_Navbharat_HD.png',
    'republic-bharat': 'https://jiotvimages.cdn.jio.com/dare_images/images/Republic_Bharat.png',
    'republic-tv': 'https://jiotvimages.cdn.jio.com/dare_images/images/Republic_TV.png',
    'star-sports-1': 'https://jiotvimages.cdn.jio.com/dare_images/images/Star_Sports_1_HD.png',
    'star-sports-2': 'https://jiotvimages.cdn.jio.com/dare_images/images/Star_Sports_2_HD.png',
    'sony-sports-ten-1': 'https://jiotvimages.cdn.jio.com/dare_images/images/Sony_Sports_Ten_1_HD.png',
    'sony-sports-ten-2': 'https://jiotvimages.cdn.jio.com/dare_images/images/Sony_Sports_Ten_2_HD.png',
    'cartoon-network': 'https://jiotvimages.cdn.jio.com/dare_images/images/Cartoon_Network_HD.png',
    'discovery-kids': 'https://jiotvimages.cdn.jio.com/dare_images/images/Discovery_Kids.png',
    'discovery-channel': 'https://jiotvimages.cdn.jio.com/dare_images/images/Discovery_HD.png',
    'animal-planet': 'https://jiotvimages.cdn.jio.com/dare_images/images/Animal_Planet_HD.png',
    'national-geographic-hd': 'https://jiotvimages.cdn.jio.com/dare_images/images/National_Geographic_HD.png',
    'star-gold-hd': 'https://jiotvimages.cdn.jio.com/dare_images/images/Star_Gold_HD.png',
    'sony-max-hd': 'https://jiotvimages.cdn.jio.com/dare_images/images/Sony_Max_HD.png',
    'zee-cinema-hd': 'https://jiotvimages.cdn.jio.com/dare_images/images/Zee_Cinema_HD.png',
    '9xm': 'https://jiotvimages.cdn.jio.com/dare_images/images/9XM.png',
    '9x-jalwa': 'https://jiotvimages.cdn.jio.com/dare_images/images/9X_Jalwa.png',
    '9x-tashan': 'https://jiotvimages.cdn.jio.com/dare_images/images/9X_Tashan.png',
    'b4u-music': 'https://jiotvimages.cdn.jio.com/dare_images/images/B4U_Music.png',
    'b4u-movies': 'https://jiotvimages.cdn.jio.com/dare_images/images/B4U_Movies.png',
  };

  // Read all raw CSV lines
  const csvContent = fs.readFileSync('scripts/raw_channels.csv', 'utf8');
  const lines = csvContent.split('\n').filter(l => l.trim().length > 0);

  // Group streams by clean channel name
  const channelGroups = new Map();

  for (const line of lines) {
    const parts = line.split(',');
    if (parts.length < 2) continue;
    const rawName = parts[0].trim();
    const streamUrl = parts.slice(1).join(',').trim();

    if (!streamUrl.startsWith('http')) continue;

    // Clean name: remove (1080p), [Geo-blocked], etc.
    const cleanName = rawName
      .replace(/\s*\(\d+p\)/gi, '')
      .replace(/\s*\(\d+i\)/gi, '')
      .replace(/\s*\[.*?\]/g, '')
      .trim();

    const id = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    if (!channelGroups.has(id)) {
      channelGroups.set(id, {
        id,
        name: cleanName,
        rawName,
        streams: []
      });
    }

    const group = channelGroups.get(id);
    if (!group.streams.includes(streamUrl)) {
      group.streams.push(streamUrl);
    }
  }

  console.log(`Found ${channelGroups.size} unique channel groups from 450 lines.`);

  // Classification helpers
  function detectLanguage(name, urls) {
    const n = name.toLowerCase();
    const u = urls.join(' ').toLowerCase();

    if (n.includes('tamil') || n.includes('suriya') || n.includes('suriyan') || n.includes('kalaignar') || 
        n.includes('polimer') || n.includes('puthiya') || n.includes('thanthi') || n.includes('makkal') || 
        n.includes('malai murasu') || n.includes('vijay') || n.includes('isai aruvi') || n.includes('sirippoli') ||
        n.includes('dheeran') || n.includes('vaanavil') || n.includes('vasanth') || n.includes('vendhar') ||
        n.includes('aaryaa') || n.includes('madha') || n.includes('nh tamil') || n.includes('sun tv') ||
        n.includes('thendral') || n.includes('m nadu') || n.includes('mei alai') || n.includes('captain')) {
      return 'Tamil';
    }
    if (n.includes('malayalam') || n.includes('asianet') || n.includes('mazhavil') || n.includes('kairali') || 
        n.includes('amrita') || n.includes('manorama') || n.includes('mathrubhumi') || n.includes('kaumudy') || 
        n.includes('24 news') || n.includes('jaihind') || n.includes('media one') || n.includes('safari') || 
        n.includes('kerala') || n.includes('surya') || n.includes('kappa') || n.includes('reporter') ||
        n.includes('pulari') || n.includes('shalom') || n.includes('shekinah') || n.includes('darshana') ||
        n.includes('utv palakkad')) {
      return 'Malayalam';
    }
    if (n.includes('telugu') || n.includes('etv') || n.includes('maa') || n.includes('ntv') || 
        n.includes('tv5') || n.includes('sakshi') || n.includes('v6') || n.includes('t news') || 
        n.includes('10 tv') || n.includes('abn') || n.includes('cinemalu') || n.includes('hmtv') || 
        n.includes('cvr') || n.includes('vanitha') || n.includes('prime9') || n.includes('gemini') || 
        n.includes('bhakthi tv') || n.includes('swatantra') || n.includes('pmc')) {
      return 'Telugu';
    }
    if (n.includes('kannada') || n.includes('suvarna') || n.includes('public tv') || n.includes('public music') || 
        n.includes('siri') || n.includes('nkr') || n.includes('chandana') || n.includes('news 1st') ||
        n.includes('bhakthi siri') || n.includes('raj news kannada')) {
      return 'Kannada';
    }
    if (n.includes('bangla') || n.includes('bengali') || n.includes('jalsha') || n.includes('ananda') || 
        n.includes('kolkata') || n.includes('ghanta') || n.includes('aakaash') || n.includes('ctvn') || 
        n.includes('rupasi') || n.includes('dhoom') || n.includes('rongeen') || n.includes('sangeet bangla') ||
        n.includes('sony aath') || n.includes('u bangla') || n.includes('samay kolkata')) {
      return 'Bengali';
    }
    if (n.includes('punjabi') || n.includes('ptc') || n.includes('tashan') || n.includes('pitaara') || 
        n.includes('balle') || n.includes('chardikla') || n.includes('spokesman') || n.includes('hamdard') ||
        n.includes('tabbar') || n.includes('apna punjab') || n.includes('fateh') || n.includes('daily post') ||
        n.includes('world punjabi')) {
      return 'Punjabi';
    }
    if (n.includes('gujarat') || n.includes('gujarati') || n.includes('asmita') || n.includes('kalak') || n.includes('vtv') || n.includes('vr live') || n.includes('mantavya')) {
      return 'Gujarati';
    }
    if (n.includes('marathi') || n.includes('majha') || n.includes('taas') || n.includes('pravah') || n.includes('pudhari') || n.includes('fakt') || n.includes('lokshahi')) {
      return 'Marathi';
    }
    if (n.includes('bhojpuri')) {
      return 'Bhojpuri';
    }
    if (n.includes('odia') || n.includes('tarang') || n.includes('kalinga') || n.includes('otv') || n.includes('prameya') || n.includes('argus') || n.includes('mbc tv') || n.includes('kanak')) {
      return 'Odia';
    }
    if (n.includes('wion') || n.includes('india today') || n.includes('ndtv 24x7') || n.includes('cnn') || 
        n.includes('times now') || n.includes('republic tv') || n.includes('discovery') || n.includes('animal planet') || 
        n.includes('eurosport') || n.includes('national geographic') || n.includes('history') || n.includes('tlc') || 
        n.includes('docubay') || n.includes('star sports') || n.includes('sony pix') || n.includes('movies now') ||
        n.includes('rt india') || n.includes('toi global')) {
      return 'English';
    }
    return 'Hindi';
  }

  function detectCategory(name, lang) {
    const n = name.toLowerCase();

    if (n.includes('movie') || n.includes('cinema') || n.includes('film') || n.includes('kadak') || 
        n.includes('goldmines') || n.includes('cine') || n.includes('star gold') || n.includes('sony max') || 
        n.includes('bhojpuri cinema') || n.includes('zee action') || n.includes('zee classic') || n.includes('all time movies') ||
        n.includes('bflix') || n.includes('sony pix') || n.includes('movies now')) {
      if (lang === 'Tamil') return 'Tamil Movies';
      if (lang === 'Malayalam') return 'Malayalam Movies';
      return 'Movies';
    }
    if (n.includes('comedy') || n.includes('sirippoli') || n.includes('adithya')) {
      if (lang === 'Tamil') return 'Tamil Comedy';
      if (lang === 'Malayalam') return 'Malayalam Comedy';
      return 'Comedy';
    }
    if (n.includes('news') || n.includes('samachar') || n.includes('khabar') || n.includes('24x7') || 
        n.includes('aaj tak') || n.includes('abp') || n.includes('ndtv') || n.includes('wion') || 
        n.includes('republic') || n.includes('times now') || n.includes('taas') || n.includes('ghanta') || 
        n.includes('seithigal') || n.includes('puthiya') || n.includes('thalaimurai') || n.includes('polimer news') ||
        n.includes('sansad') || n.includes('dd news') || n.includes('headquarters') || n.includes('bulletin')) {
      return 'News';
    }
    if (n.includes('music') || n.includes('musix') || n.includes('jalwa') || n.includes('jhakaas') || 
        n.includes('tashan') || n.includes('9xm') || n.includes('mastiii') || n.includes('sangeet') || 
        n.includes('isai') || n.includes('songdew') || n.includes('beats') || n.includes('dhoom') || n.includes('yrf')) {
      return 'Music';
    }
    if (n.includes('sports') || n.includes('cricket') || n.includes('eurosport') || n.includes('kabaddi')) {
      return 'Sports';
    }
    if (n.includes('cartoon') || n.includes('nick') || n.includes('disney') || n.includes('hungama') || 
        n.includes('kidz') || n.includes('kids') || n.includes('sonic') || n.includes('jungle book') || n.includes('sony yay')) {
      return 'Kids';
    }
    if (n.includes('aastha') || n.includes('sanskar') || n.includes('satsang') || n.includes('bhakti') || 
        n.includes('sadhna') || n.includes('spiritual') || n.includes('hare krsna') || n.includes('divya') || 
        n.includes('svbc') || n.includes('madha') || n.includes('shalom') || n.includes('prarthana') || 
        n.includes('angel') || n.includes('harvest') || n.includes('peace of mind') || n.includes('vedic') ||
        n.includes('darshan') || n.includes('aadinath') || n.includes('jinvani') || n.includes('santvani')) {
      return 'Devotional';
    }
    if (n.includes('discovery') || n.includes('animal planet') || n.includes('natgeo') || 
        n.includes('national geographic') || n.includes('history') || n.includes('docubay') || n.includes('travelxp')) {
      return 'Documentary';
    }
    if (lang === 'Tamil') return 'Tamil Entertainment';
    if (lang === 'Malayalam') return 'Malayalam Entertainment';
    return 'Entertainment';
  }

  // Generate deterministic branded SVG badge for channels that don't have an external logo
  function generateFallbackBadge(name, lang, category) {
    const initials = name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase();

    // Distinct background colors by language/genre
    let c1 = '#e50914', c2 = '#831843'; // Default crimson/rose
    if (lang === 'Tamil') { c1 = '#ea580c'; c2 = '#b91c1c'; } // Warm orange/red (Sun TV vibe)
    else if (lang === 'Malayalam') { c1 = '#059669'; c2 = '#047857'; } // Emerald Kerala vibe
    else if (lang === 'Telugu') { c1 = '#d97706'; c2 = '#b45309'; } // Amber gold vibe
    else if (category === 'News') { c1 = '#b91c1c'; c2 = '#1e1b4b'; } // News navy/red
    else if (category === 'Music') { c1 = '#9333ea'; c2 = '#4f46e5'; } // Purple neon
    else if (category === 'Sports') { c1 = '#2563eb'; c2 = '#1d4ed8'; } // Blue athletic
    else if (category === 'Kids') { c1 = '#f59e0b'; c2 = '#ec4899'; } // Fun vibrant

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${c1}" />
            <stop offset="100%" stop-color="${c2}" />
          </linearGradient>
        </defs>
        <rect width="300" height="180" rx="20" fill="url(#bg)" />
        <circle cx="150" cy="75" r="42" fill="#ffffff" fill-opacity="0.12" />
        <text x="150" y="88" font-family="Arial, sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle" letter-spacing="1">${initials}</text>
        <rect x="25" y="135" width="250" height="28" rx="6" fill="#000000" fill-opacity="0.45" />
        <text x="150" y="153" font-family="Arial, sans-serif" font-weight="700" font-size="13" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">${name.substring(0, 22).toUpperCase()}</text>
      </svg>
    `.trim();

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  const finalChannels = [];
  let logoMatches = 0;

  for (const group of channelGroups.values()) {
    const lang = detectLanguage(group.name, group.streams);
    const category = detectCategory(group.name, lang);

    // Sort streams:
    // 1. Prefer HTTPS over HTTP (avoids browser Mixed Content block)
    // 2. Prefer domain names over raw IP addresses (avoids offline cable boxes)
    // 3. Prefer 1080p / 720p
    const sortedStreams = [...group.streams].sort((a, b) => {
      const aHttps = a.startsWith('https://');
      const bHttps = b.startsWith('https://');
      if (aHttps && !bHttps) return -1;
      if (!aHttps && bHttps) return 1;

      const aIsIp = /\/\/\d+\.\d+\.\d+\.\d+/.test(a);
      const bIsIp = /\/\/\d+\.\d+\.\d+\.\d+/.test(b);
      if (!aIsIp && bIsIp) return -1;
      if (aIsIp && !bIsIp) return 1;

      return 0;
    });

    const primaryStream = sortedStreams[0];
    const alternateStreams = sortedStreams.slice(1);

    // Find best logo
    let logo = CURATED_LOGOS[group.id] || nameToLogo.get(norm(group.name)) || '';
    if (!logo) {
      // try without channel suffixes
      const simple = norm(group.name.replace(/news|tv|hd|movies|music|cinema/gi, ''));
      logo = nameToLogo.get(simple) || '';
    }

    if (logo) {
      logoMatches++;
    } else {
      logo = generateFallbackBadge(group.name, lang, category);
    }

    const isFeatured = group.name === 'Suriya TV' || group.name === 'Sun TV' || group.name === 'Sun TV HD' || 
                       group.name === 'Sun Surya HD' || group.name === 'Aaj Tak' || group.name === 'Mazhavil Manorama' ||
                       group.name === 'Star Vijay' || group.name === 'Star Sports 1';

    finalChannels.push({
      id: group.id,
      name: group.name,
      language: lang,
      category,
      logo,
      streamUrl: primaryStream,
      alternateStreams,
      featured: isFeatured,
      description: `Official 24/7 Live broadcast stream for ${group.name} on TFLIX. Includes ${sortedStreams.length} stream server${sortedStreams.length > 1 ? 's' : ''} for continuous playback.`,
      currentProgram: `${group.name} Prime Time Broadcast`,
      nextProgram: 'Next Scheduled Program',
      programTime: 'Live 24/7',
      tags: [lang, category, 'TFLIX', 'Live TV']
    });
  }

  console.log(`Matched official logos for ${logoMatches} channels. Added high-resolution branded badges for the remainder.`);
  console.log(`Total active channels with alternate streams: ${finalChannels.length}`);

  // Sort channels: Featured first, then Tamil, Malayalam, Hindi, others
  const langOrder = { 'Tamil': 1, 'Malayalam': 2, 'Telugu': 3, 'Kannada': 4, 'Hindi': 5, 'Bengali': 6, 'Punjabi': 7, 'English': 8 };
  finalChannels.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    const oA = langOrder[a.language] || 99;
    const oB = langOrder[b.language] || 99;
    if (oA !== oB) return oA - oB;
    return a.name.localeCompare(b.name);
  });

  const outContent = `import { Channel } from '../types';

export const INITIAL_CHANNELS: Channel[] = ${JSON.stringify(finalChannels, null, 2)};

export const CATEGORIES_LIST = [
  'All',
  'Tamil Entertainment',
  'Tamil Movies',
  'Tamil Comedy',
  'Malayalam Entertainment',
  'Malayalam Movies',
  'Malayalam Comedy',
  'Entertainment',
  'Movies',
  'Comedy',
  'News',
  'Music',
  'Sports',
  'Kids',
  'Devotional',
  'Documentary'
] as const;

export const LANGUAGES_LIST = [
  'All',
  'Tamil',
  'Malayalam',
  'Telugu',
  'Kannada',
  'Hindi',
  'Bengali',
  'Punjabi',
  'Gujarati',
  'Marathi',
  'Bhojpuri',
  'Odia',
  'English',
  'Other'
] as const;
`;

  fs.writeFileSync(path.resolve(__dirname, '../src/data/channels.ts'), outContent);
  console.log('Successfully wrote comprehensive src/data/channels.ts!');
}

main().catch(console.error);
