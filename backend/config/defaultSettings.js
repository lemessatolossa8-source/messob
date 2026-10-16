/**
 * Default CMS site settings for the single-admin Burayu MESOB portal.
 * Secrets (DB passwords, JWT, SMTP) are never stored here — only in .env.
 */

const DEFAULT_SETTINGS = {
  siteName: {
    en: "Burayu MESOB",
    am: "ቡራዩ መሶብ",
    om: "Buraayyuu MESOB",
  },
  siteTagline: {
    en: "Digital Gateway to Burayu Municipal Services",
    am: "ወደ ቡራዩ የማዘጋጃ ቤት አገልግሎቶች ዲጂታል መግቢያ",
    om: "Balbala Dijitaalaa Tajaajila Munisipalaa Buraayyuu",
  },
  siteDescription: {
    en: "Official portal providing municipal services, announcements, and public information for Burayu City Administration",
    am: "የቡራዩ ከተማ አስተዳደር ኦፊሴላዊ መረጃ መድረክ - የማዘጋጃ ቤት አገልግሎቶችን፣ ማስታወቂያዎችን እና የህዝብ መረጃዎችን ያቀርባል",
    om: "Marsariitiin ofiishaala bulchiinsa Magaalaa Buraayyuu kan tajaajila munisipalaa, beeksisaafi odeeffannoo uummataa dhiyeessu",
  },
  contactInfo: {
    email: "info@burayu.gov.et",
    phone: "+251 11 284 0000",
    address: "Burayu City Administration, Main Office",
    workingHours: "Monday - Friday: 8:30 AM - 5:00 PM",
  },
  socialMedia: {
    facebook: "",
    twitter: "",
    youtube: "",
    telegram: "",
    linkedin: "",
  },
  eService: {
    enabled: true,
    eLand: {
      enabled: true,
      url: "https://eland.shaggarcity.et/",
    },
    eConference: {
      enabled: true,
      url: "https://econference.shaggarcity.et/",
    },
    eLibrary: {
      enabled: false,
      url: "",
      comingSoon: true,
    },
    eTrade: {
      enabled: true,
      url: "https://etrade.gov.et/",
    },
  },
  languageSettings: {
    defaultLanguage: "om",
    requireFullTranslations: true,
    enableAutoTranslate: false,
  },
  contentSettings: {
    itemsPerPage: 12,
    enableComments: false,
    enableSearch: true,
    enableFilters: true,
  },
  maintenance: {
    enabled: false,
    message: {
      en: "Our website is currently undergoing maintenance. We'll be back shortly.",
      am: "ድረ-ገፃችን በጥገና ላይ ነው። በቅርቡ እንመለሳለን።",
      om: "Marsariitiin keenya yeroo ammaa kana suphamutti jira. Dhiyootti deebina."
    }
  },
  mayorMessage: {
    status: "published",
    photo: "",
    om: {
      name: "Mr. Abate Asirat",
      jobTitle: "Burayu Sub city Administration",
      welcomeMessage: "Ergaa Baga Nagaan Dhuftanii Bulchiinsa Kutaa Magaalaa Burraayyuu Irraa",
      title: "Baga Nagaan Dhuftan Jiraattota fi Daawwattoota Kutaa Magaalaa Burraayyuu",
      message: "Akka Bulchiinsa Kutaa Magaalaa Burraayyuutti, mul'ata keenya fuulduraa hawaasa keenyaa qooddachuu kootti baay'een gammada. Burraayyuu gara magaalaa ismaartii fakkeenya taatutti jijjiiruuf kutannoodhaan hojjechaa jirra — dorgomaa, jireenyaaf mijattuu fi deebii hatattamaa kan kennitu. Galmi keenya Kutaa Magaalaa Burraayyuu wirtuu guddinaa fi tajaajila hawaasaa mirkaneessudha.",
    },
    am: {
      name: "Mr. Abate Asirat",
      jobTitle: "Burayu Sub city Administration",
      welcomeMessage: "እንኳን ደህና መጡ መልእክት ከቡራዩ ክፍለ ከተማ አስተዳደር",
      title: "እንኳን ለቡራዩ ክፍለ ከተማ ነዋሪዎች እና ጎብኚዎች በደህና መጡ",
      message: "እንደ ቡራዩ ክፍለ ከተማ አስተዳደር የህበረተሰባችንን የወደፊት ራዕይ በማካፈሌ ወሰን የሌለው ደስታ ይሰማኛል። ቡራዩን ሞዴል ስማርት ከተማ ለማድረግ ቆርጠን እየሰራን እንገኛለን — ተወዳዳሪ፣ ለኑሮ ምቹ እና የነዋሪዎችን ጥያቄዎች በፍጥነት የምትመልስ። አላማችን የቡራዩ ክፍለ ከተማን የተቀናጀ የልማት ማዕከል ማድረግ ነው።",
    },
    en: {
      name: "Mr. Abate Asirat",
      jobTitle: "Burayu Sub city Administration",
      welcomeMessage: "Welcome Message from the Burayu Sub city Administration",
      title: "A Warm Welcome to the Residents and Visitors of Burayu Sub city",
      message: "As the Burayu Sub city Administration, I am excited to share our bold vision for the future of our community. We are committed to transforming Burayu into a model smart city — competitive, livable, and responsive to the needs of all residents. Our goal is to establish Burayu Sub city as a compact, polycentric hub for growth, innovation, and public service excellence.",
    },
  },
};


function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

function deepMergeKnown(target, source) {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(target).forEach(key => {
      if (source[key] !== undefined) {
        if (isObject(target[key]) && isObject(source[key])) {
          output[key] = deepMergeKnown(target[key], source[key]);
        } else {
          output[key] = source[key];
        }
      }
    });
    Object.keys(source).forEach(key => {
      if (!(key in output) && source[key] !== undefined) {
        output[key] = source[key];
      }
    });
  }
  return output;
}

function stripSecrets(payload) { return payload; }
function validateSettingsPayload(payload) { return []; }
function toPublicSettings(payload) { return payload; }

module.exports = {
  DEFAULT_SETTINGS,
  deepMergeKnown,
  stripSecrets,
  validateSettingsPayload,
  toPublicSettings
};
