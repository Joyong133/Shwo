// 메타 퀘스트용 서명 APK 빌드 파이프라인
//   Meta 공식 Bubblewrap 포크(@meta-quest/bubblewrap-cli)로 "Horizon OS PWA(TWA)" APK를 만든다.
//   → 앱은 Meta Quest Browser 엔진 위에서 실행되므로 WebXR immersive-vr / 6DoF 컨트롤러가 그대로 동작한다.
//
// 사용법
//   node scripts/build-apk.mjs key                      # 키스토어 생성 + public/.well-known/assetlinks.json 생성
//   node scripts/build-apk.mjs build --url=https://<배포주소>/   # busan-vr.apk 생성
// 옵션 / 환경변수
//   --url / PWA_URL            배포된 PWA 주소 (https, 끝에 /)
//   --mode / APP_MODE          immersive(기본: 실행 즉시 VR 앱) | 2D (패널 앱, "VR 시작" 버튼으로 진입)
//   --package / APP_PACKAGE    안드로이드 패키지 ID (기본 kr.busanvr.app)
//   --version / APP_VERSION    버전 이름 (기본 package.json version), --code / APP_VERSION_CODE 버전 코드
//   BUBBLEWRAP_KEYSTORE_PASSWORD, BUBBLEWRAP_KEY_PASSWORD   키스토어 비밀번호 (기본 busanvr1234)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const androidDir = path.join(root, 'android');
const keystorePath = path.join(androidDir, 'busan-vr.keystore');
const KEY_ALIAS = 'busanvr';
const isWin = process.platform === 'win32';

const args = Object.fromEntries(
  process.argv.slice(3).map((a) => {
    const m = /^--([^=]+)(?:=(.*))?$/.exec(a);
    return m ? [m[1], m[2] ?? 'true'] : [a, 'true'];
  }),
);
const command = process.argv[2] || 'build';
const pkgJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const PACKAGE_ID = args.package || process.env.APP_PACKAGE || 'kr.busanvr.app';
const APP_MODE = args.mode || process.env.APP_MODE || 'immersive';
const APP_VERSION = args.version || process.env.APP_VERSION || pkgJson.version;
const APP_VERSION_CODE = Number(args.code || process.env.APP_VERSION_CODE || 1);
const KS_PASS = process.env.BUBBLEWRAP_KEYSTORE_PASSWORD || 'busanvr1234';
const KEY_PASS = process.env.BUBBLEWRAP_KEY_PASSWORD || KS_PASS;

const log = (msg) => console.log(`\x1b[36m[apk]\x1b[0m ${msg}`);
const fail = (msg) => {
  console.error(`\x1b[31m[apk] 오류:\x1b[0m ${msg}`);
  process.exit(1);
};

const bubblewrapBin = path.join(root, 'node_modules', '@meta-quest', 'bubblewrap-cli', 'bin', 'bubblewrap.js');

function runBubblewrap(bwArgs, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [bubblewrapBin, ...bwArgs], {
      cwd,
      stdio: 'inherit',
      env: {
        ...process.env,
        BUBBLEWRAP_KEYSTORE_PASSWORD: KS_PASS,
        BUBBLEWRAP_KEY_PASSWORD: KEY_PASS,
      },
    });
    child.on('error', reject);
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`bubblewrap ${bwArgs[0]} 실패 (exit ${code})`))));
  });
}

// ───────────── 1) JDK 17 + Android SDK (Bubblewrap이 ~/.bubblewrap 에 자동 설치) ─────────────
function readBubblewrapConfig() {
  const file = path.join(os.homedir(), '.bubblewrap', 'config.json');
  if (!fs.existsSync(file)) return null;
  try {
    const cfg = JSON.parse(fs.readFileSync(file, 'utf8'));
    return cfg.jdkPath && cfg.androidSdkPath ? cfg : null;
  } catch {
    return null;
  }
}

async function ensureToolchain() {
  if (!fs.existsSync(bubblewrapBin)) fail('@meta-quest/bubblewrap-cli 가 없습니다. 먼저 `npm install` 을 실행하세요.');
  let cfg = readBubblewrapConfig();
  if (!cfg) {
    log('JDK 17 / Android SDK 설정이 없습니다. Bubblewrap 설치 마법사를 실행합니다.');
    log('  → 두 질문 모두 Y(자동 설치)로 답하고, Android SDK 약관에 동의(y)하세요.');
    await runBubblewrap(['doctor'], root).catch(() => {});
    cfg = readBubblewrapConfig();
    if (!cfg) fail('JDK/Android SDK 설정을 완료하지 못했습니다. `npx bubblewrap doctor` 를 직접 실행해 보세요.');
  }
  const javaHome = process.platform === 'darwin' && fs.existsSync(path.join(cfg.jdkPath, 'Contents', 'Home'))
    ? path.join(cfg.jdkPath, 'Contents', 'Home')
    : cfg.jdkPath;
  const keytool = path.join(javaHome, 'bin', isWin ? 'keytool.exe' : 'keytool');
  if (!fs.existsSync(keytool)) fail(`keytool 을 찾을 수 없습니다: ${keytool}`);
  return { cfg, javaHome, keytool };
}

// ───────────── 2) 서명 키스토어 + Digital Asset Links ─────────────
function ensureKeystore(keytool) {
  fs.mkdirSync(androidDir, { recursive: true });
  if (!fs.existsSync(keystorePath)) {
    log(`서명 키스토어 생성: ${path.relative(root, keystorePath)} (alias=${KEY_ALIAS})`);
    const r = spawnSync(keytool, [
      '-genkeypair', '-dname', 'cn=Busan VR, ou=Dev, o=BusanVR, c=KR',
      '-alias', KEY_ALIAS, '-keyalg', 'RSA', '-keysize', '2048', '-validity', '20000',
      '-keystore', keystorePath, '-storepass', KS_PASS, '-keypass', KEY_PASS,
    ], { encoding: 'utf8' });
    if (r.status !== 0) fail(`keytool 실패: ${r.stderr || r.stdout}`);
    if (KS_PASS === 'busanvr1234') {
      log('  ⚠ 기본 비밀번호(busanvr1234)를 사용했습니다. 스토어 배포용은 BUBBLEWRAP_KEYSTORE_PASSWORD 로 직접 지정하세요.');
    }
  }
  const r = spawnSync(keytool, ['-list', '-v', '-keystore', keystorePath, '-alias', KEY_ALIAS, '-storepass', KS_PASS], { encoding: 'utf8' });
  if (r.status !== 0) fail(`키스토어를 읽을 수 없습니다 (비밀번호 확인): ${r.stderr || r.stdout}`);
  const m = /SHA-?256:\s*([0-9A-F:]{95})/i.exec(r.stdout);
  if (!m) fail('키스토어에서 SHA-256 지문을 찾지 못했습니다.');
  return m[1].toUpperCase();
}

function writeAssetLinks(fingerprint) {
  const json = JSON.stringify([
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: { namespace: 'android_app', package_name: PACKAGE_ID, sha256_cert_fingerprints: [fingerprint] },
    },
  ], null, 2) + '\n';
  const targets = [path.join(root, 'public', '.well-known')];
  if (fs.existsSync(path.join(root, 'dist'))) targets.push(path.join(root, 'dist', '.well-known'));
  for (const dir of targets) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'assetlinks.json'), json);
  }
  log(`Digital Asset Links 생성: public/.well-known/assetlinks.json (package=${PACKAGE_ID})`);
}

// ───────────── 3) 아이콘 제공용 로컬 서버 (Bubblewrap이 iconUrl 을 내려받음) ─────────────
function serveDist() {
  const dist = path.join(root, 'dist');
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent((req.url || '/').split('?')[0]).replace(/^\/+/, '');
    const file = path.join(dist, rel);
    if (!file.startsWith(dist) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    const type = file.endsWith('.png') ? 'image/png' : file.endsWith('.json') ? 'application/json' : 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

// 배포 상태 점검 (실패해도 빌드는 계속: 경고만 출력)
async function checkDeployment(url, fingerprint) {
  const probe = async (target) => {
    try {
      const res = await fetch(target, { signal: AbortSignal.timeout(8000) });
      return res.ok ? await res.text() : null;
    } catch {
      return null;
    }
  };
  const manifest = await probe(new URL('manifest.json', url));
  if (manifest === null) {
    log(`  ⚠ ${new URL('manifest.json', url)} 에 접속할 수 없습니다. dist/ 를 이 주소에 배포해야 앱이 실행됩니다.`);
  }
  const links = await probe(new URL('/.well-known/assetlinks.json', url));
  if (links === null) {
    log(`  ⚠ ${new URL('/.well-known/assetlinks.json', url)} 가 없습니다. (도메인 루트에 있어야 하며, 없으면 immersive 모드 앱이 실행되지 않을 수 있습니다)`);
  } else if (!links.toUpperCase().includes(fingerprint)) {
    log('  ⚠ 배포된 assetlinks.json 의 지문이 현재 키스토어와 다릅니다. `npm run build` 후 다시 배포하세요.');
  } else {
    log('  배포 확인: manifest.json / assetlinks.json 정상');
  }
}

// ───────────── 4) twa-manifest.json → Android 프로젝트 → 서명 APK ─────────────
async function buildApk(fingerprint) {
  const rawUrl = args.url || process.env.PWA_URL;
  if (!rawUrl) {
    fail('배포된 PWA 주소가 필요합니다.  예) npm run apk -- --url=https://busan-vr.netlify.app/');
  }
  let url;
  try {
    url = new URL(rawUrl.endsWith('/') ? rawUrl : rawUrl + '/');
  } catch {
    fail(`주소 형식이 올바르지 않습니다: ${rawUrl}`);
  }
  if (url.protocol !== 'https:') fail('PWA 주소는 반드시 https:// 여야 합니다 (WebXR 요구사항).');
  if (!['immersive', '2D'].includes(APP_MODE)) fail('--mode 는 immersive 또는 2D 여야 합니다.');
  const iconFile = path.join(root, 'dist', 'icons', 'icon-512.png');
  if (!fs.existsSync(iconFile) || !fs.existsSync(path.join(root, 'dist', 'manifest.json'))) {
    fail('dist/ 가 없습니다. 먼저 `npm run build` 를 실행하세요.');
  }
  await checkDeployment(url, fingerprint);

  const server = await serveDist();
  const port = server.address().port;
  const twaManifest = {
    packageId: PACKAGE_ID,
    host: url.host,
    name: '부산 VR 여행',
    launcherName: '부산 VR',
    display: 'standalone',
    themeColor: '#0B1B3A',
    themeColorDark: '#000000',
    navigationColor: '#0B1B3A',
    navigationColorDark: '#000000',
    navigationDividerColor: '#0B1B3A',
    navigationDividerColorDark: '#000000',
    backgroundColor: '#0B1B3A',
    enableNotifications: false,
    startUrl: url.pathname,
    iconUrl: `http://127.0.0.1:${port}/icons/icon-512.png`,
    maskableIconUrl: `http://127.0.0.1:${port}/icons/maskable-512.png`,
    splashScreenFadeOutDuration: 300,
    signingKey: { path: keystorePath, alias: KEY_ALIAS },
    appVersionName: APP_VERSION,
    appVersion: APP_VERSION,
    appVersionCode: APP_VERSION_CODE,
    shortcuts: [],
    generatorApp: 'bubblewrap-cli',
    // 생성 단계에서는 로컬 dist 의 manifest.json 을 쓰고(배포 서버 상태와 무관하게 빌드), 생성 후 실제 주소로 바꿔 넣는다.
    webManifestUrl: `http://127.0.0.1:${port}/manifest.json`,
    fallbackType: 'customtabs',
    features: { horizonPlatformSDK: { enabled: true } },
    alphaDependencies: { enabled: false },
    enableSiteSettingsShortcut: true,
    isChromeOSOnly: false,
    isMetaQuest: true,
    horizonOSAppMode: APP_MODE,
    fullScopeUrl: url.toString(),
    minSdkVersion: 23,
    orientation: APP_MODE === 'immersive' ? 'default' : 'landscape',
    fingerprints: [{ name: 'busan-vr-release', value: fingerprint }],
    additionalTrustedOrigins: [],
    retainedBundles: [],
  };
  const manifestFile = path.join(androidDir, 'twa-manifest.json');
  fs.writeFileSync(manifestFile, JSON.stringify(twaManifest, null, 2));
  log(`twa-manifest.json 작성 (host=${url.host}, startUrl=${url.pathname}, mode=${APP_MODE})`);

  try {
    log('Android(TWA) 프로젝트 생성 중…');
    await runBubblewrap(['update', '--skipVersionUpgrade', `--manifest=${manifestFile}`, `--directory=${androidDir}`], androidDir);
    const gradleFile = path.join(androidDir, 'app', 'build.gradle');
    const realManifestUrl = new URL('manifest.json', url).toString();
    fs.writeFileSync(gradleFile, fs.readFileSync(gradleFile, 'utf8').split(twaManifest.webManifestUrl).join(realManifestUrl));
    log('Gradle 빌드 + 서명 중… (처음에는 Gradle/SDK 다운로드로 수 분 걸립니다)');
    await runBubblewrap(['build', '--skipPwaValidation', `--manifest=${manifestFile}`, `--directory=${androidDir}`], androidDir);
  } finally {
    server.close();
  }

  const signed = path.join(androidDir, 'app-release-signed.apk');
  if (!fs.existsSync(signed)) fail('app-release-signed.apk 가 생성되지 않았습니다. 위 로그를 확인하세요.');
  const out = path.join(root, 'busan-vr.apk');
  fs.copyFileSync(signed, out);
  const mb = (fs.statSync(out).size / 1024 / 1024).toFixed(2);
  log(`\x1b[32m완료!\x1b[0m ${path.relative(process.cwd(), out) || 'busan-vr.apk'} (${mb} MB)`);
  log(`  PWA 주소 : ${url}`);
  log(`  검증 파일: ${new URL('/.well-known/assetlinks.json', url)}  ← 반드시 이 주소에서 열려야 합니다`);
  log('  설치     : adb install -r busan-vr.apk   (또는 npm run apk:install)');
}

try {
  const { keytool } = await ensureToolchain();
  const fingerprint = ensureKeystore(keytool);
  writeAssetLinks(fingerprint);
  if (command === 'key') {
    log(`SHA-256 지문: ${fingerprint}`);
    log('이제 `npm run build` 후 dist/ 를 HTTPS 호스팅에 배포하고, `npm run apk -- --url=https://<배포주소>/` 를 실행하세요.');
  } else if (command === 'build') {
    await buildApk(fingerprint);
  } else {
    fail(`알 수 없는 명령: ${command} (key | build)`);
  }
} catch (err) {
  fail(`${err.message}\n      네트워크 오류(예: 429/timeout)라면 잠시 후 같은 명령을 다시 실행하세요. 받은 파일은 캐시되어 이어서 진행됩니다.`);
}
