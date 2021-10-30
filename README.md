<div align="center">
<img height="250" src="./.github/logo.png" alt="Tron 3" />

A dead-simple voice channel notifications bot for your Discord server

[![Discord.js version](https://img.shields.io/github/package-json/dependency-version/zakuciael/tron3/discord.js?style=flat-square)](https://discord.js.org/#/)
[![License](https://img.shields.io/github/license/zakuciael/tron3?style=flat-square)](https://github.com/zakuciael/tron3/blob/main/LICENSE)
</div>

## Self-hosting
1. Go to [Discord developer portal](https://discord.com/developers/applications) and create a new bot application with `PRESENCE INTENT` setting.
2. Copy the bot token to the clipboard
3. Create `config.json` file with the following content:
```json
{
  "token": "<DISCORD TOKEN>",
  "guilds": {}
}
```
> Note: Replace `<DISCORD TOKEN>` with the token from the clipboard.
4. Create a `docker-compose.yml` file with following settings:
```yaml
version: '3'

services:
  tron3:
    container_name: tron3
    image: ghcr.io/zakuciael/tron3:latest
    restart: always
    volumes:
      - $PWD/config.json:/app/config.json
```
5. Start the bot using `docker-compose up -d` command.
