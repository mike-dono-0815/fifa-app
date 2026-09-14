export type Country = { name: string; code: string }

export const PINNED_NATIONS: Country[] = [
  { name: 'Austria', code: 'at' }, { name: 'Greece', code: 'gr' }, { name: 'India', code: 'in' },
  { name: 'Turkey', code: 'tr' }, { name: 'Colombia', code: 'co' },
]

export const TOP_NATIONS: Country[] = [
  { name: 'Argentina', code: 'ar' }, { name: 'Brazil', code: 'br' }, { name: 'England', code: 'gb-eng' },
  { name: 'France', code: 'fr' }, { name: 'Germany', code: 'de' }, { name: 'Italy', code: 'it' },
  { name: 'Spain', code: 'es' }, { name: 'Portugal', code: 'pt' }, { name: 'Netherlands', code: 'nl' },
  { name: 'Belgium', code: 'be' }, { name: 'Croatia', code: 'hr' }, { name: 'Uruguay', code: 'uy' },
  { name: 'Colombia', code: 'co' }, { name: 'Mexico', code: 'mx' }, { name: 'USA', code: 'us' },
  { name: 'Japan', code: 'jp' }, { name: 'South Korea', code: 'kr' }, { name: 'Senegal', code: 'sn' },
  { name: 'Morocco', code: 'ma' }, { name: 'Nigeria', code: 'ng' }, { name: 'Australia', code: 'au' },
  { name: 'Denmark', code: 'dk' }, { name: 'Switzerland', code: 'ch' }, { name: 'Poland', code: 'pl' },
  { name: 'Turkey', code: 'tr' }, { name: 'Ukraine', code: 'ua' }, { name: 'Serbia', code: 'rs' },
  { name: 'Scotland', code: 'gb-sct' }, { name: 'Wales', code: 'gb-wls' }, { name: 'Ecuador', code: 'ec' },
]

export const ALL_NATIONS: Country[] = [
  { name: 'Albania', code: 'al' }, { name: 'Algeria', code: 'dz' }, { name: 'Angola', code: 'ao' },
  { name: 'Armenia', code: 'am' }, { name: 'Austria', code: 'at' }, { name: 'Azerbaijan', code: 'az' },
  { name: 'Bahrain', code: 'bh' }, { name: 'Bangladesh', code: 'bd' }, { name: 'Belarus', code: 'by' },
  { name: 'Bolivia', code: 'bo' }, { name: 'Bosnia & Herzegovina', code: 'ba' }, { name: 'Bulgaria', code: 'bg' },
  { name: 'Cameroon', code: 'cm' }, { name: 'Canada', code: 'ca' }, { name: 'Chile', code: 'cl' },
  { name: 'China', code: 'cn' }, { name: 'Costa Rica', code: 'cr' }, { name: 'Czech Republic', code: 'cz' },
  { name: 'DR Congo', code: 'cd' }, { name: 'Egypt', code: 'eg' }, { name: 'El Salvador', code: 'sv' },
  { name: 'Estonia', code: 'ee' }, { name: 'Finland', code: 'fi' }, { name: 'Georgia', code: 'ge' },
  { name: 'Ghana', code: 'gh' }, { name: 'Greece', code: 'gr' }, { name: 'Guatemala', code: 'gt' },
  { name: 'Honduras', code: 'hn' }, { name: 'Hungary', code: 'hu' }, { name: 'Iceland', code: 'is' },
  { name: 'India', code: 'in' }, { name: 'Indonesia', code: 'id' }, { name: 'Iran', code: 'ir' },
  { name: 'Iraq', code: 'iq' }, { name: 'Ireland', code: 'ie' }, { name: 'Israel', code: 'il' },
  { name: 'Jamaica', code: 'jm' }, { name: 'Jordan', code: 'jo' }, { name: 'Kazakhstan', code: 'kz' },
  { name: 'Kenya', code: 'ke' }, { name: 'Kosovo', code: 'xk' }, { name: 'Kuwait', code: 'kw' },
  { name: 'Kyrgyzstan', code: 'kg' }, { name: 'Latvia', code: 'lv' }, { name: 'Lebanon', code: 'lb' },
  { name: 'Liechtenstein', code: 'li' }, { name: 'Lithuania', code: 'lt' }, { name: 'Luxembourg', code: 'lu' },
  { name: 'Malaysia', code: 'my' }, { name: 'Malta', code: 'mt' }, { name: 'Moldova', code: 'md' },
  { name: 'Monaco', code: 'mc' }, { name: 'Mongolia', code: 'mn' }, { name: 'Montenegro', code: 'me' },
  { name: 'Mozambique', code: 'mz' }, { name: 'N. Macedonia', code: 'mk' }, { name: 'New Zealand', code: 'nz' },
  { name: 'Nicaragua', code: 'ni' }, { name: 'Northern Ireland', code: 'gb-nir' }, { name: 'Norway', code: 'no' },
  { name: 'Nepal', code: 'np' }, { name: 'Oman', code: 'om' }, { name: 'Pakistan', code: 'pk' },
  { name: 'Panama', code: 'pa' }, { name: 'Paraguay', code: 'py' }, { name: 'Peru', code: 'pe' },
  { name: 'Philippines', code: 'ph' }, { name: 'Qatar', code: 'qa' }, { name: 'Romania', code: 'ro' },
  { name: 'Russia', code: 'ru' }, { name: 'Rwanda', code: 'rw' }, { name: 'Saudi Arabia', code: 'sa' },
  { name: 'Singapore', code: 'sg' }, { name: 'Slovakia', code: 'sk' }, { name: 'Slovenia', code: 'si' },
  { name: 'South Africa', code: 'za' }, { name: 'Sri Lanka', code: 'lk' }, { name: 'Sweden', code: 'se' },
  { name: 'Syria', code: 'sy' }, { name: 'Tajikistan', code: 'tj' }, { name: 'Thailand', code: 'th' },
  { name: 'Trinidad & Tobago', code: 'tt' }, { name: 'Tunisia', code: 'tn' }, { name: 'Turkmenistan', code: 'tm' },
  { name: 'Uganda', code: 'ug' }, { name: 'United Arab Emirates', code: 'ae' },
  { name: 'United Kingdom', code: 'gb' }, { name: 'Uzbekistan', code: 'uz' }, { name: 'Venezuela', code: 've' },
  { name: 'Vietnam', code: 'vn' }, { name: 'Vatican City', code: 'va' }, { name: 'Zambia', code: 'zm' },
  { name: 'Zimbabwe', code: 'zw' },
].sort((a, b) => a.name.localeCompare(b.name))
