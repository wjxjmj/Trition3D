// Capture browser console from the dev server to help debug rendering issues.
// Usage: node scripts/debug-console.mjs
import { chromium } from "@playwright/test"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

const errors = []
page.on("console", msg => {
  if (msg.type() === "error") console.log("[CONSOLE ERROR]", msg.text())
  // Only log warning/error to avoid noise
  if (msg.type() === "warning") console.log("[CONSOLE WARN]", msg.text())
})
page.on("pageerror", err => {
  errors.push(err.message)
  console.log("[PAGE ERROR]", err.message)
})

console.log("Navigating to http://127.0.0.1:5173 ...")
await page.goto("http://127.0.0.1:5173", { waitUntil: "domcontentloaded", timeout: 30000 })

// Wait for WASM to load and the app to render
await page.waitForTimeout(8000)

const title = await page.title()
console.log("Page title:", title)

// Check if canvas exists
const canvasCount = await page.evaluate(() => document.querySelectorAll("canvas").length)
console.log("Canvas elements:", canvasCount)

// Check for error overlay
const errorOverlay = await page.evaluate(() => {
  const el = document.querySelector(".svelte-error, .vite-error-overlay, [data-error]")
  return el ? el.textContent?.slice(0, 500) : null
})
if (errorOverlay) console.log("ERROR OVERLAY:", errorOverlay)

// Check browser tree
const treeText = await page.evaluate(() => {
  const el = document.querySelector(".browser-tree")
  return el?.textContent?.slice(0, 200) || "NOT FOUND"
})
console.log("Browser tree:", treeText)

// Check floating panel
const panelCount = await page.evaluate(() => document.querySelectorAll(".floating-panel").length)
console.log("Floating panels:", panelCount)

// Check timeline
const timelineText = await page.evaluate(() => {
  const el = document.querySelector(".timeline-row")
  return el?.textContent?.slice(0, 200) || "NOT FOUND"
})
console.log("Timeline:", timelineText)

if (errors.length > 0) {
  console.log("\n--- PAGE ERRORS ---")
  errors.forEach(e => console.log(e))
} else {
  console.log("\nNo page errors detected.")
}

await browser.close()
