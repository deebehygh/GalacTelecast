const { EpicFreeGames } = require("epic-free-games");
const { EmbedBuilder, ActivityType } = require('discord.js');
const { ExtClient } = require('../ext/ExtClient.js');
const { setInterval } = require('node:timers');

class ExtFreeGames extends EpicFreeGames {
	constructor(/**@type {ExtClient}*/ client) {
		super({ country: 'US', locale: 'en-US', includeAll: false })

		this.client = client;
		this.start();
	}

	build_embed = async (gameList, res) => {
		let currentGame = res.currentGames[0];
		if (gameList.includes(currentGame.title)) return;
		let epicEmbed = new EmbedBuilder()
			.setTitle('[Discounted Games]: ' + currentGame.title)
			.setThumbnail(currentGame.keyImages[0].url || "")
			.setDescription(currentGame.description || "No description available")
			.setColor('Navy')
			.setImage(currentGame.keyImages[0].url)
			.addFields(
				{ name: 'Price', value: `$${currentGame.price.totalPrice.fmtPrice.discountPrice}` },
				{ name: 'Original Price', value: currentGame.price.totalPrice.fmtPrice.originalPrice, inline: true },
				{ name: 'Seller', value: currentGame.seller.name, inline: true },
				{ name: 'Platform', value: 'Epic Games', inline: true })
			.setTimestamp()
		return epicEmbed;
	}

	getFreeGames = async () => {
		let guilds = await this.client.redis.sMembers('epicGuilds_:gList_');
		if (!guilds) return;
		for (let guildId of guilds) {
			let online = await this.client.redis.hGet(`epicGuilds_:${guildId}:freeEpicGamesSettings`, `online`)
			let gameList = await this.client.redis.sMembers(`epicGuilds_:${guildId}:recordedGames`)
			if (!online) return;
			this.getGames().then(async res => {
				let epicEmbed = await this.build_embed(gameList, res);
				await this.client.redis.sAdd(`epicGuilds_:${guildId}:recordedGames`, res.currentGames[0].title);
				let guildChannel = await this.client.redis.hGet(`epicGuilds_:${guildId}:freeEpicGamesSettings`, `channelId`)
				let channel = this.client.channels.cache.get(String(guildChannel))
				await channel?.send({ embeds: [epicEmbed] })
			}).catch(err => {
				console.log(err);
			});
		}
	}

	start = async () => {
		setInterval(this.getFreeGames, 1000 * 60 * 60);
	}
}



module.exports = { ExtFreeGames }
