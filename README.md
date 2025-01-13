# GalacTelecast
GalacTelecast is a Discord bot designed to fetch and broadcast RSS feeds directly into your Discord channels. Originally developed for the Valor and RealmDex communities, it has been made public to assist a broader audience in integrating RSS feeds into their Discord servers.

## Features
- RSS Feed Integration: Fetches updates from specified RSS feeds and posts them in designated Discord channels.
- Customizable Channels: Allows server administrators to specify which channels receive updates from particular feeds.
- Automated Updates: Periodically checks for new content, ensuring your community stays informed in real-time.

## Prerequisites
Before setting up GalacTelecast, ensure you have the following installed:
 - Node.js: Version 16.x or later is recommended.
 - npm: Comes bundled with Node.js.
 - Discord Bot Token: Obtain one by creating a new application in the Discord Developer Portal.

##Installation
1. Clone the Repository:
```bash
git clone https://github.com/deebehygh/GalacTelecast.git
```
2. Navigate to the Project Directory:
```bash 
cd GalacTelecast
```
3. Install Dependencies:
```bash 
npm install
```
## Configuration
**Create a .env File:** Duplicate the .env.example file and rename it to .env.
**Set Environment Variables:** Open the .env file and configure the following variables:

```makefile
DISCORD_TOKEN=your_discord_bot_token
PREFIX=!
```
- `DISCORD_TOKEN:` Your Discord bot token.
- `PREFIX:` The command prefix for the bot (default is `!`).

## Usage
1. Start the Bot:
```bash
npm start
```
2. **Invite the Bot to Your Server:** Generate an OAuth2 URL in the Discord Developer Portal under your application's settings to invite the bot to your server.
3. **Configure RSS Feeds:** Use the bot commands to add or remove RSS feeds for specific channels. For example:

```arduino
!addfeed https://example.com/rss
```
## Contributing
Contributions are welcome! Feel free to submit issues and pull requests to enhance the functionality of GalacTelecast.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
