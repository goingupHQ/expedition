"use strict";
exports.__esModule = true;
// tslint:disable:no-implicit-dependencies
var path = require("path");
var webpack = require("webpack");
// webpack plugins
var CopyWebpackPlugin = require("copy-webpack-plugin");
// postcss plugins
var autoprefixer = require("autoprefixer");
var isProd = function () {
    return process.env.NODE_ENV === "production";
};
console.log('isProd?', isProd());
var buildConfig = {
    mode: isProd() ? 'production' : 'development',
    entry: {
        bundle: path.join(__dirname, "src/index.tsx"),
        vendor_bundle: ["react", "react-dom", "bluebird", "ethereumjs-util"]
    },
    module: {
        rules: [
            // compile ts
            {
                exclude: /node_modules/,
                loader: "ts-loader",
                test: /\.tsx?$/
            },
            // css loader
            // source maps are generated only for dev builds
            // css compression is only used for prod builds
            {
                test: /\.css$/,
                use: [
                    { loader: "style-loader", options: { sourceMap: !isProd() } },
                    {
                        loader: "css-loader", options: {
                            localIdentName: isProd() ? "[hash:base64]" : "[path][name]__[local]__[hash:base64:6]",
                            minimize: isProd(),
                            modules: true,
                            sourceMap: !isProd()
                        }
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: function () { return [autoprefixer({
                                    browsers: [
                                        ">1%",
                                        "last 4 versions",
                                        "Firefox ESR",
                                        "not ie < 9",
                                    ]
                                })]; },
                            sourceMap: !isProd()
                        }
                    },
                ]
            },
            // file loader for media assets
            {
                exclude: [
                    /\.(html?)$/,
                    /\.(ts|tsx|js|jsx)$/,
                    /\.css$/,
                    /\.json$/,
                ],
                loader: "file-loader",
                query: {
                    name: "[hash].[ext]",
                    outputPath: "media/",
                    publicPath: "/"
                }
            },
        ]
    },
    output: {
        filename: "[name].js",
        publicPath: "/",
        path: path.join(__dirname, "build/app")
    },
    plugins: [
        // exclude locale files in moment
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        // copy files in public to build
        new CopyWebpackPlugin([{
                context: "public",
                from: {
                    dot: false,
                    glob: "**/*"
                },
                to: path.join(__dirname, "build/app/")
            }]),
    ],
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"]
    }
};
if (isProd()) {
    // Production build tweaks
    buildConfig.devtool = false;
    buildConfig.plugins = (buildConfig.plugins || []).concat([
        new webpack.DefinePlugin({
            "process.env": { NODE_ENV: JSON.stringify("production") }
        }),
    ]);
}
else {
    // Development build tweaks
    var buildConfigModule = buildConfig.module;
    buildConfigModule.rules = (buildConfigModule.rules || []).concat([
        // tslint
        {
            enforce: "pre",
            exclude: /node_modules/,
            loader: "tslint-loader",
            test: /\.tsx?$/
        },
    ]);
    buildConfig.plugins = (buildConfig.plugins || []).concat([
        new webpack.DefinePlugin({
            "process.env": { NODE_ENV: JSON.stringify("development") }
        }),
        // exclude source mapping for vendor libs
        new webpack.SourceMapDevToolPlugin({
            exclude: /^(vendor_).*\.js$/,
            filename: "[file].map"
        }),
    ]);
}
exports["default"] = buildConfig;
