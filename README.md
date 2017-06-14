# Pluralsight Scraper

## What is this?

This a pluralsight scraper/downloader/ripper. While not a marvel of engineering, it can automatically download individual courses and save them in a convenient format. **This project does not endorse piracy and requires a valid pluralsight login to function!**

![Format](http://i.imgur.com/4VeULGk.png)

## Why?

Pluralsight doesn't have a way to play videos offline **on Linux** as far as I know and I wanted to play stuff offline on Linux, hence this project.

## How?

With [nightmare](https://github.com/segmentio/nightmare). Code is short and understandable. Won't bother explaining details.

## Usage

Modify `index.js` to put in whatever you want and then in terminal run the following commands:

    git clone https://github.com/knyzorg/pluralsight-scraper
    npm install
    npm start

## It throws a promise error! It doesn't work! I don't like javascript!

How tragic! This script was written in half an hour for personal use, sorry if it isn't tested properly. You are free to open pull requests.

Otherwise, there is a similar project here made in python: https://github.com/Stormiix/pluralsight_scraper