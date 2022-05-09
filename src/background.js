'use strict'
import { app, protocol, BrowserWindow, Tray, Menu, ipcMain, screen, globalShortcut } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import Store from 'electron-store'

const path = require('path')
const isDevelopment = process.env.VUE_APP_NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])
// eslint-disable-next-line no-undef
const iconPath = path.join(__static, 'favicon.ico')
let tray = null
let win = null
let isEdit = false
let showNeed = false
const store = new Store()
ipcMain.on('isEdit', (event, isEditStatus) => {
  isEdit = isEditStatus
})
ipcMain.on('footerhover', () => {
  show()
})
// 保存主进程需要的配置
ipcMain.on('setSetting', (event, data) => {
  app.setLoginItemSettings({
    openAtLogin: data
  })
})
// 显示主体框
function show () {
  const position = global.win.getPosition()
  const size = global.win.getSize()
  const screenSize = screen.getPrimaryDisplay().workAreaSize
  global.win.show()
  if (position[1] <= 10 && position[1] !== 5) {
    global.win.setPosition(position[0], 5)
  } else if (position[0] <= 10 && position[0] !== 5) {
    global.win.setPosition(5, position[1])
  } else if (position[0] + 10 >= screenSize.width && position[0] + 5 !== screenSize.width) {
    global.win.setPosition(screenSize.width - size[0] - 5, position[1])
  }
}
ipcMain.on('pageleave', () => {
  showNeed = false
  // 如果鼠标指针还在我的框内，则不进行缩进
  if (!windowHideTop()) {
    if (!windowHideLeft()) {
      windowHideRight()
    }
  }
})

// 窗口背景颜色
ipcMain.on('setBackgroundColor', (event, color) => {
  global.win.setBackgroundColor(color)
})
// 将窗口向左隐藏
function windowHideLeft () {
  if (!isEdit && !showNeed) {
    const { x, y } = screen.getCursorScreenPoint()
    const position = global.win.getPosition()
    const size = global.win.getSize()
    if (position[0] < 10 && (x > size[0] - 10 || y < position[1] - 40 || y > position[1] + size[1] - 20)) {
      global.win.setPosition(10 - size[0], position[1])
      global.win.setHasShadow(false)
      showNeed = false
      storePostion(10 - size[0], position[1])
      return true
    }
  }
  return false
}
// 将窗口向右隐藏
function windowHideRight () {
  if (!isEdit && !showNeed) {
    const { x, y } = screen.getCursorScreenPoint()
    const position = global.win.getPosition()
    const size = global.win.getSize()
    const screenSize = screen.getPrimaryDisplay().workAreaSize
    if (position[0] + size[0] + 10 > screenSize.width && (x < position[0] + 10 || y < position[1] - 40 || y > position[1] + size[1] - 20)) {
      global.win.setPosition(screenSize.width - 10, position[1])
      global.win.setHasShadow(false)
      showNeed = false
      storePostion(screenSize.width - 10, position[1])
      return true
    }
  }
  return false
}
// 将窗口向上隐藏
function windowHideTop () {
  if (!isEdit && !showNeed) {
    const { x, y } = screen.getCursorScreenPoint()
    const position = global.win.getPosition()
    const size = global.win.getSize()
    if (position[1] < 10 && (x < position[0] || x > position[0] + size[0] || y > position[1])) {
      global.win.setPosition(position[0], 10 - size[1])
      global.win.setHasShadow(false)
      showNeed = false
      storePostion(position[0], 10 - size[1])
      return true
    }
  }
  return false
}
function storePostion (x, y) {
  store.set('lastPosition', {
    x: x, y: y
  })
}
function hide () {
  if (!windowHideTop()) {
    if (!windowHideLeft()) {
      if (!windowHideRight()) {
        global.win.hide()
      }
    }
  }
}
async function createWindow () {
  // Create the browser window.
  global.win = win = new BrowserWindow({
    title: 'SNOTE',
    width: 300,
    height: 600,
    minWidth: 300,
    minHeight: 600,
    alwaysOnTop: true, // 总在最前
    icon: iconPath,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })
  // 开发者工具
  // win.webContents.openDevTools()
  win.setMenu(null)
  // 任务栏图标
  win.setAppDetails({
    appIconPath: iconPath
  })
  // 是否显示在任务栏
  win.setSkipTaskbar(true)
  // 触发关闭时触发
  win.on('close', (event) => {
    // 截获 close 默认行为
    event.preventDefault()
    win.hide()
  })
  // 窗口移动
  win.on('moved', (e) => {
    const position = win.getPosition()
    storePostion(position[0], position[1])
    e.preventDefault()
    if (!windowHideTop()) {
      if (!windowHideLeft()) {
        windowHideRight()
      }
    }
  })
  // 创建窗口时获取上次的位置并赋值
  const position = store.get('lastPosition')
  if (position) {
    // win.setPosition(position.x, position.y)
  }
  // 新建托盘
  tray = new Tray(iconPath)
  // 托盘名称
  tray.setToolTip('SNOTE')
  // 托盘菜单
  const contextMenu = Menu.buildFromTemplate([{
    label: '退出',
    click: () => { win.destroy() }
  }])
  // 载入托盘菜单
  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    // 单击通知区图标实现应用的显示或隐藏
    win.isVisible() ? win.hide() : win.show()
  })
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}
const lock = app.requestSingleInstanceLock()
if (!lock) {
  app.quit()
} else {
  app.on('second-instance', (event, argv, cwd) => {
    /* ... */
    if (global.win) {
      if (global.win.isMinimized()) {
        global.win.restore()
      }
      global.win.focus()
      global.win.show()
    }
  })
  app.on('ready', async () => {
    app.setAppUserModelId('SNOTE')
    // 监听快捷键
    globalShortcut.register('Ctrl+0', () => {
      showNeed = !showNeed
      !showNeed ? hide() : show()
    })
    globalShortcut.register('Ctrl+num0', () => {
      showNeed = !showNeed
      !showNeed ? hide() : show()
    })
    createWindow()
  })
}
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
