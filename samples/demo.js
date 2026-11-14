// Plain JavaScript sample
const cache = new Map();
const { name, tags = [] } = { name: 'msilabs', tags: ['theme', 'dark'] };

const double = (n) => n * 2;

function describe(value) {
  if (typeof value === 'number') return `number ${double(value)}`;
  if (value === null || value === undefined) return 'nothing';
  return String(value);
}

for (const tag of tags) {
  cache.set(tag, tag.length);
  console.log(describe(cache.get(tag)), true, 42, 3.14);
}

class Counter {
  #count = 0;

  increment() {
    this.#count += 1;
    return this.#count;
  }
}

console.log(name, new Counter().increment());
