// 监听来自background的消息
import React from "react";
import AnkiModal from "./components/AnkiModal";
import {createRoot} from 'react-dom/client';


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
        console.log("save!!!")
        chrome.runtime.sendMessage({type: 'SAVE_ANKI', content: content}, (response) => {
            console.log("response = ", response);
            document.body.removeChild(container);
        });
    }

    const start = c.indexOf('[');
    const end = c.lastIndexOf(']');
    c = c.substring(start, end + 1);
    const root = createRoot(container as HTMLElement); // 类型断言
    root.render(<AnkiModal c={c} onClose={() => {
        root.unmount();
        document.body.removeChild(container);
    }} handleSave={handleSave} />);
}

