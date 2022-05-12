# 欢迎使用SNOTE

**SNOTE**是使用vue2.6+electron18.1.0所制作的一款快捷便签、任务记录软件，目前只支持windows平台。该程序目前为学习练手程序，希望可以帮助到其他人，也希望大家可以不吝指点。

## 安装方式

该项目使用的是vue+electron，所以在使用前需要安装相关插件：
```
npm install --save-dev
```

## 运行方式
1. 运行
```
npm run electron:serve
```
2. 打包
```
npm run electron:build
```
3. 制作ico
	(1). 运行前需要先将一张png图片放入项目中并更改package.json中electron:generate-icons指令中的文件地址
	(2). 运行后ico文件将会保存到/build/icons文件目录下，也可在electron:generate-icons的--output中进行更改
```
npm run electron:generate-icons
```
5. 更改配置
	(1). 运行及打包的相关配置均在vue.config.js中

## 使用方式
1. 打包文件：
	(1). 打包后的绿色版在根目录/dist_electron/win-unpacked下，打包输出的位置可在vue.config.js中进行修改
	(2). 打包后的安装文件在/dist_electron下，可直接进行双击安装，一键安装等配置在vue.config.js中
2. 使用方式：
	(1). 点击新建按钮进行创建任务
	(2). 点击列表中的条目进行编辑
	(3). 右键点击列表中的条目可删除该条
	(4). 点击设置可切换任务、便签模式及暗黑、明亮模式等
3. 特色功能：
	(1). ctrl+0 可快捷显示及隐藏窗口	
	(2). 将窗口靠近屏幕上、左、右侧可将窗口隐藏（类似QQ的隐藏功能）

### 其他
1. 该项目将持续更新，也欢迎大家给予意见和建议，先行感谢