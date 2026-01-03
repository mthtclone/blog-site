#!/usr/bin/env node
import { spawn } from "child_process";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const STRAPI_FOLDER = path.resolve("./strapi");
const STRAPI_PORT = 1337;
const STRAPI_URL = `http://localhost:${STRAPI_PORT}/api/posts`;
const JSON_OUTPUT = path.resolve("src/posts.json");
const IMAGES_DIR = path.resolve("./public/uploads");

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadImages(url, filename) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download ${url}: ${res.statusText}`);

    const buffer = await res.arrayBuffer();
    fs.writeFileSync(filename, Buffer.from(buffer));
    console.log(`Downloaded ${filename}`);
}

async function processImages(posts) {
    if(!fs.existsSync(IMAGES_DIR))
        fs.mkdirSync(IMAGES_DIR, { recursive: true })

    const mdImageRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;

    for (const post of posts) {
        if (!post.Content) continue;

        let content = post.Content;
        const matches = [...content.matchAll(mdImageRegex)];

        for (const match of matches) {
            const [fullMatch, alt, url] = match;
        
            const urlParts = url.split("/");
            const filename = urlParts[urlParts.length - 1];
            const localPath = `/uploads/${filename}`;
            const fullLocalPath = path.join(IMAGES_DIR, filename);

            try {
                await downloadImages(url, fullLocalPath);
            } catch (err) {
                console.error(err);
                continue;
            }

            content = content.replace(url, localPath);
        }

        post.Content = content;
    }

    fs.writeFileSync(
        path.resolve("./src/posts.json"),
        JSON.stringify({ data: posts }, null, 2)
    );

    console.log("All images downloaded and Mardkown updated.")
}

async function startStrapi() {
    console.log("Starting Strapi server...")

    const strapi = spawn("npx", ["strapi", "start"], {
        cwd: STRAPI_FOLDER,
        shell: true,
        stdio: ["ignore", "pipe", "pipe"],
    });

    strapi.stdout.on("data", (data) => {
        const line = data.toString();
        process.stdout.write(line);
    });

    console.log("Waiting for Strapi to be ready...");

    let ready = false;
    const maxRetries = 20;
    let retries = 0;

    while (!ready && retries < maxRetries) {
        try {
            const res = await fetch(STRAPI_URL, { headers: { Accept: "application/json" } });
            if (res.ok) {
                ready = true;
                break;
            }
        } catch (err) {

        }
        retries ++;
        await sleep(1000);
    }

    if (!ready) {
        strapi.kill("SIGINT");
        throw new Error("Strapi did not start in time.");
    }

    console.log("Strapi is ready!");

    const response = await fetch(STRAPI_URL, { headers: { Accept: "application/json" } });
    const json = await response.json();
    const posts = json.data || [];

    fs.writeFileSync(JSON_OUTPUT, JSON.stringify(json, null, 2));
    console.log(`Saved JSON to ${JSON_OUTPUT}`);

    // run downloadImg.js script here
    await processImages(posts);

    strapi.kill("SIGINT");
    console.log("Strapi server stopped.");
    process.exit(0);
}

startStrapi().catch((err) => {
    console.error(err);
    process.exit(1);
});
