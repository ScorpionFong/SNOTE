// 图标文件路径
const iconPath = process.env.VUE_APP_NODE_ENV !== 'production' ? 'favicon.ico' : 'public/favicon.ico'
module.exports = {
  css: {
    extract: false
  },
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      chainWebpackMainProcess: (config) => {
        config.output.filename('background.js')
      },
      builderOptions: {
        appId: 'com.snote.exe',
        productName: 'SNOTE',
        copyright: 'Copyright © 2022',
        win: {
          icon: iconPath
        },
        nsis: {
          // 是否一键安装，建议为 false，可以让用户点击下一步、下一步、下一步的形式安装程序，如果为true，当用户双击构建好的程序，自动安装程序并打开，即：一键安装（one-click installer）
          oneClick: false,
          // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
          allowElevation: true,
          // 允许修改安装目录，建议为 true，是否允许用户改变安装目录，默认是不允许
          allowToChangeInstallationDirectory: true,
          // 安装图标
          installerIcon: iconPath,
          // 卸载图标
          uninstallerIcon: iconPath,
          // 安装时头部图标
          installerHeaderIcon: iconPath,
          // 创建桌面图标
          createDesktopShortcut: true,
          // 创建开始菜单图标
          createStartMenuShortcut: false
        }
      }
    }
  }
}
