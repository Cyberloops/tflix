const fs = require('fs');
const path = require('path');

const csvPath = path.resolve(__dirname, 'raw_channels.csv');
const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split('\n').filter(l => l.trim().length > 0);

// Comprehensive logo dictionary for Indian TV channels
const LOGO_MAP = {
  // Tamil
  'Suriya TV': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Sun_TV_Network_Logo.svg/300px-Sun_TV_Network_Logo.svg.png',
  'Sun TV HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Sun_TV_Network_Logo.svg/300px-Sun_TV_Network_Logo.svg.png',
  'Sun Surya HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/18/Surya_TV_logo.png/300px-Surya_TV_logo.png',
  'Suriyan TV': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Sun_TV_Network_Logo.svg/300px-Sun_TV_Network_Logo.svg.png',
  'Colors Tamil HD': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Colors_Tamil_logo.png/300px-Colors_Tamil_logo.png',
  'Colors Tamil': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Colors_Tamil_logo.png/300px-Colors_Tamil_logo.png',
  'Zee Tamil HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/7/77/Zee_Tamil_logo_2017.png/300px-Zee_Tamil_logo_2017.png',
  'Zee Tamil': 'https://upload.wikimedia.org/wikipedia/en/thumb/7/77/Zee_Tamil_logo_2017.png/300px-Zee_Tamil_logo_2017.png',
  'Star Vijay': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Star_Vijay_logo.png/300px-Star_Vijay_logo.png',
  'Vijay Takkar': 'https://upload.wikimedia.org/wikipedia/en/thumb/7/70/Vijay_Takkar_logo.png/300px-Vijay_Takkar_logo.png',
  'Polimer TV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Polimer_TV_Logo.png/300px-Polimer_TV_Logo.png',
  'Polimer News': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Polimer_News_Logo.png/300px-Polimer_News_Logo.png',
  'Puthiya Thalaimurai': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Puthiya_Thalaimurai_TV_logo.png/300px-Puthiya_Thalaimurai_TV_logo.png',
  'Thanthi TV': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/be/Thanthi_TV_logo.png/300px-Thanthi_TV_logo.png',
  'Thanthi One': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/be/Thanthi_TV_logo.png/300px-Thanthi_TV_logo.png',
  'News 7 Tamil': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/ad/News7_Tamil_Logo.png/300px-News7_Tamil_Logo.png',
  'News Tamil 24x7': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/News_Tamil_24x7_logo.png/300px-News_Tamil_24x7_logo.png',
  'Raj TV': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Raj_TV_logo.png/300px-Raj_TV_logo.png',
  'Raj Digital Plus': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/19/Raj_Digital_Plus_logo.png/300px-Raj_Digital_Plus_logo.png',
  'Raj Musix Tamil': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Raj_Musix_Tamil_logo.png/300px-Raj_Musix_Tamil_logo.png',
  'Kalaignar TV': 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/Kalaignar_TV_logo.png/300px-Kalaignar_TV_logo.png',
  'Kalaignar Murasu': 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/Kalaignar_TV_logo.png/300px-Kalaignar_TV_logo.png',
  'Kalaignar Seithigal': 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/Kalaignar_TV_logo.png/300px-Kalaignar_TV_logo.png',
  'Sirippoli TV': 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/Kalaignar_TV_logo.png/300px-Kalaignar_TV_logo.png',
  'Makkal TV': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d7/Makkal_TV_logo.png/300px-Makkal_TV_logo.png',
  'Malai Murasu TV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Malaimurasu_tv_logo.png/300px-Malaimurasu_tv_logo.png',
  'Madha TV': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/69/Madha_TV_Logo.png/300px-Madha_TV_Logo.png',
  'DD Tamil HD': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/DD_Tamil_Logo.png/300px-DD_Tamil_Logo.png',

  // Malayalam
  'Mazhavil Manorama': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d5/Mazhavil_Manorama_Logo.png/300px-Mazhavil_Manorama_Logo.png',
  'Mazhavil Manorama HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d5/Mazhavil_Manorama_Logo.png/300px-Mazhavil_Manorama_Logo.png',
  'Asianet News': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Asianet_News_logo.png/300px-Asianet_News_logo.png',
  'Asianet HD': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Asianet_logo_2023.png/300px-Asianet_logo_2023.png',
  'Asianet Movies HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e8/Asianet_Movies_logo.png/300px-Asianet_Movies_logo.png',
  'Kairali TV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Kairali_TV_logo.png/300px-Kairali_TV_logo.png',
  'Amrita TV': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Amrita_TV_logo.png/300px-Amrita_TV_logo.png',
  'Manorama News': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3f/Manorama_News_Logo.png/300px-Manorama_News_Logo.png',
  'Mathrubhumi News': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/16/Mathrubhumi_News_logo.png/300px-Mathrubhumi_News_logo.png',
  'Reporter TV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Reporter_TV_logo.png/300px-Reporter_TV_logo.png',
  'Kaumudy TV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Kaumudy_TV_logo.png/300px-Kaumudy_TV_logo.png',
  '24 News': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b8/Twentyfour_News_logo.png/300px-Twentyfour_News_logo.png',
  'Media One': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/MediaOne_TV_Logo.png/300px-MediaOne_TV_Logo.png',
  'Janam TV': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Janam_TV_logo.png/300px-Janam_TV_logo.png',
  'Jaihind TV': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9b/Jaihind_TV_logo.png/300px-Jaihind_TV_logo.png',
  'Kerala Vision': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Kerala_Vision_Logo.png/300px-Kerala_Vision_Logo.png',
  'Safari TV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Safari_TV_Logo.png/300px-Safari_TV_Logo.png',

  // Hindi
  'Aaj Tak': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Aaj_tak_logo.png/300px-Aaj_tak_logo.png',
  'Aaj Tak HD': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Aaj_tak_logo.png/300px-Aaj_tak_logo.png',
  'ABP News': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/ABP_News_Logo.png/300px-ABP_News_Logo.png',
  'India TV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/India_TV_logo.png/300px-India_TV_logo.png',
  'NDTV India': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/NDTV_India_Logo.png/300px-NDTV_India_Logo.png',
  'Zee News': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Zee_News_Logo.png/300px-Zee_News_Logo.png',
  'Republic Bharat': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Republic_Bharat_Logo.png/300px-Republic_Bharat_Logo.png',
  'Times Now Navbharat': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Times_Now_Navbharat_logo.png/300px-Times_Now_Navbharat_logo.png',
  'News 24': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/News24_India_logo.png/300px-News24_India_logo.png',
  'News Nation': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/News_Nation_logo.png/300px-News_Nation_logo.png',
  'Bharat24': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Bharat_24_logo.png/300px-Bharat_24_logo.png',
  'DD News': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/DD_News_logo_2019.svg/300px-DD_News_logo_2019.svg.png',
  'DD National HD': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/DD_National_logo.svg/300px-DD_National_logo.svg.png',
  'StarPlus HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c3/StarPlus_Logo.png/300px-StarPlus_Logo.png',
  'Star Gold HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0f/Star_Gold_logo.png/300px-Star_Gold_logo.png',
  'Sony SAB': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b8/Sony_SAB_logo_2022.png/300px-Sony_SAB_logo_2022.png',
  'Sony Max HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Sony_Max_logo_2016.png/300px-Sony_Max_logo_2016.png',
  'Colors HD': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Colors_TV_logo.png/300px-Colors_TV_logo.png',
  '&TV International': 'https://upload.wikimedia.org/wikipedia/en/thumb/2/22/%26TV_logo.png/300px-%26TV_logo.png',
  'Zee Cinema HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/Zee_Cinema_logo_2017.png/300px-Zee_Cinema_logo_2017.png',
  'Zee Cinema': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/Zee_Cinema_logo_2017.png/300px-Zee_Cinema_logo_2017.png',
  'Dangal TV': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Dangal_TV_logo.png/300px-Dangal_TV_logo.png',
  'Dangal 2': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Dangal_TV_logo.png/300px-Dangal_TV_logo.png',
  'Shemaroo TV': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/90/Shemaroo_TV_logo.png/300px-Shemaroo_TV_logo.png',
  'Shemaroo Umang': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/90/Shemaroo_TV_logo.png/300px-Shemaroo_TV_logo.png',
  '9XM': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/82/9XM_logo.png/300px-9XM_logo.png',
  '9X Jalwa': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/ae/9X_Jalwa_logo.png/300px-9X_Jalwa_logo.png',
  'B4U Movies': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b3/B4U_Movies_logo.png/300px-B4U_Movies_logo.png',
  'B4U Music': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/69/B4U_Music_logo.png/300px-B4U_Music_logo.png',
  'B4U Kadak': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b3/B4U_Movies_logo.png/300px-B4U_Movies_logo.png',
  'B4U Bhojpuri': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b3/B4U_Movies_logo.png/300px-B4U_Movies_logo.png',
  'Bhojpuri Cinema': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Bhojpuri_Cinema_logo.png/300px-Bhojpuri_Cinema_logo.png',
  'Goldmines': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Goldmines_Telefilms_Logo.png/300px-Goldmines_Telefilms_Logo.png',
  'Goldmines Bollywood': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Goldmines_Telefilms_Logo.png/300px-Goldmines_Telefilms_Logo.png',
  'Goldmines Movies': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Goldmines_Telefilms_Logo.png/300px-Goldmines_Telefilms_Logo.png',

  // Telugu
  'ETV Telugu HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/15/ETV_Network_logo.png/300px-ETV_Network_logo.png',
  'ETV Cinema HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/15/ETV_Network_logo.png/300px-ETV_Network_logo.png',
  'ETV Plus HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/15/ETV_Network_logo.png/300px-ETV_Network_logo.png',
  'ETV Andhra Pradesh': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/15/ETV_Network_logo.png/300px-ETV_Network_logo.png',
  'ETV Telangana': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/15/ETV_Network_logo.png/300px-ETV_Network_logo.png',
  'ETV Comedy': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/15/ETV_Network_logo.png/300px-ETV_Network_logo.png',
  'ETV Josh': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/15/ETV_Network_logo.png/300px-ETV_Network_logo.png',
  'ETV Music': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/15/ETV_Network_logo.png/300px-ETV_Network_logo.png',
  'Zee Telugu HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b6/Zee_Telugu_logo.png/300px-Zee_Telugu_logo.png',
  'Zee Cinemalu HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/69/Zee_Cinemalu_logo.png/300px-Zee_Cinemalu_logo.png',
  'Star Maa HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Star_Maa_logo.png/300px-Star_Maa_logo.png',
  'Star Maa Movies HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Star_Maa_logo.png/300px-Star_Maa_logo.png',
  'TV9 Telugu': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f0/TV9_Telugu_logo.png/300px-TV9_Telugu_logo.png',
  'NTV Telugu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/NTV_Telugu_logo.png/300px-NTV_Telugu_logo.png',
  'Sakshi TV': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/36/Sakshi_TV_logo.png/300px-Sakshi_TV_logo.png',
  'V6 News': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/V6_News_logo.png/300px-V6_News_logo.png',
  '10 TV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/10TV_Telugu_logo.png/300px-10TV_Telugu_logo.png',

  // Kannada
  'Colors Kannada HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Colors_Kannada_logo.png/300px-Colors_Kannada_logo.png',
  'Zee Kannada HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/Zee_Kannada_logo_2018.png/300px-Zee_Kannada_logo_2018.png',
  'TV9 Kannada': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/09/TV9_Kannada_logo.png/300px-TV9_Kannada_logo.png',
  'Public TV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Public_TV_Kannada_logo.png/300px-Public_TV_Kannada_logo.png',
  'Suvarna News': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Asianet_Suvarna_News_logo.png/300px-Asianet_Suvarna_News_logo.png',
  'Republic Kannada': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Republic_Kannada_logo.png/300px-Republic_Kannada_logo.png',

  // Bengali
  'Zee Bangla HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/69/Zee_Bangla_logo_2018.png/300px-Zee_Bangla_logo_2018.png',
  'Star Jalsha HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Star_Jalsha_logo.png/300px-Star_Jalsha_logo.png',
  'Colors Bangla HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/69/Colors_Bangla_logo.png/300px-Colors_Bangla_logo.png',
  'ABP Ananda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/ABP_Ananda_logo.png/300px-ABP_Ananda_logo.png',
  'TV9 Bangla': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/TV9_Bangla_logo.png/300px-TV9_Bangla_logo.png',
  'Zee 24 Ghanta': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c5/Zee_24_Ghanta_logo.png/300px-Zee_24_Ghanta_logo.png',

  // Punjabi
  'PTC Punjabi': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/PTC_Punjabi_Logo.png/300px-PTC_Punjabi_Logo.png',
  'PTC News': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1b/PTC_News_Logo.png/300px-PTC_News_Logo.png',
  'PTC Music': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/91/PTC_Music_Logo.png/300px-PTC_Music_Logo.png',
  '9X Tashan': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/9X_Tashan_logo.png/300px-9X_Tashan_logo.png',
  'Pitaara': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/60/Pitaara_TV_logo.png/300px-Pitaara_TV_logo.png',
  'Balle Balle HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Balle_Balle_TV_logo.png/300px-Balle_Balle_TV_logo.png',

  // Kids & Discovery & Sports & English
  'Cartoon Network': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Cartoon_Network_2010_logo.svg/300px-Cartoon_Network_2010_logo.svg.png',
  'Cartoon Network HD+': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Cartoon_Network_2010_logo.svg/300px-Cartoon_Network_2010_logo.svg.png',
  'Discovery Kids': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Discovery_Kids_logo.svg/300px-Discovery_Kids_logo.svg.png',
  'Discovery Channel': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Discovery_Channel_Logo_2019.svg/300px-Discovery_Channel_Logo_2019.svg.png',
  'Discovery Channel HD': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Discovery_Channel_Logo_2019.svg/300px-Discovery_Channel_Logo_2019.svg.png',
  'Discovery Science': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Discovery_Science_2017.svg/300px-Discovery_Science_2017.svg.png',
  'Discovery Turbo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Discovery_Turbo_logo.svg/300px-Discovery_Turbo_logo.svg.png',
  'Animal Planet': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Animal_Planet_2018.svg/300px-Animal_Planet_2018.svg.png',
  'Animal Planet HD': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Animal_Planet_2018.svg/300px-Animal_Planet_2018.svg.png',
  'National Geographic HD': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/National_Geographic_logo.svg/300px-National_Geographic_logo.svg.png',
  'History TV18 HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/History_TV18_logo.png/300px-History_TV18_logo.png',
  'Eurosport': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Eurosport_logo_2015.svg/300px-Eurosport_logo_2015.svg.png',
  'Star Sports 1': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/Star_Sports_logo_2013.svg/300px-Star_Sports_logo_2013.svg.png',
  'Star Sports 2': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/Star_Sports_logo_2013.svg/300px-Star_Sports_logo_2013.svg.png',
  'Star Sports Select 1 HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/Star_Sports_logo_2013.svg/300px-Star_Sports_logo_2013.svg.png',
  'Sony Sports Ten 1': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Sony_Sports_Ten_1_logo.png/300px-Sony_Sports_Ten_1_logo.png',
  'Sony Sports Ten 2': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Sony_Sports_Ten_2_logo.png/300px-Sony_Sports_Ten_2_logo.png',
  'DD Sports': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/DD_Sports_logo.svg/300px-DD_Sports_logo.svg.png',
  'WION': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/WION_Logo.png/300px-WION_Logo.png',
  'India Today': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/India_Today_logo.svg/300px-India_Today_logo.svg.png',
  'NDTV 24x7': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/NDTV_24x7_logo.svg/300px-NDTV_24x7_logo.svg.png',
  'CNN News 18': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/CNN-News18_logo.png/300px-CNN-News18_logo.png',
  'Times Now': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Times_Now_logo.png/300px-Times_Now_logo.png',
  'Republic TV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Republic_TV_logo.png/300px-Republic_TV_logo.png',
  'CNBC TV18': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/CNBC-TV18_logo.png/300px-CNBC-TV18_logo.png',
  'TLC': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/TLC_Logo_2006.svg/300px-TLC_Logo_2006.svg.png',
  'Zoom': 'https://upload.wikimedia.org/wikipedia/en/thumb/2/29/Zoom_TV_logo.png/300px-Zoom_TV_logo.png',
  'Aastha': 'https://upload.wikimedia.org/wikipedia/en/thumb/2/25/Aastha_TV_logo.png/300px-Aastha_TV_logo.png',
  'Sanskar TV': 'https://upload.wikimedia.org/wikipedia/en/thumb/2/22/Sanskar_TV_logo.png/300px-Sanskar_TV_logo.png',
};

// Function to classify language
function detectLanguage(name, url) {
  const n = name.toLowerCase();
  const u = url.toLowerCase();

  if (n.includes('tamil') || n.includes('suriya') || n.includes('suriyan') || n.includes('kalaignar') || 
      n.includes('polimer') || n.includes('puthiya') || n.includes('thanthi') || n.includes('makkal') || 
      n.includes('malai murasu') || n.includes('vijay') || n.includes('isai aruvi') || n.includes('sirippoli') ||
      n.includes('dheeran') || n.includes('vaanavil') || n.includes('vasanth') || n.includes('vendhar') ||
      n.includes('aaryaa') || n.includes('madha') || n.includes('nh tamil') || n.includes('sun tv')) {
    return 'Tamil';
  }
  if (n.includes('malayalam') || n.includes('asianet') || n.includes('mazhavil') || n.includes('kairali') || 
      n.includes('amrita') || n.includes('manorama') || n.includes('mathrubhumi') || n.includes('kaumudy') || 
      n.includes('24 news') || n.includes('jaihind') || n.includes('media one') || n.includes('safari') || 
      n.includes('kerala') || n.includes('surya') || n.includes('kappa') || n.includes('reporter tv') ||
      n.includes('pulari') || n.includes('shalom') || n.includes('shekinah')) {
    return 'Malayalam';
  }
  if (n.includes('telugu') || n.includes('etv') || n.includes('maa') || n.includes('ntv') || 
      n.includes('tv5') || n.includes('sakshi') || n.includes('v6') || n.includes('t news') || 
      n.includes('10 tv') || n.includes('abn') || n.includes('cinemalu') || n.includes('hmtv') || 
      n.includes('cvr') || n.includes('vanitha') || n.includes('prime9') || n.includes('gemini') || 
      n.includes('bhakthi tv')) {
    return 'Telugu';
  }
  if (n.includes('kannada') || n.includes('suvarna') || n.includes('public tv') || n.includes('public music') || 
      n.includes('siri') || n.includes('nkr') || n.includes('chandana') || n.includes('news 1st')) {
    return 'Kannada';
  }
  if (n.includes('bangla') || n.includes('bengali') || n.includes('jalsha') || n.includes('ananda') || 
      n.includes('kolkata') || n.includes('ghanta') || n.includes('aakaash') || n.includes('ctvn') || 
      n.includes('rupasi') || n.includes('dhoom') || n.includes('rongeen') || n.includes('sangeet bangla') ||
      n.includes('sony aath')) {
    return 'Bengali';
  }
  if (n.includes('punjabi') || n.includes('ptc') || n.includes('tashan') || n.includes('pitaara') || 
      n.includes('balle') || n.includes('chardikla') || n.includes('spokesman') || n.includes('hamdard') ||
      n.includes('tabbar')) {
    return 'Punjabi';
  }
  if (n.includes('gujarat') || n.includes('gujarati') || n.includes('asmita') || n.includes('kalak') || n.includes('vtv')) {
    return 'Gujarati';
  }
  if (n.includes('marathi') || n.includes('majha') || n.includes('taas') || n.includes('pravah') || n.includes('pudhari') || n.includes('fakt')) {
    return 'Marathi';
  }
  if (n.includes('bhojpuri')) {
    return 'Bhojpuri';
  }
  if (n.includes('odia') || n.includes('tarang') || n.includes('kalinga') || n.includes('otv') || n.includes('prameya')) {
    return 'Odia';
  }
  if (n.includes('wion') || n.includes('india today') || n.includes('ndtv 24x7') || n.includes('cnn') || 
      n.includes('times now') || n.includes('republic tv') || n.includes('discovery') || n.includes('animal planet') || 
      n.includes('eurosport') || n.includes('national geographic') || n.includes('history tv18') || n.includes('tlc') || 
      n.includes('docubay') || n.includes('star sports select') || n.includes('sony pix') || n.includes('movies now')) {
    return 'English';
  }
  return 'Hindi';
}

// Function to classify category
function detectCategory(name, lang) {
  const n = name.toLowerCase();

  if (n.includes('movie') || n.includes('cinema') || n.includes('film') || n.includes('kadak') || 
      n.includes('goldmines') || n.includes('cine') || n.includes('star gold') || n.includes('sony max') || 
      n.includes('bhojpuri cinema') || n.includes('zee action') || n.includes('zee classic') || n.includes('all time movies') ||
      n.includes('bflix')) {
    if (lang === 'Tamil') return 'Tamil Movies';
    if (lang === 'Malayalam') return 'Malayalam Movies';
    return 'Movies';
  }
  if (n.includes('comedy') || n.includes('sab') || n.includes('sirippoli') || n.includes('adithya')) {
    if (lang === 'Tamil') return 'Tamil Comedy';
    if (lang === 'Malayalam') return 'Malayalam Comedy';
    return 'Comedy';
  }
  if (n.includes('news') || n.includes('samachar') || n.includes('khabar') || n.includes('24x7') || 
      n.includes('aaj tak') || n.includes('abp') || n.includes('ndtv') || n.includes('wion') || 
      n.includes('republic') || n.includes('times now') || n.includes('taas') || n.includes('ghanta') || 
      n.includes('seithigal') || n.includes('puthiya') || n.includes('thalaimurai') || n.includes('polimer news') ||
      n.includes('sansad') || n.includes('dd news')) {
    return 'News';
  }
  if (n.includes('music') || n.includes('musix') || n.includes('jalwa') || n.includes('jhakaas') || 
      n.includes('tashan') || n.includes('9xm') || n.includes('mastiii') || n.includes('sangeet') || 
      n.includes('isai') || n.includes('songdew') || n.includes('beats') || n.includes('dhoom')) {
    return 'Music';
  }
  if (n.includes('sports') || n.includes('cricket') || n.includes('eurosport') || n.includes('kabaddi')) {
    return 'Sports';
  }
  if (n.includes('cartoon') || n.includes('nick') || n.includes('disney') || n.includes('hungama') || 
      n.includes('kidz') || n.includes('kids') || n.includes('sonic') || n.includes('jungle book')) {
    return 'Kids';
  }
  if (n.includes('aastha') || n.includes('sanskar') || n.includes('satsang') || n.includes('bhakti') || 
      n.includes('sadhna') || n.includes('spiritual') || n.includes('hare krsna') || n.includes('divya') || 
      n.includes('svbc') || n.includes('madha') || n.includes('shalom') || n.includes('prarthana') || 
      n.includes('angel') || n.includes('harvest') || n.includes('peace of mind') || n.includes('vedic')) {
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

function cleanChannelName(raw) {
  return raw
    .replace(/\s*\(\d+p\)/gi, '')
    .replace(/\s*\(\d+i\)/gi, '')
    .replace(/\s*\[.*?\]/g, '')
    .replace(/\s*HD\+/i, ' HD')
    .trim();
}

function generateCleanId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Parse all
const channelMap = new Map();

for (const line of lines) {
  const parts = line.split(',');
  if (parts.length < 2) continue;
  const rawName = parts[0].trim();
  const streamUrl = parts.slice(1).join(',').trim();

  if (!streamUrl.startsWith('http')) continue;

  const cleanName = cleanChannelName(rawName);
  const id = generateCleanId(cleanName);
  const lang = detectLanguage(cleanName, streamUrl);
  const category = detectCategory(cleanName, lang);

  // If already exists, prefer HTTPS and higher resolution
  if (channelMap.has(id)) {
    const existing = channelMap.get(id);
    const isExistingHttps = existing.streamUrl.startsWith('https://');
    const isNewHttps = streamUrl.startsWith('https://');

    if (!isExistingHttps && isNewHttps) {
      existing.streamUrl = streamUrl;
    }
    continue;
  }

  const logo = LOGO_MAP[cleanName] || LOGO_MAP[cleanName + ' HD'] || '';

  channelMap.set(id, {
    id,
    name: cleanName,
    language: lang,
    category,
    logo,
    streamUrl,
    featured: cleanName === 'Suriya TV' || cleanName === 'Sun TV' || cleanName === 'Sun Surya HD' || cleanName === 'Aaj Tak' || cleanName === 'Mazhavil Manorama',
    description: `Official 24/7 Live broadcast of ${cleanName} on TFLIX. High-definition live stream with adaptive bitrate.`,
    currentProgram: `${cleanName} Prime Broadcast`,
    nextProgram: 'Next Scheduled Program',
    programTime: 'Live 24/7',
    tags: [lang, category, 'TFLIX', 'Live TV']
  });
}

const channels = Array.from(channelMap.values());
console.log(`Successfully parsed ${channels.length} unique live channels!`);

// Sort channels: Featured first, then Tamil, Malayalam, Hindi, others
const langOrder = { 'Tamil': 1, 'Malayalam': 2, 'Telugu': 3, 'Kannada': 4, 'Hindi': 5, 'Bengali': 6, 'Punjabi': 7, 'English': 8 };
channels.sort((a, b) => {
  if (a.featured && !b.featured) return -1;
  if (!a.featured && b.featured) return 1;
  const oA = langOrder[a.language] || 99;
  const oB = langOrder[b.language] || 99;
  if (oA !== oB) return oA - oB;
  return a.name.localeCompare(b.name);
});

// Output TypeScript file
const outContent = `import { Channel } from '../types';

export const INITIAL_CHANNELS: Channel[] = ${JSON.stringify(channels, null, 2)};

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
  'English',
  'Other'
] as const;
`;

fs.writeFileSync(path.resolve(__dirname, '../src/data/channels.ts'), outContent);
console.log('Successfully wrote src/data/channels.ts!');
