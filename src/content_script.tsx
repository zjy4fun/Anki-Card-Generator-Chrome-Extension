// 监听来自background的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SHOW_EDITOR') {
        createEditor(message.content);
    }
});

function createEditor(content: string) {
    // 创建编辑器容器
    const editorContainer = document.createElement('div');
    editorContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        min-width: 400px;
        min-height: 300px;
        display: flex;
        flex-direction: column;
    `;

    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999;
    `;

    // 创建文本区域
    const textarea = document.createElement('textarea');
    textarea.style.cssText = `
        width: 100%;
        height: 200px;
        margin-bottom: 20px;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        resize: vertical;
        font-family: monospace;
    `;

    // 设置初始内容，尝试格式化JSON
    try {
        const formattedContent = JSON.stringify(JSON.parse(content), null, 2);
        textarea.value = formattedContent;
    } catch (e) {
        textarea.value = content;
    }

    // 创建按钮容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    `;

    // 创建取消按钮
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '取消';
    cancelButton.style.cssText = `
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        background: #f5f5f5;
        cursor: pointer;
    `;

    // 创建确认按钮
    const confirmButton = document.createElement('button');
    confirmButton.textContent = '确认';
    confirmButton.style.cssText = `
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        background: #4CAF50;
        color: white;
        cursor: pointer;
    `;

    // 添加按钮事件
    cancelButton.onclick = () => {
        document.body.removeChild(overlay);
        document.body.removeChild(editorContainer);
    };

    confirmButton.onclick = () => {
        try {
            // 验证JSON格式
            const parsedContent = JSON.parse(textarea.value);
            // 验证数组格式是否正确
            if (!Array.isArray(parsedContent) || !parsedContent.every(item =>
                typeof item === 'object' &&
                'front' in item &&
                'back' in item)) {
                throw new Error('格式不正确，请确保是包含front和back属性的对象数组');
            }


            // 发送消息给background script保存数据
            chrome.runtime.sendMessage({
                type: 'SAVE_ANKI',
                content: textarea.value
            }, (response) => {
                if (response.success) {
                    // 关闭编辑器
                    document.body.removeChild(overlay);
                    document.body.removeChild(editorContainer);

                    // 提示保存成功
                    alert('保存成功');
                }
            });
        } catch (e) {
            // @ts-ignore
            alert('输入格式不正确：' + e.message);
        }
    };

    // 组装界面
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    editorContainer.appendChild(textarea);
    editorContainer.appendChild(buttonContainer);

    // 添加到页面
    document.body.appendChild(overlay);
    document.body.appendChild(editorContainer);

    // 焦点设置到文本框
    textarea.focus();
}
