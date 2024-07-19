/*const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder} = require('discord.js');
module.exports = {
	data : new SlashCommandBuilder()
	.setName('kink')
	.setDescription('kinklist'),
	.addUserOption(option => 
		option.setName('target')
			.setDescription('Le membre à bannir')
			.setRequired(true))
	.addStringOption(option => 
		option.setName('reason')
			.setDescription('La raison du bannissement')
			.setRequired(false)),

    async  execute(interaction) {
		//const target = interaction.options.getUser('target');
		//const reason = interaction.options.getString('reason') ?? 'No reason provided';
		
		const confirm = new ButtonBuilder()
			.setCustomId('confirm')
			.setLabel('Confirm Ban')
			.setStyle(ButtonStyle.Danger);

		const cancel = new ButtonBuilder()
			.setCustomId('cancel')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder()
			.addComponents(cancel, confirm);

		const response = await interaction.reply({
			content: `Are you sure you want to ban ${target} for reason: ${reason}?`,
			components: [row],
			//ephemeral: true // Visible uniquement pour l'utilisateur ayant exécuté la commande
		});
		const collectorFilter = i => i.user.id === interaction.user.id;

		try {
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
		if (confirmation.customId === 'confirm') {
			await interaction.guild.members.ban(target);
			await confirmation.update({ content: `${target.username} has been banned for reason: ${reason}`, components: [] });
		} else if (confirmation.customId === 'cancel') {
			await confirmation.update({ content: 'Action cancelled', components: [] });
		}
		} catch (e) {
			await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
		
		}
	}
};*/

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kink')
        .setDescription('Poser des questions une par une avec des boutons de navigation'),

    async execute(interaction) {
        const questions = [
            "caresses corporelle",
            "french kiss",
            "teasing",
            "stimulation des téton",
            "masturbation",
            "félation",
            "pénétration vaginal",
            "stimulation des bourse",
            "gorge profonde",
            "cunnilingus",
            "Edger",
            "JOI",
            "Slow sex",
            "sexe interne",
            "massage",
            "tantra",
            "tribadisme"

        ];

        const options = ["kink","j'aime bien", "Peut-être", "Non"];
        const responses = { donneur: {}, receveur: {} };
        let currentQuestionIndex = 0;
        let currentRole = 'donneur';

        const createButtons = () => {
            const row = new ActionRowBuilder();

            if (currentQuestionIndex > 0 || currentRole === 'receveur') {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('Reculer')
                        .setStyle(ButtonStyle.Secondary)
                );
            }

            options.forEach((option, index) => {
                if (currentRole === 'donneur') {
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`donneur_${currentQuestionIndex}_${index}`)
                            .setLabel(option)
                            .setStyle(ButtonStyle.Primary)
                    );
                } else {
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`receveur_${currentQuestionIndex}_${index}`)
                            .setLabel(option)
                            .setStyle(ButtonStyle.Primary)
                    );
                }
            });

            return row;
        };

        const generateImage = async (responses) => {
            const canvas = createCanvas(800, 600);
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#ffffff'; // Background color
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Define text style
            ctx.fillStyle = '#000000'; // Text color
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';

            // Draw questions
            let y = 30;
            const textX = 20;
            const circleXDonneur = 400;
            const circleXReceveur = 600;
            const circleRadius = 6;

            ctx.fillText('Questions:', textX, y);
            y += 30;

            for (const question of questions) {
                ctx.fillText(question, textX, y);
                y += 25;
            }

            // Draw responses
            const circleOffsetX = 10;  // Adjust this to move circles closer or further from text
            ctx.fillText('Donneur:', circleXDonneur - 2 * circleOffsetX, 30);
            ctx.fillText('Receveur:', circleXReceveur - 2 * circleOffsetX, 30);
            y = 60;

            for (const question of questions) {
                if (responses.donneur[question]) {
                    const answer = responses.donneur[question];
                    const color = answer === "j'aime bien" ? 'green' : answer === 'Non' ? 'red' : answer === 'kink' ? 'purple' : 'orange';
                    ctx.beginPath();
                    ctx.arc(circleXDonneur - circleOffsetX, y, circleRadius, 0, Math.PI * 2, true);
                    ctx.fillStyle = color;
                    ctx.fill();
                }
                if (responses.receveur[question]) {
                    const answer = responses.receveur[question];
                    const color = answer === "j'aime bien" ? 'green' : answer === 'Non' ? 'red'  : answer === 'kink' ? 'purple' : 'orange';
                    ctx.beginPath();
                    ctx.arc(circleXReceveur - circleOffsetX, y, circleRadius, 0, Math.PI * 2, true);
                    ctx.fillStyle = color;
                    ctx.fill();
                }
                y += 25;
            }

            // Draw legend
            y = canvas.height - 120;
            ctx.fillText('Légende:', textX, y);

            const legend = [
                { label: 'kink', color: 'purple' },
                { label: "J'aime bien", color: 'green' },
                { label: 'Non', color: 'red' },
                { label: 'Peut-être', color: 'orange' },
               
            ];

            y += 20;

            legend.forEach(item => {
                ctx.fillStyle = item.color;
                ctx.beginPath();
                ctx.arc(textX + 10, y, circleRadius, 0, Math.PI * 2, true);
                ctx.fill();

                ctx.fillStyle = '#000000';
                ctx.fillText(item.label, textX + 30, y + 5);

                y += 30;
            });

            const imagePath = path.join(__dirname, 'responses.png');
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(imagePath, buffer);
            return imagePath;
        };

        // Initial reply to interaction
        await interaction.reply({
            content: `Question pour ${currentRole}: ${questions[currentQuestionIndex]}`,
            components: [createButtons()],
            ephemeral: true
        });

        const filter = i => i.user.id === interaction.user.id;

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60_000 });

        collector.on('collect', async i => {
            if (i.customId.startsWith('donneur_') || i.customId.startsWith('receveur_')) {
                const [role, questionIndex, optionIndex] = i.customId.split('_');
                const selectedOption = options[parseInt(optionIndex)];
                responses[role][questions[parseInt(questionIndex)]] = selectedOption;

                if (currentRole === 'donneur') {
                    currentRole = 'receveur';
                } else {
                    currentRole = 'donneur';
                    currentQuestionIndex++;
                }

                // Ensure both roles have answered the current question before moving on
                if (responses.donneur[questions[currentQuestionIndex]] && responses.receveur[questions[currentQuestionIndex]]) {
                    if (currentQuestionIndex < questions.length) {
                        await i.update({
                            content: `Question pour ${currentRole}: ${questions[currentQuestionIndex]}`,
                            components: [createButtons()]
                        });
                    } else {
                        collector.stop();
                        const imagePath = await generateImage(responses);
                        const attachment = new AttachmentBuilder(imagePath);
                        await i.reply({ content: 'Questionnaire terminé! Voici vos réponses :', files: [attachment], ephemeral: true });
                    }
                } else {
                    await i.update({
                        content: `Question pour ${currentRole}: ${questions[currentQuestionIndex]}`,
                        components: [createButtons()]
                    });
                }
            } else if (i.customId === 'next') {
                if (responses.donneur[questions[currentQuestionIndex]] && responses.receveur[questions[currentQuestionIndex]]) {
                    currentQuestionIndex++;
                    currentRole = 'donneur';

                    if (currentQuestionIndex < questions.length) {
                        await i.update({
                            content: `Question pour ${currentRole}: ${questions[currentQuestionIndex]}`,
                            components: [createButtons()]
                        });
                    } else {
                        await i.update({ content: 'Vous avez terminé le questionnaire.', components: [] });
                    }
                } else {
                    await i.update({
                        content: `Veuillez répondre pour les deux rôles avant de passer à la question suivante.`,
                        components: [createButtons()]
                    });
                }
            } else if (i.customId === 'prev') {
                if (currentRole === 'donneur') {
                    currentRole = 'receveur';
                } else {
                    currentRole = 'donneur';
                    currentQuestionIndex--;
                }

                if (currentQuestionIndex >= 0) {
                    await i.update({
                        content: `Question pour ${currentRole}: ${questions[currentQuestionIndex]}`,
                        components: [createButtons()]
                    });
                } else {
                    await i.update({ content: 'Vous êtes à la première question.', components: [createButtons()] });
                }
            }
        });

        collector.on('end', async (reason) => {
            if (reason === 'time') {
                const imagePath = await generateImage(responses);
                const attachment = new AttachmentBuilder(imagePath);
                await interaction.followUp({ content: `Temps écoulé! Voici les réponses disponibles :`, files: [attachment], ephemeral: true });
            }
        });
    }
};
