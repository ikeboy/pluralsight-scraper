const puppeteer = require('puppeteer');
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
//const cliProgress = require('cli-progress');

const wait = ms => new Promise(r => setTimeout(r, ms));
// const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

async function downloadCourse(courseId, cookie) {
    async function getVideoUrl(clipId) {
        let clipData = await fetch("https://app.pluralsight.com/video/clips/v3/viewclip", {
            "headers": {
                "Content-Type": "application/json",
                cookie
            },
            "body": JSON.stringify({ "clipId": clipId, "mediaType": "mp4", "quality": "1280x720", "online": true, "boundedContext": "course", "versionId": "" }),
            "method": "POST"
        }).then((response) => response.json());

        return clipData.urls[0].url;
    }

    const courseData = await fetch("https://app.pluralsight.com/learner/content/courses/" + courseId, {
        headers: { cookie }
    }).then((response) => response.json());

    let videos = courseData.modules
        // Get video items
        .map(module => module.clips)
        // Flatten from module structure
        .reduce((a, b) => [...a, ...b], [])
        // Reformat a bit, get rid of all the unncessary information, generate title
        .map(async (video, index) => {
            // Wait 200 seconds after each request to avoid throttling
            await wait(10000 * index);
            let url = await getVideoUrl(video.clipId);
            
            return {
                // Add numbering for proper sequencing
                // Strip title of illegal chars
                title: `${index + 1}. ${video.title.replace(/[|&;$%@"<>()+,]/g, "")}`,
                // Get video url
                url
            };
        });

    const videoFeed = {
        [Symbol.asyncIterator]() {
            return {
                index: 0,
                async next() {
                    return { value: (await videos[this.index++]), done: this.index+1 == videos.length };
                }
            };
        }
    };

    const videoPath = path.join(__dirname, "videos");
    const coursePath = path.join(videoPath, courseId.replace(/[|&;$%@"<>()+,]/g, ""));

    if (!fs.existsSync(videoPath)) {
        fs.mkdirSync(videoPath);
    }
    if (!fs.existsSync(coursePath)) {
        fs.mkdirSync(coursePath);
    }

    for await (let video of videoFeed) {
        const file = path.join(coursePath, video.title + ".mp4");

        if (!fs.existsSync(file)) {
            const data = await fetch(video.url);
            const fileStream = fs.createWriteStream(file);
            data.body.pipe(fileStream);
        }
    }


}

// Retrieve login cookies
async function login() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://app.pluralsight.com/id/');

    while (page.url() != "https://app.pluralsight.com/library/") {
        await page.waitForNavigation({ timeout: 0 });
    }

    const cookies = await page.cookies();

    const cookieData = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join("; ");

    fs.writeFileSync("./cookies.txt", cookieData);

    await browser.close();
};

if (fs.existsSync("./cookies.txt")) {
    downloadCourse("rust-fundamentals", fs.readFileSync("./cookies.txt").toString());
} else {
    login();
}