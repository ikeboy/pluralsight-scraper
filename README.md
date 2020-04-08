# Pluralsight Scraper

## What is this?

This is the second iteration of the pluralsight scraper. It is used to retrieve mp4 video files by scraping pluralsight's website using its own API. **This project does not endorse piracy and requires a valid pluralsight login to function!**

![Sample Output](http://i.imgur.com/flqcOH4.png)

## Why?

Pluralsight doesn't have a way to play videos offline **on Linux** as far as I know and I wanted to play stuff offline on Linux, hence this project.

[Pluralsight.com FAQ: Can I watch your videos on Linux?](http://pluralsight.knowledgeowl.com/help/can-i-watch-your-videos-on-linux)
[Available apps](https://www.pluralsight.com/downloads)

## How?

The script launches a pupputeer.js chromium instance, which it uses to allow you to interactively authenticate with the real website. Once logged in, it will save your cookies to a separate file (`cookies.txt`) in order to authenticate the API requests required to download the video files.

## Usage

  1. Clone the repo `git clone https://github.com/knyzorg/pluralsight-scraper`

  2. Run `npm install` to install the dependencies

  4. Run `npm run login` to open a session

  5. Run `npm run get -- "https://app.pluralsight.com/library/courses/rust-fundamentals/table-of-contents"` to begin downloading the course

## Isn't this against Pluralsight's Terms of Service?

Yes it is: [Refer to Section 5](https://www.pluralsight.com/terms)

>The applicable License granted you by these Terms of Use is a right of access through the Site only, and does not grant to you any right to download or store any Proprietary Materials in any medium[...]

## Detection Evasion

There is a relatively high likely-hood that your account will be flagged for running this script. It is very difficult to evade such things and the current strategy is to naively wait 30 seconds between requests.