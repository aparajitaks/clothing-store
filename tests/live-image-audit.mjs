/**
 * Live Image Audit - Phase 1
 * Measures images on the live teyacollections.com site across three viewports.
 * Run with: node tests/live-image-audit.mjs
 */
import { chromium } from 'playwright';
import fs from 'fs';

const testResults = [];
const consoleErrors = [];

// Three viewports with specific devicePixelRatios
const viewports = [
  { name: 'desktop', width: 1280, height: 800, dpr: 1 },
  { name: 'iphone', width: 390, height: 844, dpr: 3 },
  { name: 'tablet', width: 768, height: 1024, dpr: 2 },
];

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dpr,
    });
    const page = await context.newPage();

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push({ page: vp.name, message: msg.text() });
      }
    });

    page.on('pageerror', err => {
      consoleErrors.push({ page: vp.name, message: err.message });
    });

    // Intercept failed requests
    page.on('requestfailed', req => {
      if (req.failure().errorText || req.failure().status) {
        consoleErrors.push({
          page: vp.name,
          type: 'requestfailed',
          url: req.url(),
          status: req.failure().status,
        });
      }
    });

    console.log(
      `\n=== Visiting https://teyacollections.com @ ${vp.name} (${vp.width}x${vp.height}, DPR=${vp.dpr}) ===`
    );
    await page.goto('https://teyacollections.com', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });

    // Wait for lazy images
    await page.waitForTimeout(2000);

    // Get all images and their attributes
    const images = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      const results = [];

      const imgsArray = Array.from(imgs);
      imgsArray.forEach(img => {
        const naturalWidth = img.naturalWidth || 0;
        const naturalHeight = img.naturalHeight || 0;
        const rect = img.getBoundingClientRect();
        const renderedWidth = Math.round(rect.width);
        const renderedHeight = Math.round(rect.height);
        const dpr = window.devicePixelRatio;
        const srcset = img.srcset || '';
        const sizes = img.sizes || '';
        const objectFit = img.style.objectFit || getComputedStyle(img).objectFit;
        const loading = img.getAttribute('loading');
        const computedStyle = getComputedStyle(img);
        const filter = computedStyle.filter;
        const transform = computedStyle.transform;
        const opacity = computedStyle.opacity;

        // Get parent transforms (up to 5 levels)
        let parentFilter = '';
        let parentTransform = '';
        let parentOpacity = '';
        let parent = img.parentElement;
        let parentDepth = 0;
        while (parent && parentDepth < 5) {
          const ps = getComputedStyle(parent);
          if (ps.filter !== 'none' && ps.filter !== '')
            parentFilter += ps.filter + '; ';
          if (ps.transform !== 'none' && ps.transform !== '')
            parentTransform += ps.transform + '; ';
          if (ps.opacity !== '1' && ps.opacity !== '')
            parentOpacity += ps.opacity + '; ';
          parent = parent.parentElement;
          parentDepth++;
        }

        // Check for blur in computed style
        const hasBlur = filter && filter.includes('blur(');
        const hasBackdropFilter = filter && filter.includes('backdrop-filter');
        const hasScale =
          transform && (transform.includes('scale(') || transform.includes('scale3d('));

        results.push({
          tagName: img.tagName,
          naturalWidth,
          naturalHeight,
          renderedWidth,
          renderedHeight,
          dpr,
          srcset,
          sizes,
          objectFit,
          loading,
          filter,
          transform,
          opacity,
          parentFilter,
          parentTransform,
          parentOpacity,
          hasBlur,
          hasBackdropFilter,
          hasScale,
        });
      });

      return results;
    });

    // Also check CSS background-images
    const backgroundImages = await page.evaluate(() => {
      const results = [];
      const elements = document.querySelectorAll('[style*="background-image"]');

      elements.forEach(el => {
        const style = el.getAttribute('style') || '';
        const bgImage = style.match(
          /background-image:\s*url\(['"]?([^'")]+)['"]?\)/i
        );
        const bgRepeat = style.match(/background-repeat:\s*([^;]+)/i);
        const bgSize = style.match(/background-size:\s*([^;]+)/i);

        let rect;
        try {
          rect = el.getBoundingClientRect();
        } catch (e) {
          rect = { width: 0, height: 0 };
        }

        results.push({
          tagName: el.tagName,
          backgroundImage: bgImage ? bgImage[1] : null,
          bgRepeat: bgRepeat ? bgRepeat[1] : '',
          bgSize: bgSize ? bgSize[1] : '',
          renderedWidth: Math.round(rect.width),
          renderedHeight: Math.round(rect.height),
        });
      });

      return results;
    });

    // For each image URL, fetch it and record details
    const imageDetails = await page.evaluate(async () => {
      const imgs = Array.from(document.querySelectorAll('img'));
      const results = [];

      // Get unique image URLs
      const uniqueUrls = [
        ...new Set(imgs.map(img => img.src || img.getAttribute('src'))),
      ];

      for (const url of uniqueUrls.slice(0, 30)) {
        // Limit to first 30 unique URLs
        try {
          const response = await fetch(url, { method: 'HEAD' });
          const contentType = response.headers.get('content-type') || '';
          const contentLength = response.headers.get('content-length') || '0';
          const cacheControl = response.headers.get('cache-control') || '';
          const urlObj = new URL(url);
          const params = {};
          const knownParams = ['w', 'width', 'q', 'quality', 'resize'];
          knownParams.forEach(p => {
            if (urlObj.searchParams.has(p)) {
              params[p] = urlObj.searchParams.get(p);
            }
          });

          results.push({
            url,
            contentType,
            contentLengthKB: Math.round((Number(contentLength) || 0) / 1024),
            cacheControl,
            ...params,
          });
        } catch (e) {
          results.push({
            url,
            error: e.message,
          });
        }
      }

      return results;
    });

    // Flag blurry images
    const blurryFlags = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      const flags = [];

      const imgsArray = Array.from(imgs);
      imgsArray.forEach(img => {
        const naturalWidth = img.naturalWidth || 0;
        const naturalHeight = img.naturalHeight || 0;
        const rect = img.getBoundingClientRect();
        const renderedWidth = Math.round(rect.width);
        const dpr = window.devicePixelRatio;

        // Blurry if naturalWidth < renderedWidth x devicePixelRatio
        const isBlurry = naturalWidth < renderedWidth * dpr;

        if (isBlurry) {
          flags.push({
            url: img.src || img.getAttribute('src'),
            naturalWidth,
            renderedWidth,
            dpr,
            reason: 'naturalWidth < renderedWidth x devicePixelRatio',
          });
        }
      });

      return flags;
    });

    // Store results
    testResults.push({
      viewport: vp.name,
      pageUrl: 'https://teyacollections.com',
      images,
      backgroundImages,
      blurryFlags,
      imageDetails,
    });

    // Discover category and product pages from home
    try {
      // Click on Shop navigation
      const shopClicked = await page.click('text=Shop', { timeout: 5000 });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Discover category links
      const categoryLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a')).filter(l => {
          return (
            l.href &&
            (l.href.includes('/collection') ||
              l.href.includes('/category') ||
              l.href.includes('/shop')) &&
              !l.href.includes('javascript:')
          );
        });
        return links.map(l => ({ text: l.textContent.trim(), href: l.href }));
      });

      // Follow a few category links to discover product pages
      if (categoryLinks.length > 0) {
        // Try the first category link
        await page.goto(categoryLinks[0].href, {
          waitUntil: 'networkidle',
          timeout: 60000,
        });
        await page.waitForTimeout(2000);

        // Find product links on category page
        const productLinks = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*="/product"]')).filter(
            l => l.href && !l.href.includes('javascript:')
          );
          return links.map(l => ({ text: l.textContent.trim(), href: l.href }));
        });

        // Visit up to 5 product detail pages
        const productLimit = Math.min(5, productLinks.length);
        for (let i = 0; i < productLimit; i++) {
          const productUrl = productLinks[i].href;
          try {
            await page.goto(productUrl, {
              waitUntil: 'networkidle',
              timeout: 60000,
            });
            await page.waitForTimeout(2000);
          } catch (e) {
            console.log(`Error visiting product ${i} (${productUrl}):`, e.message);
          }
        }
      }
    } catch (e) {
      console.log('Discovery error:', e.message);
    }

    await context.close();
  }

  await browser.close();

  // Output results
  const output = {
    testResults,
    consoleErrors: consoleErrors.slice(0, 100),
  };

  const outputPath = '/tmp/live-image-audit-results.json';
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log('\nAudit results written to', outputPath);

  // Print summary table
  console.log('\n=== BLURRY IMAGE SUMMARY ===');
  let totalBlurry = 0;
  for (const tr of testResults) {
    const blurryCount = tr.blurryFlags.length;
    totalBlurry += blurryCount;
    console.log(
      `\n${tr.viewport} (${tr.pageUrl}): ${blurryCount} blurry images`
    );
    tr.blurryFlags.forEach(f => {
      console.log(
        `  - ${f.url}: natural${f.naturalWidth}x${f.naturalHeight} rendered${f.renderedWidth}x${f.renderedHeight} DPR${f.dpr} => ${f.reason}`
      );
    });
  }
  console.log(`\nTotal blurry images: ${totalBlurry}`);

  // Print console errors
  console.log('\n=== CONSOLE ERRORS ===');
  consoleErrors.forEach(e => {
    console.log(
      `[${e.page}] ${e.message} ${e.type ? `- ${e.type}` : ''} ${e.url ? `- ${e.url}` : ''}`
    );
  });

  // Print blurry image table
  console.log('\n=== BLURRY IMAGE TABLE ===');
  console.log(
    'page | image URL | natural size | rendered size | DPR | verdict | reason'
  );
  for (const tr of testResults) {
    for (const f of tr.blurryFlags) {
      const verdict = f.naturalWidth < f.renderedWidth * f.dpr ? 'BLURRY' : 'SHARP';
      console.log(
        `${tr.viewport} | ${f.url} | ${f.naturalWidth}x${f.naturalHeight} | ${f.renderedWidth}x${f.renderedHeight} | ${f.dpr} | ${verdict} | ${f.reason}`
      );
    }
  }

  // Also check for non-blurry issues
  console.log('\n=== IMAGE ATTRIBUTE SUMMARY ===');
  for (const tr of testResults) {
    console.log(`\n${tr.viewport}:`);
    tr.images.forEach(img => {
      const issues = [];
      if (img.hasBlur) issues.push('blur() filter');
      if (img.hasBackdropFilter) issues.push('backdrop-filter');
      if (img.hasScale) issues.push('scale() > 1');
      if (!img.sizes) issues.push('missing sizes attr');
      if (!img.srcset) issues.push('missing srcset attr');
      if (issues.length > 0) {
        console.log(
          `  ${img.tagName}[${img.naturalWidth}x${img.naturalHeight}@DPR${img.dpr}] ${img.url?.slice(0, 50)} ... issues: ${issues.join(', ')}`
        );
      }
    });
  }
})();