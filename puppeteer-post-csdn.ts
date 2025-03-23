import puppeteer from "puppeteer";
import { PuppeteerAgent } from "@midscene/web/puppeteer";
import 'dotenv/config';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
Promise.resolve(
  (async () => {
    console.log("Starting browser in headed mode...");
    const browser = await puppeteer.launch({
      headless: false, // here we use headed mode to help debug
    });


    

    console.log("Creating new page...");
    const page = await browser.newPage();
    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
    });

    console.log("Navigating to CSDN homepage...");
    await page.goto("https://www.csdn.net/");
    await sleep(5000);

    console.log("Initializing Midscene agent...");
    const agent = new PuppeteerAgent(page);

    console.log("Clicking create button...Selecting 'Write Article' option...");
    await agent.aiAction('在右上角点击创作按钮，然后在下拉的菜单中选择写文章');
    await sleep(3000);

    // console.log("Selecting 'Write Article' option...");
    // await agent.aiAction('在下拉的菜单中选择写文章');
    // await sleep(5000);
    
    console.log("Checking login status...");
    const hasLoginRequired = await agent.aiQuery('boolean,是否有微信登录，免密登录，和密码登录');
    if (hasLoginRequired) {
      console.log("Login required, proceeding with password login...");
      await agent.aiAction("点击密码登录文字");
      await sleep(3000);

      console.log("Entering login credentials...");
      await agent.aiAction("在密码登录框输入 " + process.env.CSND_USERNAME + " 密码框输入 " + process.env.CSND_PASSWORD);
      await sleep(3000);

    }
    
    console.log("Clicking login button...");
    await agent.aiAction("点击登录按钮");

    console.log("Entering article title...");
    await agent.aiAction('在文章标题输入框输入 "Midscene 是什么"');
    await sleep(3000);

    console.log("Entering article content...");
    await agent.aiAction('在文章内容输入框输入 "Midscene 是一个基于 AI 的智能写作工具，它可以帮助你快速生成高质量的文章。这个是通过 puppeteer 和 midscene 实现的 自动发布的文章"');
    await sleep(3000);

    console.log("Publishing article...");
    await agent.aiAction('在文章顶部发布文章');
    await sleep(3000);

    console.log("Task completed, closing browser...");
    await browser.close();
  })()
);