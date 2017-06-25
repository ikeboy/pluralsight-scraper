# Pluralsight Scraper

## What is this?

This a pluralsight scraper/downloader/ripper. While not a marvel of engineering, it can automatically download individual courses and save them in a convenient format. **This project does not endorse piracy and requires a valid pluralsight login to function!**

![Sample Output](http://i.imgur.com/flqcOH4.png)

## Why?

Pluralsight doesn't have a way to play videos offline **on Linux** as far as I know and I wanted to play stuff offline on Linux, hence this project.

[Pluralsight.com FAQ: Can I watch your videos on Linux?](http://pluralsight.knowledgeowl.com/help/can-i-watch-your-videos-on-linux)
[Available apps](https://www.pluralsight.com/downloads)

## How?

With [nightmare](https://github.com/segmentio/nightmare). Code is short and understandable. Won't bother explaining details.

## Usage

Modify `index.js` to put in whatever you want and then in terminal run the following commands:

    git clone https://github.com/knyzorg/pluralsight-scraper
    npm install
    npm start

## Isn't this against Pluralsight's Terms of Service?

Yes it is: [Refer to Section 5](https://www.pluralsight.com/terms)

>The applicable License granted you by these Terms of Use is a right of access through the Site only, and does not grant to you any right to download or store any Proprietary Materials in any medium[...]



## It throws a promise error! It doesn't work! I don't like javascript!

How tragic! This script was written in half an hour for personal use, sorry if it isn't tested properly. You are free to open issues and pull requests.

Otherwise, there is a similar project here made in python: https://github.com/Stormiix/pluralsight_scraper