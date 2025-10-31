cmd install video2.js const axios = require("axios");
const yts = require("yt-search");

(async () => {
  const { data } = await axios.get("https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json");
  global.apis = { diptoApi: data.api };
})();

async function getStream(url, name) {
  const r = await axios.get(url, { responseType: "stream" });
  r.data.path = name;
  return r.data;
}

function ytID(url) {
  const m = url.match(/(?:youtu\.be\/|v=|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

module.exports = {
  config: { name: "video2", author: "Rakib", version: "1.0.0" },
  onStart: async ({ api, args, event }) => {
    try {
      let id, m;
      const q = args.join(" ");
      if (q.includes("youtu")) id = ytID(q);
      else {
        m = await api.sendMessage(`Searching "${q}"...`, event.threadID);
        const s = await yts(q);
        id = s.videos[0].videoId;
      }

      const { data } = await axios.get(`${global.apis.diptoApi}/ytDl3?link=${id}&format=mp4`);
      if (m) api.unsendMessage(m.messageID);

      // Removed TinyURL shortening, using direct link
      api.sendMessage({
        body: `🎬 ${data.title}\n📺 ${data.quality}\n🔗 ${data.downloadLink}`,
        attachment: await getStream(data.downloadLink, `${data.title}.mp4`)
      }, event.threadID, event.messageID);

    } catch (e) {
      api.sendMessage(e.message, event.threadID, event.messageID);
    }
  },
  run: async (ctx) => module.exports.onStart(ctx)
};
