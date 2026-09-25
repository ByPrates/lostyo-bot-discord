// Status aleatórios da rotação (sem emoji, texto simples).
// Metade vem da lista local (frases multilíngues), metade de API grátis sem chave (wttr.in).
const CITIES = [
    'Tokyo', 'London', 'Paris', 'New York', 'Berlin', 'Madrid',
    'Rome', 'Seoul', 'Sydney', 'Toronto', 'Amsterdam', 'Lisbon',
];

// Lista local — fallback imediato se a API falhar. Pode crescer à vontade.
const PHRASES = [
    // English
    'Coffee first, code later',
    'Ship it',
    'Less is more',
    'Stay curious',
    'Read the docs',
    'It works on my machine',
    'One more commit',
    'Touch grass occasionally',
    'RTFM friendly edition',
    '404 motivation not found',
    'Powered by caffeine',
    'Keep it simple',
    // Português
    'Café passado, código feito',
    'Menos é mais',
    'Bora codar',
    'Sem pressa, sem pausa',
    'Feito é melhor que perfeito',
    'A pressa é inimiga do deploy',
    // Español
    'Menos es más',
    'Vamos a programar',
    'La calma antes del deploy',
    // Français
    'Moins c\'est plus',
    'Restez curieux',
    // Deutsch
    'Weniger ist mehr',
    'Bleib neugierig',
    // Italiano
    'Meno è di più',
    // 日本語
    '今日も頑張ろう',
    'シンプルが一番',
    // 한국어
    '오늘도 화이팅',
    // 中文
    '少即是多',
    // Facts
    'Honey never spoils',
    'Octopuses have 3 hearts',
    'Bananas are berries',
    'There are more stars than grains of sand',
    'Wombat poop is cube-shaped',
    'Sharks existed before trees',
    'A day on Venus is longer than its year',
    'Hot water can freeze faster than cold',
];

function randomOf(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// "In Tokyo is 23°C" via wttr.in (grátis, sem chave). Falha -> frase local.
async function cityWeather() {
    const city = randomOf(CITIES);
    try {
        const res = await fetch(`https://wttr.in/${city}?format=%t`, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) throw new Error('wttr');
        const temp = (await res.text()).trim().replace(/^\+/, '');
        if (!temp) throw new Error('empty');
        return `In ${city} is ${temp}`;
    } catch {
        return randomOf(PHRASES);
    }
}

async function getRandomStatus() {
    if (Math.random() < 0.5) return cityWeather();
    return randomOf(PHRASES);
}

module.exports = { getRandomStatus, PHRASES, CITIES };
