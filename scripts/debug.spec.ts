import {test} from "@playwright/test"

test("screenshot and console capture", async ({page}) => {
  const errors: string[] = []
  page.on("pageerror", err => errors.push(err.message))
  page.on("console", msg => {
    if (msg.type() === "error") console.log("[ERR]", msg.text())
  })

  await page.goto("http://127.0.0.1:5173", {waitUntil: "domcontentloaded"})
  await page.waitForTimeout(8000)

  const canvasCount = await page.evaluate(() => document.querySelectorAll("canvas").length)
  console.log("Canvases:", canvasCount)

  if (errors.length) console.log("Errors:", errors)

  await page.screenshot({path: "scripts/screenshot.png", fullPage: false})
  console.log("Screenshot saved to scripts/screenshot.png")
})
