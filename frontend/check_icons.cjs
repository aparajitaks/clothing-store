const lucide = require('lucide-react');

const icons = [
  'ShieldCheck','Truck','ArrowRight','Lock','Loader2','AlertCircle','Tag','X',
  'Trash2','Plus','Minus','ShoppingBag','CheckCircle',
  'Mail','User','Loader',
  'Package','Calendar','ChevronRight',
  'CheckCircle2','Clock',
  'RotateCcw',
  'Phone','LogOut','Shield','Save',
  'MapPin','XCircle',
  'RefreshCw','Award',
  'Sparkles',
  'Ruler',
  'Send',
  'ChevronDown','ChevronUp',
  'SlidersHorizontal','ArrowUpDown',
  'Compass',
  'ArrowLeft',
  'TrendingUp','AlertTriangle','Eye',
  'ToggleLeft','ToggleRight','Copy',
  'TrendingDown','Edit2','Check',
  'Filter',
  'Heart','Menu','Share2','Star',
  'LayoutDashboard','Warehouse'
];

const unique = [...new Set(icons)];
const missing = unique.filter(n => typeof lucide[n] !== 'function');
const found = unique.filter(n => typeof lucide[n] === 'function');

console.log('TOTAL UNIQUE ICONS:', unique.length);
console.log('FOUND:', found.length);
console.log('MISSING:', missing.length);
if (missing.length) {
  console.log('MISSING ICON NAMES:', JSON.stringify(missing, null, 2));
  const allFuncs = Object.keys(lucide).filter(k => typeof lucide[k] === 'function');
  console.log('\nAll available exports (sample 80):', allFuncs.slice(0, 80));
  // Also search for similar names
  console.log('\n--- Similar name suggestions ---');
  missing.forEach(m => {
    const lower = m.toLowerCase();
    const similars = allFuncs.filter(f => {
      const fl = f.toLowerCase();
      return fl.includes(lower.slice(0, 6)) || lower.includes(fl.slice(0, 6)) ||
        Math.abs(f.length - m.length) <= 3;
    }).slice(0, 5);
    console.log(`  ${m} -> maybe:`, similars);
  });
} else {
  console.log('All icons verified OK');
}
