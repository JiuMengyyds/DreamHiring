import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { spawn } from "node:child_process";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.dirname(testDir);
const prototypeDir = path.join(projectRoot, "prototype");
const htmlPath = path.join(prototypeDir, "index.html");
const jsPath = path.join(prototypeDir, "app.js");
const cssPath = path.join(prototypeDir, "styles.css");

const browserCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

let browserProcess;
let profileDir;
let socket;
let nextMessageId = 0;
const pendingMessages = new Map();
const pageErrors = [];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(predicate, message, timeout = 5000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await delay(60);
  }
  throw new Error(message);
}

async function findBrowser() {
  for (const candidate of browserCandidates) {
    try {
      await readFile(candidate);
      return candidate;
    } catch {
      // Try the next installed browser.
    }
  }
  throw new Error("未找到可用于原型验收的 Edge 或 Chrome");
}

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++nextMessageId;
    pendingMessages.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const response = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.text || "页面脚本执行失败");
  }
  return response.result?.value;
}

async function navigate(hash, readyExpression) {
  await evaluate(`location.hash = ${JSON.stringify(hash)}`);
  await waitFor(
    () => evaluate(`Boolean(${readyExpression})`),
    `路由 ${hash} 未完成渲染`,
  );
}

before(async () => {
  profileDir = await mkdtemp(path.join(os.tmpdir(), "dreamhiring-prototype-"));
  const browserPath = await findBrowser();
  const port = 9327;
  const pageUrl = `${pathToFileURL(htmlPath).href}#/seeker/home`;
  browserProcess = spawn(
    browserPath,
    [
      "--headless=new",
      "--disable-gpu",
      "--disable-gpu-sandbox",
      "--no-sandbox",
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      "--remote-allow-origins=*",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profileDir}`,
      "--window-size=1440,1100",
      pageUrl,
    ],
    { stdio: "ignore", windowsHide: true },
  );

  await waitFor(async () => {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      return response.ok;
    } catch {
      return false;
    }
  }, "浏览器调试端口未就绪", 15000);

  const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
  const page = targets.find((target) => target.type === "page" && target.url.includes("prototype/index.html"));
  assert.ok(page, "未找到原型页面调试目标");

  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pendingMessages.has(message.id)) {
      const pending = pendingMessages.get(message.id);
      pendingMessages.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
      return;
    }
    if (message.method === "Runtime.exceptionThrown") {
      pageErrors.push(message.params.exceptionDetails.text || "未知脚本异常");
    }
  });
  await send("Runtime.enable");
  await send("Page.enable");
  await waitFor(() => evaluate("Boolean(document.querySelector('.app-shell'))"), "首页未完成渲染", 10000);
});

after(async () => {
  try {
    if (socket) socket.close();
  } catch {
    // Ignore cleanup failures after the assertions have completed.
  }
  if (browserProcess && !browserProcess.killed) {
    browserProcess.kill();
    await Promise.race([
      new Promise((resolve) => browserProcess.once("exit", resolve)),
      delay(2000),
    ]);
  }
  if (profileDir) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        await rm(profileDir, { recursive: true, force: true });
        break;
      } catch {
        await delay(250);
      }
    }
  }
});

test("原型资源完整且不依赖外部网络", async () => {
  const [html, js, css] = await Promise.all([
    readFile(htmlPath, "utf8"),
    readFile(jsPath, "utf8"),
    readFile(cssPath, "utf8"),
  ]);

  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /href="\.\/styles\.css"/);
  assert.match(html, /src="\.\/app\.js"/);
  assert.doesNotMatch(html, /https?:\/\//, "原型不应依赖远程资源");
  assert.ok(css.length > 40000, "样式文件应包含完整设计系统");
  assert.ok(js.length > 100000, "交互脚本应覆盖三角色业务链路");

  const availableIcons = new Set([...html.matchAll(/id="i-([a-z-]+)"/g)].map((match) => match[1]));
  const usedIcons = new Set([...js.matchAll(/icon\("([a-z-]+)"/g)].map((match) => match[1]));
  const missingIcons = [...usedIcons].filter((name) => !availableIcons.has(name));
  assert.deepEqual(missingIcons, [], `缺少图标定义：${missingIcons.join(", ")}`);
});

test("求职者首页、职位筛选与投递闭环可交互", async () => {
  assert.match(await evaluate("document.querySelector('h1').textContent"), /早上好，知夏/);
  assert.equal(await evaluate("document.querySelectorAll('.metric-card').length"), 4);

  await navigate("#/seeker/jobs", "document.querySelector('form[data-form=\"job-filter\"]')");
  assert.equal(await evaluate("document.querySelectorAll('.job-list .job-card').length"), 8);
  assert.match(await evaluate("document.querySelector('.filter-summary__result').textContent"), /8/);

  await evaluate(`
    (() => {
      const form = document.querySelector('form[data-form="job-filter"]');
      form.querySelector('[name="city"]').value = '杭州';
      form.requestSubmit();
    })()
  `);
  await waitFor(
    () => evaluate("document.querySelectorAll('.job-list .job-card').length === 3"),
    "城市筛选结果未更新",
  );
  assert.equal(await evaluate("document.querySelectorAll('.job-list .job-card').length"), 3);
  assert.ok(
    await evaluate("[...document.querySelectorAll('.job-list .job-card')].every(card => card.textContent.includes('杭州'))"),
    "筛选结果中包含非杭州职位",
  );

  await navigate("#/seeker/jobs/7", "document.querySelector('[data-action=\"apply-job\"]')");
  await evaluate("document.querySelector('[data-action=\"apply-job\"]').click()");
  await waitFor(
    () => evaluate("document.querySelector('.sticky-action').textContent.includes('已投递')"),
    "投递后页面状态未更新",
  );
  assert.match(await evaluate("document.querySelector('.sticky-action').textContent"), /已投递/);
  assert.match(await evaluate("document.querySelector('.toast').textContent"), /投递成功/);
});

test("企业端候选人流程与状态流转可用", async () => {
  await navigate("#/company/candidates", "document.querySelector('.pipeline-board')");
  assert.equal(await evaluate("document.querySelectorAll('.pipeline-column').length"), 4);
  assert.equal(await evaluate("document.querySelectorAll('.candidate-card').length"), 7);

  await evaluate("document.querySelector('.candidate-card [data-action=\"candidate-status\"]').click()");
  await waitFor(
    () => evaluate("document.querySelector('#toast-region')?.textContent.includes('状态已更新')"),
    "候选人状态没有更新提示",
  );
  assert.match(await evaluate("document.querySelector('#toast-region').textContent"), /状态已更新/);
});

test("管理员审核操作与数据看板渲染正常", async () => {
  await navigate("#/admin/audits", "document.querySelector('[data-action=\"set-audit-tab\"]')");
  const beforeCount = await evaluate("document.querySelectorAll('[data-action=\"approve-audit\"]').length");
  assert.equal(beforeCount, 4);
  await evaluate("document.querySelector('[data-action=\"approve-audit\"]').click()");
  await waitFor(
    () => evaluate("document.querySelector('[data-action=\"set-audit-tab\"] .tab__count').textContent === '3'"),
    "审核通过后待审核数量未减少",
  );
  assert.equal(await evaluate("document.querySelectorAll('[data-action=\"approve-audit\"]').length"), 3);

  await navigate("#/dashboard", "document.querySelectorAll('.insight-card').length === 7");
  assert.equal(await evaluate("document.querySelectorAll('.insight-kpi').length"), 4);
  assert.equal(await evaluate("document.querySelectorAll('.insight-card').length"), 7);
  assert.equal(await evaluate("document.querySelectorAll('.cloud-word').length"), 15);
  assert.match(await evaluate("document.querySelector('.insights-heading h2').textContent"), /就业市场全景洞察/);
});

test("登录页与角色切换入口可用", async () => {
  await navigate("#/login", "document.querySelector('.login-page')");
  assert.equal(await evaluate("document.querySelectorAll('.role-pick').length"), 3);
  assert.match(await evaluate("document.querySelector('.login-box h2').textContent"), /欢迎回来/);
  assert.equal(await evaluate("document.querySelectorAll('.login-tab').length"), 2);
});

test("移动端布局无横向溢出且导航可打开", async () => {
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await navigate("#/seeker/home", "document.querySelector('.mobile-menu')");
  const layout = await evaluate(`({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    heroRight: Math.round(document.querySelector('.hero').getBoundingClientRect().right)
  })`);
  assert.ok(
    layout.scrollWidth <= layout.viewport + 1,
    `移动端出现横向溢出：viewport=${layout.viewport}, scrollWidth=${layout.scrollWidth}, heroRight=${layout.heroRight}`,
  );
  await evaluate("document.querySelector('.mobile-menu').click()");
  assert.equal(await evaluate("document.body.classList.contains('sidebar-open')"), true);
  await send("Emulation.clearDeviceMetricsOverride");
  await evaluate("document.body.classList.remove('sidebar-open')");
  assert.deepEqual(pageErrors, []);
});
