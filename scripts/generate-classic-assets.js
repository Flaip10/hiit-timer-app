#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const PROJECT_ROOT = process.cwd();
const ASSETS_DIR = path.join(PROJECT_ROOT, 'assets', 'generated', 'classic');
const VIEWBOX_SIZE = 512;
const OUTPUT_SIZE = 1024;

const CLASSIC_ACCENT = {
    primary: '#D7C19A',
    background: '#ffffff',
    darkInk: '#23272A',
};

const THEME = {
    light: {
        base: CLASSIC_ACCENT.background,
        ink: CLASSIC_ACCENT.darkInk,
        accent: CLASSIC_ACCENT.primary,
    },
    dark: {
        base: CLASSIC_ACCENT.darkInk,
        ink: CLASSIC_ACCENT.background,
        accent: CLASSIC_ACCENT.primary,
    },
};

const LOGO = {
    cx: 256,
    cy: 300,
    rOuter: 200,
    rInner: 155,
    darkStartDeg: 240,
    progressEndDeg: 120,
    splitDeg: 33,
    separatorGapDeg: 8,
    separatorGapPx: 6,
    innerPath:
        'M 141.06,301.06 A 100.00,100.00 0 1 1 370.94,301.06 L 346.21,300 A 100.00,60.00 0 0 0 165.79,300 Z',
};

const degToRad = (deg) => ((deg - 90) * Math.PI) / 180;
const normalizeDeg = (deg) => ((deg % 360) + 360) % 360;
const positiveSweepDeg = (startDeg, endDeg) =>
    (((endDeg - startDeg) % 360) + 360) % 360;

const polar = (cx, cy, r, deg) => {
    const theta = degToRad(deg);
    return {
        x: cx + r * Math.cos(theta),
        y: cy + r * Math.sin(theta),
    };
};

const arcRingPath = ({ cx, cy, rOuter, rInner, startDeg, endDeg }) => {
    const sweep = positiveSweepDeg(startDeg, endDeg);
    const largeArcFlag = sweep > 180 ? 1 : 0;

    const p0 = polar(cx, cy, rOuter, startDeg);
    const p1 = polar(cx, cy, rOuter, endDeg);
    const p2 = polar(cx, cy, rInner, endDeg);
    const p3 = polar(cx, cy, rInner, startDeg);

    return [
        `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}`,
        `A ${rOuter.toFixed(2)} ${rOuter.toFixed(2)} 0 ${largeArcFlag} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
        `L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
        `A ${rInner.toFixed(2)} ${rInner.toFixed(2)} 0 ${largeArcFlag} 0 ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
        'Z',
    ].join(' ');
};

const getChromeBin = () => {
    const fromEnv = process.env.CHROME_BIN;
    if (fromEnv && fs.existsSync(fromEnv)) {
        return fromEnv;
    }

    const candidates = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
    ];

    return candidates.find((candidate) => fs.existsSync(candidate));
};

const buildLogoPaths = () => {
    const midRadius = (LOGO.rOuter + LOGO.rInner) / 2;
    const gapDegFromPx = (LOGO.separatorGapPx / midRadius) * (180 / Math.PI);
    const totalGapDeg = Math.max(0, LOGO.separatorGapDeg + gapDegFromPx);
    const halfGap = totalGapDeg / 2;

    const darkEndDeg = normalizeDeg(LOGO.splitDeg - halfGap);
    const progressStartDeg = normalizeDeg(LOGO.splitDeg + halfGap);

    return {
        darkOuterPath: arcRingPath({
            cx: LOGO.cx,
            cy: LOGO.cy,
            rOuter: LOGO.rOuter,
            rInner: LOGO.rInner,
            startDeg: LOGO.darkStartDeg,
            endDeg: darkEndDeg,
        }),
        progressOuterPath: arcRingPath({
            cx: LOGO.cx,
            cy: LOGO.cy,
            rOuter: LOGO.rOuter,
            rInner: LOGO.rInner,
            startDeg: progressStartDeg,
            endDeg: LOGO.progressEndDeg,
        }),
    };
};

const buildSvg = (params) => {
    const {
        withBackground,
        background,
        roundedBackground,
        roundedRadius,
        darkColor,
        progressColor,
        innerColor,
        logoScale = 1,
        logoTranslateY = 0,
    } = params;
    const { darkOuterPath, progressOuterPath } = buildLogoPaths();

    const backgroundNode = withBackground
        ? roundedBackground
            ? `<rect width="${VIEWBOX_SIZE}" height="${VIEWBOX_SIZE}" rx="${roundedRadius}" ry="${roundedRadius}" fill="${background}" />`
            : `<rect width="${VIEWBOX_SIZE}" height="${VIEWBOX_SIZE}" fill="${background}" />`
        : '';

    const logoGroupTransform = `translate(${VIEWBOX_SIZE / 2} ${VIEWBOX_SIZE / 2}) scale(${logoScale}) translate(-${VIEWBOX_SIZE / 2} -${VIEWBOX_SIZE / 2}) translate(0 ${logoTranslateY})`;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${OUTPUT_SIZE}" height="${OUTPUT_SIZE}" viewBox="0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}">${backgroundNode}<g transform="${logoGroupTransform}"><path d="${darkOuterPath}" fill="${darkColor}" /><path d="${progressOuterPath}" fill="${progressColor}" /><path d="${LOGO.innerPath}" fill="${innerColor}" /></g></svg>`;
};

const writeHtml = (name, svg, backgroundColor) => {
    const filePath = path.join(ASSETS_DIR, `${name}.html`);
    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      html, body {
        width: ${OUTPUT_SIZE}px;
        height: ${OUTPUT_SIZE}px;
        overflow: hidden;
        background: ${backgroundColor};
        line-height: 0;
        font-size: 0;
      }
      svg {
        position: fixed;
        top: 0;
        left: 0;
        display: block;
        width: ${OUTPUT_SIZE}px;
        height: ${OUTPUT_SIZE}px;
      }
    </style>
  </head>
  <body>
${svg}
  </body>
</html>
`;
    fs.writeFileSync(filePath, html);
    return filePath;
};

const renderPng = (chromeBin, htmlPath, pngPath, transparentBackground) => {
    const args = [
        '--headless',
        '--disable-gpu',
        '--force-device-scale-factor=1',
        '--hide-scrollbars',
        `--window-size=${OUTPUT_SIZE},${OUTPUT_SIZE}`,
        `--screenshot=${pngPath}`,
    ];

    if (transparentBackground) {
        args.push('--default-background-color=00000000');
    }

    args.push(`file://${htmlPath}`);

    execFileSync(chromeBin, args, { stdio: 'ignore' });
};

const main = () => {
    const chromeBin = getChromeBin();
    if (!chromeBin) {
        throw new Error(
            'Chrome/Chromium not found. Set CHROME_BIN to a headless-capable browser binary.'
        );
    }

    fs.mkdirSync(ASSETS_DIR, { recursive: true });

    const files = [
        {
            name: 'icon-light',
            svg: buildSvg({
                withBackground: true,
                background: THEME.light.base,
                roundedBackground: false,
                roundedRadius: 0,
                darkColor: THEME.light.ink,
                progressColor: THEME.light.accent,
                innerColor: THEME.light.ink,
            }),
            transparent: false,
            pageBackground: THEME.light.base,
        },
        {
            name: 'icon-dark',
            svg: buildSvg({
                withBackground: true,
                background: THEME.dark.base,
                roundedBackground: false,
                roundedRadius: 0,
                darkColor: THEME.dark.ink,
                progressColor: THEME.dark.accent,
                innerColor: THEME.dark.ink,
            }),
            transparent: false,
            pageBackground: THEME.dark.base,
        },
        {
            name: 'icon-tinted',
            svg: buildSvg({
                withBackground: true,
                background: CLASSIC_ACCENT.primary,
                roundedBackground: false,
                roundedRadius: 0,
                darkColor: CLASSIC_ACCENT.darkInk,
                progressColor: CLASSIC_ACCENT.background,
                innerColor: CLASSIC_ACCENT.darkInk,
            }),
            transparent: false,
            pageBackground: CLASSIC_ACCENT.primary,
        },
        {
            name: 'splash-light',
            svg: buildSvg({
                withBackground: false,
                background: THEME.light.base,
                roundedBackground: false,
                roundedRadius: 0,
                darkColor: THEME.light.ink,
                progressColor: THEME.light.accent,
                innerColor: THEME.light.ink,
                logoScale: 0.74,
                logoTranslateY: -20,
            }),
            transparent: true,
            pageBackground: 'transparent',
        },
        {
            name: 'splash-dark',
            svg: buildSvg({
                withBackground: false,
                background: THEME.dark.base,
                roundedBackground: false,
                roundedRadius: 0,
                darkColor: THEME.dark.ink,
                progressColor: THEME.dark.accent,
                innerColor: THEME.dark.ink,
                logoScale: 0.74,
                logoTranslateY: -20,
            }),
            transparent: true,
            pageBackground: 'transparent',
        },
        {
            name: 'adaptive-foreground',
            svg: buildSvg({
                withBackground: false,
                background: THEME.light.base,
                roundedBackground: false,
                roundedRadius: 0,
                darkColor: THEME.light.ink,
                progressColor: THEME.light.accent,
                innerColor: THEME.light.ink,
                logoScale: 0.58,
                logoTranslateY: -20,
            }),
            transparent: true,
            pageBackground: 'transparent',
        },
        {
            name: 'adaptive-monochrome',
            svg: buildSvg({
                withBackground: false,
                background: THEME.light.base,
                roundedBackground: false,
                roundedRadius: 0,
                darkColor: CLASSIC_ACCENT.darkInk,
                progressColor: CLASSIC_ACCENT.darkInk,
                innerColor: CLASSIC_ACCENT.darkInk,
                logoScale: 0.58,
                logoTranslateY: -20,
            }),
            transparent: true,
            pageBackground: 'transparent',
        },
    ];

    files.forEach((asset) => {
        const htmlPath = writeHtml(asset.name, asset.svg, asset.pageBackground);
        const pngPath = path.join(ASSETS_DIR, `${asset.name}.png`);
        renderPng(chromeBin, htmlPath, pngPath, asset.transparent);
        console.log(`generated: ${path.relative(PROJECT_ROOT, pngPath)}`);
    });
};

main();
