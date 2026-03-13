import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'posts');
const OUT_DIR = path.join(ROOT, 'public', 'api');
const IMAGES_OUT = path.join(ROOT, 'public', 'images');

function formatDateToYMD(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function stripMarkdown(md) {
  // very small heuristic stripper for excerpt generation
  return md
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/<[^>]+>/g, '') // html tags
    .replace(/!\[[^\]]*\]\([^\)]+\)/g, '') // images
    .replace(/\[[^\]]+\]\([^\)]+\)/g, '') // links
    .replace(/[#>*`~\-]{1,}/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function analyzeContentQuality(content) {
  const warnings = [];

  const MAX_LINE_LENGTH = 180;
  const MAX_CODEBLOCK_LINES = 120;
  const MAX_TABLE_COLUMNS = 7;

  const lines = content.split('\n');

  let longestLineLength = 0;
  let longestLineNumber = -1;
  lines.forEach((line, index) => {
    const len = line.length;
    if (len > longestLineLength) {
      longestLineLength = len;
      longestLineNumber = index + 1;
    }
  });

  if (longestLineLength > MAX_LINE_LENGTH) {
    warnings.push(
      `긴 단일 행 감지: ${longestLineLength}자 (line ${longestLineNumber}, 권장 <= ${MAX_LINE_LENGTH})`
    );
  }

  const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
  let largestCodeBlockLines = 0;
  codeBlocks.forEach((block) => {
    const blockLineCount = Math.max(0, block.split('\n').length - 2);
    if (blockLineCount > largestCodeBlockLines) {
      largestCodeBlockLines = blockLineCount;
    }
  });
  if (largestCodeBlockLines > MAX_CODEBLOCK_LINES) {
    warnings.push(
      `대형 코드블록 감지: 최대 ${largestCodeBlockLines}줄 (권장 <= ${MAX_CODEBLOCK_LINES})`
    );
  }

  let maxTableColumns = 0;
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed.includes('|')) return;
    const columnCount = trimmed
      .split('|')
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0).length;
    if (columnCount > maxTableColumns) {
      maxTableColumns = columnCount;
    }
  });
  if (maxTableColumns > MAX_TABLE_COLUMNS) {
    warnings.push(
      `대형 표 감지: 최대 ${maxTableColumns}열 (권장 <= ${MAX_TABLE_COLUMNS})`
    );
  }

  return warnings;
}

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    // ignore
  }
}

async function copyImageIfLocal(mdFileDir, imgPath, outPrefix) {
  if (/^https?:\/\//i.test(imgPath)) return imgPath; // external
  const src = path.resolve(mdFileDir, imgPath);
  try {
    const stat = await fs.stat(src);
    if (!stat.isFile()) return null;
  } catch (e) {
    return null;
  }
  const base = path.basename(imgPath);
  const safeName = `${outPrefix}-${Date.now()}-${base}`;
  const dest = path.join(IMAGES_OUT, safeName);
  await fs.copyFile(src, dest);
  return `/images/${safeName}`;
}

async function walkPosts(dir) {
  const categories = await fs.readdir(dir, { withFileTypes: true });
  const posts = [];
  for (const catEnt of categories) {
    if (!catEnt.isDirectory()) continue;
    const category = catEnt.name.toLowerCase();
    const catDir = path.join(dir, catEnt.name);
    const files = await fs.readdir(catDir, { withFileTypes: true });
    for (const f of files) {
      if (!f.isFile()) continue;
      if (!/\.mdx?$/.test(f.name)) continue;
      const filePath = path.join(catDir, f.name);
      let raw = await fs.readFile(filePath, 'utf-8');
      // support files that have YAML-like header without leading '---' but with a trailing '---' line
      if (!raw.trimStart().startsWith('---')) {
        const idx = raw.indexOf('\n---\n');
        const idxR = raw.indexOf('\n---\r\n');
        const sepIndex = idx !== -1 ? idx : (idxR !== -1 ? idxR : -1);
        if (sepIndex > -1) {
          const header = raw.slice(0, sepIndex);
          const rest = raw.slice(sepIndex + 5);
          raw = `---\n${header}\n---\n${rest}`;
        }
      }
      const { data, content } = matter(raw);
      const qualityWarnings = analyzeContentQuality(content);
      if (qualityWarnings.length > 0) {
        const relativePath = path.relative(ROOT, filePath);
        qualityWarnings.forEach((message) => {
          console.warn(`[content-quality] ${relativePath}: ${message}`);
        });
      }

      const filenameSlug = f.name.replace(/\.mdx?$/, '');
      const slug = (data.slug && String(data.slug).trim()) || filenameSlug;
      const id = `${category}/${slug}`;
      const title = data.title || filenameSlug;

      // excerpt: frontmatter > first paragraph
      let excerpt = '';
      if (data.excerpt) excerpt = String(data.excerpt).trim();
      else {
        const text = stripMarkdown(content);
        const firstPara = text.split('\n').find((s) => s.trim().length > 0) || '';
        excerpt = firstPara.length > 160 ? `${firstPara.slice(0, 157)}...` : firstPara;
      }

      // image handling: prefer frontmatter.image, else first image in content
      let imageUrl = '';
      const mdFileDir = path.dirname(filePath);
      if (data.image) {
        const copied = await copyImageIfLocal(mdFileDir, String(data.image), `${category}-${slug}`);
        imageUrl = copied || String(data.image);
      } else {
        const m = content.match(/!\[[^\]]*\]\(([^\)]+)\)/);
        if (m) {
          const copied = await copyImageIfLocal(mdFileDir, m[1], `${category}-${slug}`);
          imageUrl = copied || m[1];
        }
      }

      // date handling
      const rawDate = data.date || null;
      const publishedAt = rawDate ? formatDateToYMD(rawDate) : formatDateToYMD((await fs.stat(filePath)).mtime);

      // tags handling: support both `tags: [...]` array and legacy `tag: string`
      let tags = [];
      if (Array.isArray(data.tags)) {
        tags = data.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean);
      } else if (data.tag) {
        tags = [String(data.tag).trim().toLowerCase()];
      }

      // series handling
      const series = data.series ? String(data.series).trim() : null;
      const seriesOrder = data.seriesOrder ? Number(data.seriesOrder) : null;

      const post = {
        id,
        slug,
        title,
        excerpt,
        imageUrl: imageUrl || '',
        author: { name: (data.author && data.author.name) || data.author || 'Unknown' },
        publishedAt: publishedAt || formatDateToYMD(new Date()),
        likes: Number(data.likes || 0),
        comments: Number(data.comments || 0),
        category,
        tags,
        series,
        seriesOrder,
        content, // raw markdown body for detail page
      };

      posts.push(post);
    }
  }
  return posts;
}

async function main() {
  await ensureDir(OUT_DIR);
  await ensureDir(IMAGES_OUT);
  const posts = await walkPosts(POSTS_DIR);
  // sort by publishedAt desc
  posts.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

  // Write per-post JSON files for detail page (including content)
  const postsDir = path.join(OUT_DIR, 'posts');
  await ensureDir(postsDir);
  for (const p of posts) {
    const perPostPath = path.join(postsDir, `${p.category}--${p.slug}.json`);
    await fs.writeFile(perPostPath, JSON.stringify(p, null, 2), 'utf-8');
  }
  console.log(`Wrote ${posts.length} per-post JSON files to ${postsDir}`);

  // Collect all unique tags
  const allTagsSet = new Set();
  for (const p of posts) {
    for (const tag of p.tags || []) {
      allTagsSet.add(tag);
    }
  }
  const allTags = Array.from(allTagsSet).sort();

  // Build series index by category
  const seriesByCategory = {};
  for (const p of posts) {
    if (p.series && p.seriesOrder != null) {
      if (!seriesByCategory[p.category]) {
        seriesByCategory[p.category] = {};
      }
      if (!seriesByCategory[p.category][p.series]) {
        seriesByCategory[p.category][p.series] = [];
      }
      seriesByCategory[p.category][p.series].push({
        id: p.id,
        slug: p.slug,
        title: p.title,
        seriesOrder: p.seriesOrder,
      });
    }
  }

  // Sort series posts by seriesOrder
  for (const category in seriesByCategory) {
    for (const seriesName in seriesByCategory[category]) {
      seriesByCategory[category][seriesName].sort((a, b) => a.seriesOrder - b.seriesOrder);
    }
  }

  // Write summary list (without content) for list pages
  const listItems = posts.map(({ content, ...rest }) => rest);
  const out = { items: listItems, total: listItems.length, allTags, seriesByCategory };
  const outPath = path.join(OUT_DIR, 'posts.json');
  await fs.writeFile(outPath, JSON.stringify(out, null, 2), 'utf-8');
  console.log(`Wrote posts list to ${outPath} (${allTags.length} unique tags)`);
  console.log('Tags:', allTags.join(', '));
  
  // Log series information
  const seriesCount = Object.values(seriesByCategory).reduce(
    (acc, cat) => acc + Object.keys(cat).length,
    0
  );
  console.log(`Found ${seriesCount} series across ${Object.keys(seriesByCategory).length} categories`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
