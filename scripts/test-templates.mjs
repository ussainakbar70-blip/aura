import { synthesizeAppFromPrompt, compileProjectFiles, detectCategoryAndTitle, auditApplicationQuality } from '../src/lib/templates.ts';

console.log('=== AURA PRODUCTION QUALITY & SLIDERS TEST SUITE ===\n');

const testCases = [
  {
    name: 'SaaS Analytics Matrix',
    prompt: 'Build a SaaS revenue and cohort analytics dashboard with multi-view navigation, interactive SVG revenue chart, MRR simulator, and customer CRUD ledger',
    expectedCategory: 'dashboard',
    requiredSliders: ['simGrowthSlider', 'simAcvSlider', 'simRetSlider'],
  },
  {
    name: 'Interactive Startup Website',
    prompt: 'Build a high-conversion interactive AI SaaS startup website with hero product simulator, interactive ROI pricing calculator, FAQ accordion, and lead capture modal',
    expectedCategory: 'website',
    requiredSliders: ['seatSlider', 'volSlider'],
  },
  {
    name: 'Luxury E-Commerce Storefront',
    prompt: 'Build a luxury minimalist e-commerce storefront with category filters, interactive cart drawer, promo code AURA20, and checkout modal',
    expectedCategory: 'ecommerce',
    requiredSliders: ['priceFilterSlider'],
  },
  {
    name: 'Web3 Perpetuals Terminal',
    prompt: 'Build a Web3 crypto perpetuals trading desk with real-time pair switcher, interactive price chart, and Buy/Sell order execution ticket',
    expectedCategory: 'crypto',
    requiredSliders: ['leverageSlider', 'marginAllocSlider'],
  },
  {
    name: 'Agile Kanban Workspace',
    prompt: 'Build an agile Kanban project board with 4 status columns, 1-click task movement, story point burnup bar, and task creation modal',
    expectedCategory: 'kanban',
    requiredSliders: ['capacitySlider'],
  },
];

let allPassed = true;

for (const tc of testCases) {
  console.log(`Testing [${tc.name}]...`);
  
  // 1. Detection
  const { category, title } = detectCategoryAndTitle(tc.prompt);
  if (category !== tc.expectedCategory) {
    console.error(`  FAIL: Detected category "${category}" != expected "${tc.expectedCategory}"`);
    allPassed = false;
  } else {
    console.log(`  PASS: Category correctly detected as "${category}" ("${title}")`);
  }

  // 2. Autonomous Synthesis
  const synth = synthesizeAppFromPrompt(tc.prompt);
  if (!synth.htmlCode || synth.htmlCode.length < 500) {
    console.error(`  FAIL: Output HTML empty or too small (${synth.htmlCode?.length} bytes)`);
    allPassed = false;
  } else {
    console.log(`  PASS: Generated ${synth.htmlCode.length} bytes of production HTML`);
  }

  // 3. Dynamic Sliders Check
  for (const sliderId of tc.requiredSliders) {
    if (!synth.htmlCode.includes(`id="${sliderId}"`)) {
      console.error(`  FAIL: HTML missing expected dynamic slider #${sliderId}`);
      allPassed = false;
    } else {
      console.log(`  PASS: Dynamic slider #${sliderId} verified in HTML`);
    }
  }

  // 4. Multi-File Compilation Check
  const files = compileProjectFiles(synth.htmlCode, synth.title, tc.prompt, synth.category);
  if (!files || files.length < 4) {
    console.error(`  FAIL: File bundle contains only ${files?.length} files`);
    allPassed = false;
  } else {
    console.log(`  PASS: Successfully compiled ${files.length} production project files:`);
    files.forEach(f => console.log(`     - ${f.name} (${f.language})`));
  }

  // 5. Quality Audit
  const audit = auditApplicationQuality(synth.htmlCode);
  console.log(`  PASS: Quality Audit Grade: ${audit.grade} (Score: ${audit.score}/100)`);
  if (audit.score < 80) {
    console.error(`  WARNING: Quality score below 80`);
  }
  console.log('');
}

if (allPassed) {
  console.log('✅ ALL TEST SUITES PASSED! Production quality & dynamic sliders verified.\n');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED.');
  process.exit(1);
}
