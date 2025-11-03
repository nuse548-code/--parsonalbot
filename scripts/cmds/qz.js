const ax = require("axios");

const b = async () => "https://nix-quizz.vercel.app";

module.exports = {
  config: {
    name: "quiz",
    aliases: ["qz"],
    version: "0.0.1",
    author: "ArYAN",
    countDown: 0,
    role: 0,
    category: "game",
    guide: "{p}quiz <bn/en> \nExample: {p}quiz bn",
  },

  onStart: async function ({ api, event, usersData, args }) {
    const available = ["bangla", "english"];
    let category;

    if (!args[0]) {
      category = available[Math.floor(Math.random() * available.length)];
    } else {
      const input = args[0].toLowerCase();
      if (input === "bn" || input === "bangla") category = "bangla";
      else if (input === "en" || input === "english") category = "english";
      else return api.sendMessage(
        "❌ | Invalid category\nAvailable: " + available.join(", "),
        event.threadID,
        event.messageID
      );
    }

    try {
      const r = await ax.get(`${await b()}/quiz?category=${category}&q=random`);
      const q = r.data.question;
      const { question, correctAnswer, options } = q;
      const { a: oA, b: oB, c: oC, d: oD } = options;
      const n = await usersData.getName(event.senderID);

      const m = {
        body: `\n╭──✦ ${question}\n├‣ 𝐀• ${oA}\n├‣ 𝐁• ${oB}\n├‣ 𝐂• ${oC}\n├‣ 𝐃• ${oD}\n╰──────────────‣\nReply with your answer\n➜ A B C D `,
      };

      api.sendMessage(m, event.threadID, (e, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          type: "quiz",
          commandName: this.config.name,
          author: event.senderID,
          messageID: info.messageID,
          dataGame: q,
          correctAnswer,
          nameUser: n,
          attempts: 0
        });
      }, event.messageID);

    } catch (e) {
      console.error(e);
      api.sendMessage("[⚜️]➜ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐟𝐞𝐭𝐜𝐡 𝐪𝐮𝐢𝐳. 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫.", event.threadID, event.messageID);
    }
  },

  onReply: async ({ event, api, Reply, usersData }) => {
    if (!Reply) return;
    const { correctAnswer: ca, nameUser: n, author: u } = Reply;

    if (event.senderID !== u) return api.sendMessage("❌ 𝐎𝐧𝐥𝐲 𝐭𝐡𝐞 𝐨𝐫𝐢𝐠𝐢𝐧𝐚𝐥 𝐩𝐥𝐚𝐲𝐞𝐫 𝐜𝐚𝐧 𝐚𝐧𝐬𝐰𝐞𝐫 𝐭𝐡𝐢𝐬 𝐪𝐮𝐢𝐳. ", event.threadID, event.messageID);

    const max = 2;
    const r = event.body.toLowerCase();

    if (Reply.attempts >= max) {
      await api.unsendMessage(Reply.messageID);
      return api.sendMessage(`[⭕]➜ ${n} 𝐲𝐨𝐮 𝐡𝐚𝐯𝐞 𝐫𝐞𝐚𝐜𝐡𝐞𝐝 𝐭𝐡𝐞 𝐦𝐚𝐱𝐢𝐦𝐮𝐦 𝐚𝐭𝐭𝐞𝐦𝐩𝐭𝐬 (${max}).\n✅ | Correct answer: ${ca}`, event.threadID, event.messageID);
    }

    if (r === ca.toLowerCase()) {
      await api.unsendMessage(Reply.messageID).catch(console.error);
      const coins = 300;
      const exp = 100;
      const d = await usersData.get(u);

      await usersData.set(u, {
        money: d.money + coins,
        exp: d.exp + exp,
        data: d.data,
      });

      return api.sendMessage(`🎉 𝐂𝐨𝐧𝐠𝐫𝐚𝐭𝐮𝐥𝐚𝐭𝐢𝐨𝐧𝐬 🎉\n👤𝐍𝐚𝐦𝐞: ${n}\n You answered correctly.\n💰 𝐂𝐨𝐢𝐧𝐬: +${coins}\n🌟 𝐄𝐗𝐏: +${exp}`, event.threadID, event.messageID);
    } else {
      Reply.attempts += 1;
      global.GoatBot.onReply.set(Reply.messageID, Reply);
      return api.sendMessage(`[❌]➜ 𝐖𝐫𝐨𝐧𝐠 𝐚𝐧𝐬𝐰𝐞𝐫 𝐀𝐭𝐭𝐞𝐦𝐩𝐭𝐬 𝐥𝐞𝐟𝐭: ${max - Reply.attempts}`, event.threadID, event.messageID);
    }
  },
};
