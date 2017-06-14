var Nightmare = require('nightmare');
var nightmare = Nightmare({ show: false });

var http = require('http');
var fs = require("fs");
/*** CONFIGURATION ***/

//Link to the table of contents of the course you want
var target = 
"https://app.pluralsight.com/library/courses/java-fundamentals-language/table-of-contents";

//It will be saved to videos/folder-you-want
var saveTo = "Java Fundamentals: The Java Language"

//You need to login

var user = {
    email: "myname@email.com",
    password: "Password123"
}

/*** DAH CODEZ ***/
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
        return courses.filter((thing) => thing.url);
        //return document.querySelectorAll(".table-of-contents__title a")
    })
    .then(function (courses) {
        //console.log(JSON.stringify(courses));
        var tasks = courses.map((course, index) => (
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
        .wait(1000)
        .evaluate(() => {
            var src = document.querySelector("video").src
            return src
        }).then((result) => {
            //console.log(result)

            if (!result){
                scrape(...arguments)
                return
            }
            
            course.src = result
            saveVideo(course, index + 1)
            callback()
        })
}

function saveVideo(course, number) {
    console.log(number);
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
    var request = http.get(course.src, function (response) {
        response.pipe(file);
    });
}
