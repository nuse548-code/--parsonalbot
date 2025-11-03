const fs = require("fs-extra");
const request = require("request");

module.exports = {
  config: {
    name: "groupinfo",
    aliases: ["boxinfo"],
    version: "1.2",
    author: "Rakib",
    countDown: 5,
    role: 0,
    shortDescription: "See Box info",
    category: "box chat",
    guide: {
      en: "{p} [groupinfo|boxinfo]",
    },
  },

  onStart: async function ({ api, event }) {
    const threadInfo = await api.getThreadInfo(event.threadID);

    const totalMembers = threadInfo.participantIDs.length;

    let maleCount = 0;
    let femaleCount = 0;
    let unknownGenderCount = 0;

    for (const userID in threadInfo.userInfo) {
      const gender = threadInfo.userInfo[userID].gender;
      if (gender === "MALE") maleCount++;
      else if (gender === "FEMALE") femaleCount++;
      else unknownGenderCount++;
    }

    const admins = threadInfo.adminIDs;
    const adminCount = admins.length;

    let adminList = "";
    for (const admin of admins) {
      try {
        const userInfo = await api.getUserInfo(admin.id);
        const name = userInfo[admin.id]?.name || "Unknown";
        adminList += `🌟 ${name}\n`;
      } catch {
        adminList += "🌟 Unknown\n";
      }
    }

    // Approval mode
    const approvalMode = threadInfo.approvalMode ? "✅ Enabled" : "❌ Disabled";

    // Group emoji
    const emoji = threadInfo.emoji || "🔰";

    // Thread name and ID
    const threadName = threadInfo.threadName;
    const threadID = threadInfo.threadID;

    // Total messages
    const messageCount = threadInfo.messageCount;

    // Build the message with a stylish box design
    const message =
`╭━━━━━ ✦ 𝙶𝚁𝙾𝚄𝙿 𝙸𝙽𝙵𝙾 ✦ ━━━━━╮
┃
┃ 📛 𝙽𝚊𝚖𝚎: ${threadName}
┃ 🆔 𝙸𝙳: ${threadID}
┃
┃ 👥 𝚃𝚘𝚝𝚊𝚕 𝙼𝚎𝚖𝚋𝚎𝚛𝚜: ${totalMembers}
┃ ♂️ 𝙼𝚊𝚕𝚎𝚜: ${maleCount}
┃ ♀️ 𝙵𝚎𝚖𝚊𝚕𝚎𝚜: ${femaleCount}
┃ ❓ 𝚄𝚗𝚔𝚗𝚘𝚠𝚗: ${unknownGenderCount}
┃
┃ 🔐 𝙰𝚙𝚙𝚛𝚘𝚟𝚊𝚕 𝙼𝚘𝚍𝚎: ${approvalMode}
┃ ✨ 𝙴𝚖𝚘𝚓𝚒: ${emoji}
┃
┃ 🛡️ 𝙰𝚍𝚖𝚒𝚗𝚜 (${adminCount}):
┃${adminList.trim() ? adminList : "• 𝙽𝚘 𝙰𝚍𝚖𝚒𝚗𝚜 𝚈𝚎𝚝"}
┃
┃ 💬 𝚃𝚘𝚝𝚊𝚕 𝙼𝚎𝚜𝚜𝚊𝚐𝚎𝚜: ${messageCount} msgs
┃
╰━━━━━ ✦ 𝚁𝙰𝙷𝙰𝙳 𝙱𝙾𝚃 ✦ ━━━━━╯`;

    // Download group image
    const imagePath = __dirname + "/cache/group_image.png";
    const imageURL = threadInfo.imageSrc;

    // Send with image attachment
    const sendMessage = () => {
      api.sendMessage(
        {
          body: message,
          attachment: fs.createReadStream(imagePath),
        },
        event.threadID,
        () => fs.unlinkSync(imagePath),
        event.messageID
      );
    };

    // Download image and send message
    request(encodeURI(imageURL))
      .pipe(fs.createWriteStream(imagePath))
      .on("close", sendMessage)
      .on("error", () => {
        // If image fails to download, send message without image
        api.sendMessage(message, event.threadID, event.messageID);
      });
  },
};
