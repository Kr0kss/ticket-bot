const {
    Client,
    MessageEmbed,
    Intents,
    MessageActionRow,
    MessageButton
} = require('discord.js');
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
    partials: ["MESSAGE", "USER"]
});
const enmap = require('enmap');
const {
    token,
    prefix
} = require('./config.json');


const settings = new enmap({
    name: "settings",
    autoFetch: true,
    cloneLevel: "deep",
    fetchAll: true
});

client.on('ready', () => {
    console.log('ready')
    client.user.setActivity("🌀 -ticketsetup", {
        type: "LISTENING"
    });
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === "ticketsetup") {
        // ticket-setup #channel

        let channel = message.mentions.channels.first();
        if (!channel) return message.reply("How to use: `-ticketsetup #channel`");

        const button = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('🎫')
                .setLabel('🎫')
                .setStyle('SUCCESS'),
            );

        let sent = await channel.send({
            embeds: [
                new MessageEmbed() // Embed that will be sent after setup
                .setTitle("Ticket System")
                .setDescription("Click the 🎫 button to open a ticket!")
                .setFooter({
                    text: "Kroks © Ticket System"
                })
                .setColor("RANDOM")
            ],
            components: [button]
        });

        settings.set(`${message.guild.id}-ticket`, sent.id);
        message.channel.send("Completed ticket system setup!")
    }

    if (command == "close") {
        if (!message.channel.name.includes("ticket-")) return message.reply("You can't use that here!")
        message.channel.delete();
    }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.member.user.bot) return;

    let ticketid = await settings.get(`${interaction.message.guild.id}-ticket`);
    if (!ticketid) return;

    if (ticketid && interaction.customId === '🎫') {
        interaction.message.guild.channels.create(`ticket-${interaction.member.user.username}`, {
            permissionOverwrites: [{
                    id: interaction.member.user.id,
                    allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
                },
                {
                    id: interaction.message.guild.roles.everyone,
                    deny: ["VIEW_CHANNEL"]
                }
            ],
            type: 'GUILD_TEXT'
        }).then(async channel => {
            channel.send(`<@${interaction.member.user.id}>`,
                new MessageEmbed()
                .setTitle("Welcome to <@473228282293125120> support system!")
                .setDescription("The staff will get in touch with you soon!").setColor("RANDOM"))

            interaction.reply({
                content: `Successfully created your support channel in <#${channel.id}>`,
                ephemeral: true
            })
        })

    }
});


client.login(token);
