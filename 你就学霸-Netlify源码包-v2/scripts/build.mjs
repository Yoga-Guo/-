import { cp, mkdir, rm } from "node:fs/promises";

const output = new URL("../dist/", import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of ["index.html", "styles.css", "app.js"]) {
  await cp(new URL(`../${file}`, import.meta.url), new URL(file, output));
}

console.log("你就学霸 H5 已构建到 dist/");
