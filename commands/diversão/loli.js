const Discord = require("discord.js");
module.exports = {
  name: "loli",
  aliases: [],
  cooldown: 2,
  category: "diversão",
  description: "Certeza que quer fazer isso?",
  usage: "m!loli",
  run: async (client, message, args) => {
  message.channel.send("if (comando == loli) {\n    mensagem.autor.preso == true;\n    tempoPreso == 8 anos;\n  }");
}}

