const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const Dotenv = require('dotenv-webpack');
const srcDir = path.join(__dirname, "..", "src");

module.exports = {
    entry: {
        popup: path.join(srcDir, 'popup.tsx'),
        options: path.join(srcDir, 'options.tsx'),
        background: path.join(srcDir, 'background.ts'),
        content_script: path.join(srcDir, 'content_script.tsx'),
    },
    output: {
        path: path.join(__dirname, "../dist/js"),
        filename: "[name].js",
    },
    optimization: {
        splitChunks: {
            name: "vendor",
            chunks(chunk) {
                return chunk.name !== 'background';
            }
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    plugins: [
        new CopyPlugin({
            patterns: [{ from: ".", to: "../", context: "public" }],
            options: {},
        }),
        new Dotenv({
            path: '.env', // 默认的 .env 文件路径
            safe: true, // 加载 .env.example
            allowEmptyValues: true, // 允许空值
            systemvars: true, // 加载所有系统环境变量
            silent: true, // 隐藏任何错误
            defaults: false // 不加载 .env.defaults
        })
    ],
};
