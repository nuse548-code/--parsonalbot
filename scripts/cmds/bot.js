const axios = require('axios');
const baseApiUrl = async () => {
    return "https://www.noobs-api.rf.gd/dipto";
};

module.exports.config = {
    name: "bby",
    aliases: ["baby", "bbe", "babe"],
    version: "6.9.0",
    author: "dipto",
    countDown: 0,
    role: 0,
    description: "better then all sim simi",
    category: "chat",
    guide: {
        en: "{pn} [anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2], [Reply3]... OR\nteach [react] [YourMessage] - [react1], [react2], [react3]... OR\nremove [YourMessage] OR\nrm [YourMessage] - [indexNumber] OR\nmsg [YourMessage] OR\nlist OR \nall OR\nedit [YourMessage] - [NeeMessage]"
    }
};

module.exports.onStart = async ({
    api,
    event,
    args,
    usersData
}) => {
    const link = `${await baseApiUrl()}/baby`;
    const dipto = args.join(" ").toLowerCase();
    const uid = event.senderID;
    let command, comd, final;

    try {
        if (!args[0]) {
            const ran = ["Bolo baby", "hum", "type help baby", "type !baby hi"];
            return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID);
        }

        if (args[0] === 'remove') {
            const fina = dipto.replace("remove ", "");
            const dat = (await axios.get(`${link}?remove=${fina}&senderID=${uid}`)).data.message;
            return api.sendMessage(dat, event.threadID, event.messageID);
        }

        if (args[0] === 'rm' && dipto.includes('-')) {
            const [fi, f] = dipto.replace("rm ", "").split(' - ');
            const da = (await axios.get(`${link}?remove=${fi}&index=${f}`)).data.message;
            return api.sendMessage(da, event.threadID, event.messageID);
        }

        if (args[0] === 'list') {
            if (args[1] === 'all') {
                const data = (await axios.get(`${link}?list=all`)).data;
                const teachers = await Promise.all(data.teacher.teacherList.map(async (item) => {
                    const number = Object.keys(item)[0];
                    const value = item[number];
                    const name = (await usersData.get(number)).name;
                    return {
                        name,
                        value
                    };
                }));
                teachers.sort((a, b) => b.value - a.value);
                const output = teachers.map((t, i) => `${i + 1}/ ${t.name}: ${t.value}`).join('\n');
                return api.sendMessage(`Total Teach = ${data.length}\n👑 | List of Teachers of baby\n${output}`, event.threadID, event.messageID);
            } else {
                const d = (await axios.get(`${link}?list=all`)).data.length;
                return api.sendMessage(`Total Teach = ${d}`, event.threadID, event.messageID);
            }
        }

        if (args[0] === 'msg') {
            const fuk = dipto.replace("msg ", "");
            const d = (await axios.get(`${link}?list=${fuk}`)).data.data;
            return api.sendMessage(`Message ${fuk} = ${d}`, event.threadID, event.messageID);
        }

        if (args[0] === 'edit') {
            const command = dipto.split(' - ')[1];
            if (command.length < 2) return api.sendMessage('❌ | Invalid format! Use edit [YourMessage] - [NewReply]', event.threadID, event.messageID);
            const dA = (await axios.get(`${link}?edit=${args[1]}&replace=${command}&senderID=${uid}`)).data.message;
            return api.sendMessage(`changed ${dA}`, event.threadID, event.messageID);
        }

        if (args[0] === 'teach' && args[1] !== 'amar' && args[1] !== 'react') {
            [comd, command] = dipto.split(' - ');
            final = comd.replace("teach ", "");
            if (command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
            const re = await axios.get(`${link}?teach=${final}&reply=${command}&senderID=${uid}`);
            const tex = re.data.message;
            const teacher = (await usersData.get(re.data.teacher)).name;
            return api.sendMessage(`✅ Replies added ${tex}\nTeacher: ${teacher}\nTeachs: ${re.data.teachs}`, event.threadID, event.messageID);
        }

        if (args[0] === 'teach' && args[1] === 'amar') {
            [comd, command] = dipto.split(' - ');
            final = comd.replace("teach ", "");
            if (command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
            const tex = (await axios.get(`${link}?teach=${final}&senderID=${uid}&reply=${command}&key=intro`)).data.message;
            return api.sendMessage(`✅ Replies added ${tex}`, event.threadID, event.messageID);
        }

        if (args[0] === 'teach' && args[1] === 'react') {
            [comd, command] = dipto.split(' - ');
            final = comd.replace("teach react ", "");
            if (command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
            const tex = (await axios.get(`${link}?teach=${final}&react=${command}`)).data.message;
            return api.sendMessage(`✅ Replies added ${tex}`, event.threadID, event.messageID);
        }

        if (dipto.includes('amar name ki') || dipto.includes('amr nam ki') || dipto.includes('amar nam ki') || dipto.includes('amr name ki') || dipto.includes('whats my name')) {
            const data = (await axios.get(`${link}?text=amar name ki&senderID=${uid}&key=intro`)).data.reply;
            return api.sendMessage(data, event.threadID, event.messageID);
        }

        const d = (await axios.get(`${link}?text=${dipto}&senderID=${uid}&font=1`)).data.reply;
        api.sendMessage(d, event.threadID, (error, info) => {
            global.GoatBot.onReply.set(info.messageID, {
                commandName: this.config.name,
                type: "reply",
                messageID: info.messageID,
                author: event.senderID,
                d,
                apiUrl: link
            });
        }, event.messageID);

    } catch (e) {
        console.log(e);
        api.sendMessage("Check console for error", event.threadID, event.messageID);
    }
};

module.exports.onReply = async ({
    api,
    event,
    Reply
}) => {
    try {
        if (event.type == "message_reply") {
            const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(event.body?.toLowerCase())}&senderID=${event.senderID}&font=1`)).data.reply;
            await api.sendMessage(a, event.threadID, (error, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                    a
                });
            }, event.messageID);
        }
    } catch (err) {
        return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
    }
};

module.exports.onChat = async ({
    api,
    event,
    message,
    usersData
}) => {
    try {
        const body = event.body ? event.body?.toLowerCase() : "";
        const uid = event.senderID;
        const name = (await usersData.get(uid)).name || "প্রিয়";

        if (body.startsWith("bot") || body.startsWith("বট")) {
            const arr = body.replace(/^\S+\s*/, "");

            const rawReplies = [
              "বলো কি বলবা, সবার সামনে বলবা নাকি?🦆💨",
              "•আমার বস 〲RAKIB卝 〲 হাসানツ࿐a র মন খারাপ 🥺",
              "তুই কি Wi-Fi? কাছে এলেই কানেকশন হারায়া ফেলি 😵",
              "Hmm bolo 🐹",
              "•বট বট না করে আমার বস RAKIB রে মেসেজ দে 🐸",
              "এতো ডাকাডাকি করস কেন 😾",
              "😘💋",
              "Yes 🐣",
              "তুই পড়তে না বসে যদি আরেকটা মেসেজ দিস... তাহলে তুই গরু 🐄🤓",
              "I am here 💅",
              "Hi 🙃",
              "hae bolo Jan pakhi 🎀✨","»⑅⃝😽Rakib Boss Ke Ummah de»⑅⃝💚🪽"," Gruper Shob Bedire Ummmmah🙈🙈","Bolen Khachorer dol /🫡",
              "হ্যাঁ টুনটুনি বলো 🤭","আমি তোরে সাহায্য করতে পারবো না কারণ তুই অনেক পচা!!😬","_আমাকে না ডেকে আমার বস Rakibকে ডাক দে😝","আমাকে এত ডাকিস কেন!🐥","hae bolo Jan pakhi","হুম বলো না বাবু 🥺","𖠣꙰ٜٜٜٜٜٜٜٜٜ̋̀̋̀̋̀̋̀̋̀̋̀⚀ค้้้้้้้้้้้้้้้้้้้­้้้้้้้้้้้้้้้้้้้้­้้้้้้้้ـٰٖٖٖٖٖٜ۬ـٰٰٖٖٖٖٜ۬ـٰٰٰٖٖٖٜ۬ـٰٰٰٰٖٖٜ۬ـٰٰٰٰٰٖٜ۬𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮𝐚𝐥𝐢𝐤𝐨𝐦ـٰٖٖٖٖٖٜ۬ـٰٰٖٖٖٖٜ۬ـٰٰٰٖٖٖٜ۬ـٰٰٰٰٖٖٜ۬ـٰٰٰٰٰٖٜ۬ค้้้้้้้้้้้้้้้้้้้­้้้้้้้้้้้้้้้้้้้้­้้้้้้้้𖠣꙰ٜٜٜٜٜٜٜٜٜ̋̀̋","•⎯͢⎯⃝ꪜ🩷🪽 𝙸 𝙻𝚘𝚟𝚎 𝚄 . আ্ঁল্লা্ঁহ্ঁ⎯͢⎯⃝🍒 ই্ঁউ্ঁ⎯͢লা্ঁভ্ঁ⎯⃝মি্ঁ😌 ⎯͢⎯⃝🌺","•⎯͢⎯⃝ꪜ🩷চুৃ্ঁপৃ্ঁ•⎯͢°ꪜচা্ঁপৃ্ঁ😾🪽 𝙸 𝙻𝚘𝚟𝚎 𝚄 .ক্ঁ ⎯͢⎯⃝🍒 নৃ্ঁয়ৃ্ঁতোৃ্ঁ⎯͢⎯͢উ্ঁস্টা্ঁ⎯⃝দিৃ্ঁমুৃ্ঁ🍒 ⎯͢⎯⃝😹","𝐀𝐦𝐢 𝐌𝐮𝐭𝐮 𝐀𝐫 𝐑𝐚𝐤𝐢𝐛𝐞𝐫 𝐁𝐨𝐰 𝐏𝐚𝐭𝐥𝐮 🤣"," 𝐑𝐚𝐤𝐢𝐛 𝐊𝐞 𝐁𝐨𝐥𝐨 𝐀𝐦𝐢 𝐤𝐚𝐫 "," 𝐎𝐢𝐢 𝐛𝐛𝐲 𝐀𝐦𝐚𝐤𝐞 𝐛𝐢𝐲𝐞 𝐤𝐨𝐫𝐛𝐚","𝐉𝐚𝐧 𝐓𝐮𝐦𝐢 𝐀𝐫 𝐀𝐦𝐢 𝐀𝐥𝐥𝐚𝐡 𝐤𝐞 𝐝𝐚𝐤𝐢.𝐜𝐡𝐨𝐥𝐨 "," 𝐀𝐥𝐥𝐚𝐡 𝐊𝐞 𝐕𝐨𝐲 𝐤𝐨𝐫𝐨","»⑅⃝😽হা্ঁস্ঁবি্ঁ আ্ঁল্লা্ঁহ্ঁ»⑅⃝💚🪽","𝄟≛⃝💚তা্ঁও্ঁয়া্ঁক্কা্ঁল্ঁতু্ঁ আ্ঁলা্ঁল্লা্ঁহ্ঁ༎𝄟≛⃝🌻","⎯͢⎯⃝🌚 স্ঁব্ঁ ক্ঁয়্ঁটা্ঁ শ্ঁয়্ঁতা্ঁন্ঁ ত্ঁরা্ঁ⎯͢⎯⃝🙂🐸","এঁকঁ།কিঁত্বঁ খুঁবঁ 𝐒𝘂n͜͡𝐃𝗼𝗿🌷🍒🪽","⎯͢⎯⃝🌚 স্ঁব্ঁ ক্ঁয়্ঁটা্ঁ শ্ঁয়্ঁতা্ঁন্ঁ ত্ঁরা্ঁ⎯͢⎯⃝🙂🐸","এঁকঁ།কিঁত্বঁ খুঁবঁ 𝐒𝘂n͜͡𝐃𝗼𝗿🌷🍒🪽","হালাল উপার্জন শ্রেষ্ঠ অর্জন!-🌸💚","➺༊ 𝐌𝐚 ♡-ম།নে'ই জ།ন্ন།ত'❯—͟͟͞͞🫶","🫦≛⃝͢➻༏༏বিরাট ভদ্র ছেরি♡⏤͟͟͞͞ ⃝ 🫶Rakiber bow","༺ বাড়াইলি মনেরি জ্বালা ༻","༺/ঘটক বুঝি আমার বাড়ির রাস্তা চিনে না👀😒  ༻","✿⃟✿⃟    মাঁ'য়েঁরঁ দোঁয়াঁই সেঁরাঁ'-!!❤️🤲✿⃟🤗✿⃟❤️","🫵🌚 ও্ঁয়ে্ঁল্ঁ খা্ঁম্ঁ ভ্ঁন্ডি্ঁ —͟͟͞͞𖣘🐸♡»̶̶͓͓͓̽̽̽ ⑅⃝💝","____𝐍𝐞𝐞𝐃 - 𝐁𝐚𝐒𝐭'𝐄 ` 𝐗𝐚𝐧` (🐰🐭",
              "বেবি বলো","কি বলবা আমার RAKIB  কাছে বল🦆💨","hussss😼",
            ];

            const selectedReply = rawReplies[Math.floor(Math.random() * rawReplies.length)];
            const finalReply =selectedReply;

            if (!arr) {
                await api.sendMessage(finalReply, event.threadID, (error, info) => {
                    if (!info) return message.reply("info obj not found");
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName: this.config.name,
                        type: "reply",
                        messageID: info.messageID,
                        author: event.senderID
                    });
                }, event.messageID);
                return;
            }

            const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(arr)}&senderID=${event.senderID}&font=1`)).data.reply;
            await api.sendMessage(a, event.threadID, (error, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                    a
                });
            }, event.messageID);
        }
    } catch (err) {
        return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
    }
};
