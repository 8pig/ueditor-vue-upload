const webpack = require('webpack');
const path = require('path');
const resolve = dir => path.join(__dirname, dir);
// 环境判断
const IS_PROD = ['production', 'prod', 'test'].includes(process.env.NODE_ENV);
const IS_DEV = ['development'].includes(process.env.NODE_ENV);

const StylelintPlugin = require('stylelint-webpack-plugin');
// gzip
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;

const moment = require('moment');
process.env.VUE_APP_TIME = moment().format('YYYY.MM.DD hh:mm:ss');

module.exports = {
  publicPath: '/', // 默认'/'，部署应用包时的基本 URL
  outputDir: `dist/${process.env.VUE_APP_OUTPUT_NAME}_${moment().format(
    'MM-DD-hh-mm'
  )}`,
  assetsDir: 'assets', // 相对于outputDir的静态资源(js、css、img、fonts)目录
  lintOnSave: true,
  runtimeCompiler: true, // 是否使用包含运行时编译器的 Vue 构建版本
  productionSourceMap: !IS_PROD, // 生产环境的 source map
  parallel: require('os').cpus().length > 1,
  pwa: {},
  devServer: {
    proxy: {
      '/api': {
        target: '',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'
        }
      }
    },
    disableHostCheck: true, // webpack4.0 开启热更新
    open: false // 是否打开浏览器
  },
  css: {
    extract: IS_PROD,
    sourceMap: false,
    loaderOptions: {
      scss: {
        // 向全局sass样式传入共享的全局变量, $src可以配置图片cdn前缀
        // 详情: https://cli.vuejs.org/guide/css.html#passing-options-to-pre-processor-loaders
        prependData: `
        @import "@scss/flex.scss";
        $src: "${process.env.VUE_APP_OSS_SRC}";
        `

      },
      css: {

      }
    }
  },
  configureWebpack: config => {
    const plugins = [];
    if (IS_PROD) {
      plugins.push(
        new CompressionWebpackPlugin({
          filename: '[path].gz[query]',
          algorithm: 'gzip',
          test: productionGzipExtensions,
          threshold: 10240,
          minRatio: 0.8
        })
      );
      config.optimization = {
        splitChunks: {
          cacheGroups: {
            common: {
              name: 'chunk-common',
              chunks: 'initial',
              minChunks: 2,
              maxInitialRequests: 5,
              minSize: 0,
              priority: 1,
              reuseExistingChunk: true,
              enforce: true
            },
            vendors: {
              name: 'chunk-vendors',
              test: /[\\/]node_modules[\\/]/,
              chunks: 'initial',
              priority: 2,
              reuseExistingChunk: true,
              enforce: true
            },
            elementUI: {
              name: 'chunk-elementui',
              test: /[\\/]node_modules[\\/]element-ui[\\/]/,
              chunks: 'all',
              priority: 3,
              reuseExistingChunk: true,
              enforce: true
            },
            echarts: {
              name: 'chunk-echarts',
              test: /[\\/]node_modules[\\/](vue-)?echarts[\\/]/,
              chunks: 'all',
              priority: 4,
              reuseExistingChunk: true,
              enforce: true
            }
          }
        }
      };
    }
    if (IS_DEV) {
      plugins.push(
        new StylelintPlugin({
          files: ['src/**/*.vue', 'src/assets/**/*.scss'],
          fix: true // 打开自动修复（谨慎使用！注意上面的配置不要加入js或html文件，会发生问题，js文件请手动修复）
        })
      );
    }
    config.plugins = [...config.plugins, ...plugins];
  },
  chainWebpack: config => {
    const imagesRule = config.module.rule('images');
    imagesRule
      .use('url-loader')
      .loader('url-loader')
      .tap(options => Object.assign(options, { limit: 6144 }));
    config => {
      // 修复HMR
      config.resolve.symlinks(true);
    };
    config
      .plugin('ignore')
      .use(
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn$/)
      );

    // 添加别名
    config.resolve.alias
      .set('vue$', 'vue/dist/vue.esm.js')
      .set('@', resolve('src'))
      .set('@scss', resolve('src/assets/scss'))
      .set('@components', resolve('src/components'))
      .set('@plugins', resolve('src/plugins'))
      .set('@router', resolve('src/router'))
      .set('@store', resolve('src/store'))
      .set('@utils', resolve('src/utils'))
      .set('@views', resolve('src/views'))
      .set('@apis', resolve('src/apis'))
      .set('@assets', resolve('src/assets'));
    // 如果使用多页面打包，使用vue inspect --plugins查看html是否在结果数组中
    config.plugin('html').tap(args => {
      // html中添加cdn
      // args[0].cdn = cdn;
      console.log(args);
      args[0].title = '你想设置的title名字';
      return args;
    });
    config.plugin('html').tap(args => {
      if (process.env.NODE_ENV === 'production') {
        args[0].minify.removeComments = false;
      }
      return args;
    });
    if (IS_PROD) {
      config.optimization.delete('splitChunks');
    }
    return config;
  }
};
