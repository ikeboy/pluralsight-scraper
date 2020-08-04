const puppeteer = require('puppeteer');
const puppeteerExtra = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const argv = require('yargs').argv;

const wait = ms => new Promise(r => setTimeout(r, ms));

function courseIdFromUrl(url) {
    return /library\/courses\/([a-z0-9\-]+)/gi.exec(url)[1];
}


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
            // Wait 137 seconds after each request to avoid throttling
            await wait(137000 * index);
            // Add numbering for proper sequencing
            // Strip title of illegal chars
            const title = `${index + 1}. ${video.title.trim().replace(/[:?*'|&;$%@"<>()+,\/]/g, "")}`;

            console.log(`Retrieving metadata for: ${title}`);

            // Get video url
            const url = await getVideoUrl(video.clipId);

            return {
                title,
                url
            };
        });

    const videoFeed = {
        [Symbol.asyncIterator]() {
            return {
                index: 0,
                async next() {
                    return { value: (await videos[this.index++]), done: this.index - 1 == videos.length };
                }
            };
        }
    };

    const videoPath = path.join(__dirname, "videos");
    const coursePath = path.join(videoPath, courseId.replace(/[:?*'|&;$%@"<>()+,\/]/g, ""));

    if (!fs.existsSync(videoPath)) {
        fs.mkdirSync(videoPath);
    }
    if (!fs.existsSync(coursePath)) {
        fs.mkdirSync(coursePath);
    }

    for await (let video of videoFeed) {
        const file = path.join(coursePath, video.title + ".mp4");

        if (!fs.existsSync(file)) {
            console.log(`Downloading video file for: ${video.title + ".mp4"}`);
            const data = await fetch(video.url);
            const fileStream = fs.createWriteStream(file);
            data.body.pipe(fileStream);
        }
    }


}

// Retrieve login cookies
async function login() {
    puppeteerExtra.use(pluginStealth());
	const browser = await puppeteerExtra.launch({ headless: false });
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

const cookiesAvailable = fs.existsSync("./cookies.txt");

require('yargs')
    .showHelpOnFail(true)
    .command('login', 'Open session', (yargs) => {

    }, async (argv) => {

        console.log("Launching login window");
        await login();
        console.log("Cookies saved. You can now download courses");

    }) // eslint-disable-line
    .command('get [url]', 'Download course', (yargs) => {
        yargs
            .positional('url', {
                describe: 'URL or Course ID to download'
            });
    }, async (argv) => {

        if (cookiesAvailable) {
            let courseId = argv.url;
            if (courseId.includes("/")) {
                courseId = courseIdFromUrl(courseId);
            }
            console.log("Downloading course: " + courseId);
            try {
                await downloadCourse(courseId, fs.readFileSync("./cookies.txt").toString());
            } catch (error) {
                console.error("Something went wrong. Double check the URL and try logging in again.")
                process.exit(1);
            }
            
        } else {
            console.log("You need to login in order to download courses");
            console.log("$ npm run login");
        }

    })
    .demandCommand()
    .argv;
