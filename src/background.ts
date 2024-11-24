interface Config {
    openAIUrl: string;
    openAIKey: string;
    modelName: string;
    ankiDeskName: string;
    ankiServerAddress: string;
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "add-to-anki",
        title: "Create Anki card",
        contexts: ["selection"],
    });
});

chrome.contextMenus.onClicked.addListener(handleContextMenu);

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SAVE_ANKI') {
        console.log("content_script message.content = ", message.content);
        saveAnki(message.content);
        sendResponse({ success: true });
    }
});

function handleContextMenu(info: any) {
    if (info.menuItemId === "add-to-anki") {
        const text = "请将下列描述提取成anki卡片的形式, 描述: " + info.selectionText + "\n并且以[{\"front\": \"xxx\", \"back\": \"xxx\"}]格式返回";
        getGPTResult(text).then((result) => {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                //TODO  tabs.length == 0, why?
                console.log("tabs = ", tabs);
                if (tabs[0]?.id) {
                    console.log("result = ", result);
                    // 向content script发送消息
                    // TODO bug https://github.com/zjy4fun/Anki-Card-Generator-Chrome-Extension/issues/9
                    chrome.tabs.sendMessage(tabs[0].id, {
                        type: 'SHOW_EDITOR',
                        content: result
                    });
                }
            });
        });
    }
}

console.log(process.env.API_URL);

const defaultAPIUrl = process.env.API_URL ?? "http://localhost:9090/v1/chat/completions";

async function getGPTResult(text: any) {
    const config = await getAnkiConfig() as Config;
    const GPT_API_KEY = config.openAIKey ?? "broswer-copilot-4482"
    const API_URL = config.openAIUrl ?? defaultAPIUrl;
    const MODEL_NAME = config.modelName ?? "ERNIE-Speed-8K";

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + GPT_API_KEY,
        },
        body: JSON.stringify({
            model: MODEL_NAME,
            messages: [{content: text, role: "user"}]
        })
    });
    const data = await response.json();
    const ret = data.choices[0].message.content.trim();
    return ret;
}

async function saveAnki(result: any) {
    const resultArray = JSON.parse(result);
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);  // Month is zero-indexed
    const day = ('0' + today.getDate()).slice(-2);
    const today_time_str = `${year}-${month}-${day}`;

    const config = await getAnkiConfig() as Config;
    const ANKI_DESK_NAME = config.ankiDeskName ?? 'default';
    const ANKI_SERVER_ADDRESS = config.ankiServerAddress ?? "http://localhost:8765";
    console.log('ANKI_DESK_NAME = ', ANKI_DESK_NAME, ' ANKI_SERVER_ADDRESS = ', ANKI_SERVER_ADDRESS);

    const requestData = {
        action: "addNote",
        version: 6,
        params: {
            note: {
                deckName: ANKI_DESK_NAME,
                modelName: "Basic",
                fields: {
                    Front: "",
                    Back: ""
                },
                options: {
                    allowDuplicate: false,
                    duplicateScope: "deck",
                    duplicateScopeOptions: {
                        deckName: "Default",
                        checkChildren: false,
                        checkAllModels: false
                    }
                },
                tags: [today_time_str],
            }
        }
    };

    for (let i = 0; i < resultArray.length; i++) {
        const currentResult = resultArray[i];
        requestData.params.note.fields.Front = currentResult.front;
        requestData.params.note.fields.Back = currentResult.back;

        fetch(ANKI_SERVER_ADDRESS, {
            method: "POST",
            // @ts-ignore
            modelName: "Basic",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        })
            .then((response) => {
                if (response.ok) {
                    console.log("Note added to Anki!");
                    showNotification("add anki success");
                } else {
                    console.error("Failed to add note to Anki:", response);
                    showNotification("add anki failed");
                }
            })
            .catch((error) => {
                console.error("Failed to add note to Anki:", error);
            });
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SAVE_ANKI_CONFIG') {
        chrome.storage.local.set({ankiConfig: message.config});
        console.log("set anki config success");
    }
});

function getAnkiConfig() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("ankiConfig", (result) => {
            if (result.ankiConfig) {
                resolve(result.ankiConfig as Config);
            } else {
                resolve({
                    openAIUrl: defaultAPIUrl,
                    openAIKey: "broswer-copilot-4482",
                    modelName: "ERNIE-Speed-8K",
                    ankiDeskName: "default",
                    ankiServerAddress: "http://localhost:8765",
                });
            }
        });
    });
}

function showNotification(message: any) {
    chrome.notifications.create({
        type: "basic",
        title: "Anki Card Created",
        message: message,
        iconUrl: "unload.png",
    });
}
