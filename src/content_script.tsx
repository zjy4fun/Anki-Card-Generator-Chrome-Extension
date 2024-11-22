// 监听来自background的消息
import React from "react";
import AnkiModal from "./components/AnkiModal";
import ReactDOM from "react-dom";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SHOW_EDITOR') {
        console.log("content_script message.content = ", message.content);
        createEditor(message.content);
    }
});

function createEditor(c: string) {
    const container = document.createElement('div');
    container.id = 'anki-editor';
    document.body.appendChild(container);

    const handleSave = (content: string) => {
        // TODO
        console.log("save!!!")

        // 向content script发送消息
        chrome.runtime.sendMessage({type: 'SAVE_ANKI', content: content}, (response) => {
            console.log("response = ", response);
            document.body.removeChild(container);
        });
    }
    ReactDOM.render(<AnkiModal c={c} onClose={() => {
        document.body.removeChild(container);
    }} handleSave={handleSave}/>, container);
}

