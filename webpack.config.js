const path = require("path");
// 這個插件可以用來提取CSS程式, 使其變成一個獨立CSS檔
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    mode: 'production',
    entry: {
        app: [
            "./src/js/index.js"
        ]
    },
    output: {
        path: path.resolve("./public/assets"),
        filename: "bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use:  {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                // use: ["style-loader", "css-loader", "postcss-loader"]
                /**
                 * 利用 extractPlugin 實例裡的 extract 來建立 Loader
                 * 讀取順序由下而上: postcss-loader -> css-loader -> style-loader
                 * css-loader的 options.url = false 代表不特別處理CSS裡的URL例如圖片網址
                 */
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: './public/assets'
                        }
                    },
                    {
                        loader: 'css-loader',
                        options: { url: false }
                    },
                    'postcss-loader'
                ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "bundle.css",
            // chunkFilename: "[id].css"
        }),
    ]
};