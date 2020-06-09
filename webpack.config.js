// const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
module.exports ={
    target:'web',
    watch:false,
    mode:'production',
    entry:'./src/index.tsx',
    output:{
        filename:(chunkData)=>{
            return 'index.js'
        },
        path:path.resolve(__dirname,'./dist')
    },
    resolve:{
        extensions:['.ts','.tsx','.js','.jsx']
    },
    module:{
        rules:[
            {
                test:/\.ts|\.tsx?$/,
                exclude:/node_modules/,
                use:[
                    {
                        loader:'babel-loader'
                    },
                    {
                       loader:'ts-loader' 
                    }
                ]
            },
            { test: /\.css$/, use: [ { loader: 'stylesheet-loader' }] },
            // {
            //     test: /\.js|\.jsx$/, exclude: /(node_modules|bower_components)/, use: [
            //       {
            //         loader: 'babel-loader'}
            //     ]
            //   },
            {
                test:/\.less$/,
                use:[
                    {
                        loader:'stylesheet-loader'
                    },
                    // {
                    //     loader:'css-loader'
                    // },
                    {
                        loader:'less-loader'
                    }
                ]
            }
        ]
    },
    // plugins:[
    //     new CopyWebpackPlugin([
    //         {
    //             from:path.resolve(__dirname,'./index.html'),
    //             to:path.resolve(__dirname,'./dist'),
    //         }
    //     ])
    // ]
}