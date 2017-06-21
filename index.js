var ProgressBar = require('progress');
var Nightmare = require('nightmare');
var nightmare = Nightmare({ show: false });

var http = require('http');
var fs = require("fs");
/*** CONFIGURATION ***/

//Link to the table of contents of the course you want
var target =
    "https://app.pluralsight.com/library/courses/speaking-fundamentals/table-of-contents";

//It will be saved to videos/folder-you-want
//var saveTo = "D3: The Big Picture"

//You need to login

var user = {
    email: "john.doe@gmail.com",
    password: "P45$W0RD123"
}

/*** DAH CODEZ ***/

console.log(`
Slava Knyazev:
This program was written for EDUCATION and PERSONAL USE ONLY
Please be respectful of the original authors' intellectual property

This scraper is open source and licensed under GPLv2 on Github
https://github.com/knyzorg/pluralsight-scraper
`)

console.log("Logging in...")

var numberOfFiles, completed, saveTo, progress = 0;
nightmare
    .goto('https://app.pluralsight.com/id/')
    .wait(1000)
    .type('#Username', user.email)
    .type('#Password', user.password)
    .click('button.button.primary')
    .wait(5000)
    .goto(target)
    .wait(5000)
    .evaluate(function () {
        var courses = [];
        document.querySelectorAll(".table-of-contents__clip-list-item a").forEach((course) => {
            courses.push({
                name: course.text,
                url: course.href
            })
        })
        return {
            courses: courses.filter((thing) => thing.url),
            title: document.title
        }
    })
    .then(function (module) {
        numberOfFiles = module.courses.length;
        saveTo = module.title.replace(" | Pluralsight", "");
        console.log(`Downloading "${saveTo}" from PluralSight, ${numberOfFiles} videos`)
        progress = new ProgressBar(':current/:total [:bar] :percent :etas', { total: numberOfFiles, callback: terminate })
        var tasks = module.courses.map((course, index) => (
            (callback) => {
                scrape(course, index, callback)
            }
        ))
        require("async.parallellimit")(tasks, 1, function () {
        });
    })

function scrape(course, index, callback) {
    nightmare.goto(course.url)
        .wait("video")
        .wait(1500)
        .evaluate(() => {
            var src = document.querySelector("video").src
            return src
        })
        .then((result) => {

            if (!result) {
                progress.interrupt("Something went wrong. Retrying...")
                scrape(...arguments)
                return
            }

            course.src = result
            saveVideo(course, index + 1)
            callback()
        })
}

function saveVideo(course, number) {
    //console.log(number, course.name);
    if (!fs.existsSync("videos/")) {
        fs.mkdirSync("videos/");
    }
    if (!fs.existsSync("videos/" + saveTo)) {
        fs.mkdirSync("videos/" + saveTo);
    }
    if (fs.existsSync("videos/" + saveTo + "/" + number + ". " + course.name.replace("/", "") + ".webm")) {
        return;
    }
    var file = fs.createWriteStream("videos/" + saveTo + "/" + number + ". " + course.name.replace("/", "") + ".webm");
    var request = http.get(course.src,(response) => {
        progress.tick()
        response.pipe(file);
        completed++;
        if (completed == numberOfFiles) {

        }
    });
}

function terminate() {
    console.log("Operation Completed!")
    process.exit(0)
}