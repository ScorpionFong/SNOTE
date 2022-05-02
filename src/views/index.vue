<template>
  <div :class="setting.theme">
    <div id="page">
      <div id="plus_div">
        <el-button
          id="plus_button"
          plain
          @click="task_add"
        >
          新  增
        </el-button>
      </div>
      <div v-if="!lists.length">
        <el-divider> 暂无数据 </el-divider>
      </div>
      <div
        v-if="lists.length > 0"
        id="note_div"
      >
        <div
          v-for="(item,index) in lists"
          :key="index"
          class="note_one"
        >
          <div class="note_date">
            {{ item.date }}
          </div>
          <template
            v-for="(item1,index1) in item.children"
          >
            <div
              v-if="task_type === 2 || (task_type === 1 && (task_over_show === 1 || (task_over_show === 0 && item1.is_over === 0)))"
              :key="index1"
              class="note_text"
            >
              <el-checkbox
                v-if="task_type == 1"
                :value="item1.is_over == 1"
                @change="task_over(item.id, item1.id, index, index1)"
              />
              <div class="note_text_row">
                <div
                  class="note_text_text"
                  @click="task_edit(item.id, item1.id, index, index1)"
                >
                  <div
                    v-if="!item1.is_edit"
                    class="note_text_text_show"
                    @contextmenu.prevent="rightClick(item.id, item1.id, index, index1)"
                  >
                    {{ item1.text }}
                  </div>
                  <div
                    v-if="item1.is_edit"
                    class="note_text_text_edit"
                  >
                    <el-input
                      v-model="item1.text"
                      v-focus
                      type="textarea"
                      :autosize="{ minRows: 2, maxRows: 20}"
                      maxlength="500"
                      show-word-limit
                      placeholder="请输入内容"
                      @blur="task_save(item.id, item1.id, index, index1)"
                    />
                  </div>
                </div>
                <div class="note_text_time">
                  {{ item1.time }}
                </div>
              </div>
            </div>
          </template>
          <el-divider />
        </div>
      </div>
    </div>
    <div id="footer">
      <el-dropdown
        trigger="click"
        @command="handleCommand"
      >
        <div class="footer_setting">
          <i class="el-icon-s-tools" />
        </div>
        <el-dropdown-menu
          slot="dropdown"
          :class="setting.theme"
        >
          <el-dropdown-item
            :icon="setting.loginAuto ? 'el-icon-check' : 'el-icon-close'"
            command="z"
          >
            开机自启：{{ setting.loginAuto ? '开' : '关' }}
          </el-dropdown-item>
          <el-dropdown-item
            divided
            icon="el-icon-moon"
            command="a"
          >
            暗黑模式
          </el-dropdown-item>
          <el-dropdown-item
            icon="el-icon-sunny"
            command="b"
          >
            明亮模式
          </el-dropdown-item>
          <el-dropdown-item
            divided
            icon="el-icon-notebook-2"
            command="c"
            @click="taskTypeChange(1)"
          >
            任务模式
          </el-dropdown-item>
          <el-dropdown-item
            icon="el-icon-notebook-2"
            command="d"
            @click="taskTypeChange(2)"
          >
            任务模式（隐藏已完成）
          </el-dropdown-item>
          <el-dropdown-item
            icon="el-icon-notebook-2"
            command="e"
            @click="taskTypeChange(3)"
          >
            普通模式
          </el-dropdown-item>
          <el-dropdown-item
            divided
            icon="el-icon-delete"
            command="f"
          >
            清空已完成（仅任务模式）
          </el-dropdown-item>
          <el-dropdown-item
            icon="el-icon-delete"
            command="g"
          >
            清除全部
          </el-dropdown-item>
          <el-dropdown-item
            icon="el-icon-delete"
            command="h"
          >
            清除10天前
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <div
        class="back_top"
        @click="backToTop"
      >
        <i class="el-icon-caret-top" />
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import { ipcRenderer } from 'electron'

export default {
  name: 'IndexView',
  directives: {
    focus: {
      inserted (el) {
        el.children[0].focus()
      }
    }
  },
  data () {
    return {
      lists: [], // 展示的列表
      listsLocal: [], // 本地数据
      total: 0,
      page: 1,
      task_type: 1, // 1任务模式 2普通模式
      task_over_show: 1, // 已完成的任务是否显示 0不显示 1显示
      time_now: 0,
      listsMaxId: 0,
      childrenMaxId: 0,
      is_dark: 1,
      setting: {
        theme: 'light'
      }
    }
  },
  mounted () {
    this.getList()
    setTimeout(() => {
      this.getSetting()
    }, 500)
  },
  methods: {
    getSetting () {
      this.setting = this.$ls.get('setting')
      if (!this.setting) {
        this.setting = {
          theme: 'light',
          taskType: 1,
          taskOverShow: 1,
          loginAuto: false
        }
      } else {
        if (this.setting.theme === 'dark') {
          this.handleCommand('a')
        } else {
          this.handleCommand('b')
        }
        if (this.setting.taskType === 2) {
          this.handleCommand('e')
        } else {
          if (this.setting.taskOverShow === 1) {
            this.handleCommand('c')
          } else {
            this.handleCommand('d')
          }
        }
      }
    },
    setSetting () {
      this.$ls.set('setting', this.setting)
    },
    handleCommand (command) {
      switch (command) {
        case 'a':
          // 暗黑模式
          this.setBackgroundColor('#2e2c29')
          this.setting.theme = 'dark'
          break
        case 'b':
          // 明亮模式
          this.setBackgroundColor('#ffffff')
          this.setting.theme = 'light'
          break
        case 'c':
          // 任务模式
          this.task_type = 1
          this.task_over_show = 1
          this.setting.taskType = 1
          this.setting.taskOverShow = 1
          this.getList()
          break
        case 'd':
          // 任务模式隐藏
          this.task_type = 1
          this.task_over_show = 0
          this.setting.taskType = 1
          this.setting.taskOverShow = 0
          this.getList()
          break
        case 'e':
          // 普通模式
          this.task_type = 2
          this.setting.taskType = 2
          this.getList()
          break
        case 'f':
          // 任务模式清除已完成
          this.taskClear(1)
          break
        case 'g':
          // 清除全部
          this.taskClear(2)
          break
        case 'h':
          // 清除10天前
          this.taskClear(3)
          break
        case 'z':
          // 开机自启
          this.setting.loginAuto = !this.setting.loginAuto
          ipcRenderer.send('setSetting', this.setting.loginAuto)
          break
      }
      this.setSetting()
    },
    setBackgroundColor (color) {
      ipcRenderer.send('setBackgroundColor', color)
    },
    taskClear (type) {
      if (!this.listsLocal) {
        return
      }
      if (type === 1) {
        // 清除已完成
        this.listsLocal.forEach((item, index) => {
          this.listsLocal[index].children = this.listsLocal[index].children.filter(t => t.is_over === 0)
        })
        this.listsLocal = this.listsLocal.filter(t => t.children.length > 0)
      } else if (type === 2) {
        // 清除全部
        this.listsLocal = []
      } else if (type === 3) {
        // 清除10天前
        this.listsLocal = this.listsLocal.filter(t => moment(t.date) > moment().subtract(10, 'day'))
      }
      this.refresh()
      this.getList()
    },
    backToTop () {
      document.documentElement.scrollTop = 0
    },
    refresh () {
      this.$ls.set('lists', this.listsLocal)
    },
    rightClick (id, itemId, index, index1) {
      this.$confirm('是否确认删除?', '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'del_div del_div_' + this.setting.theme
      }).then(() => {
        this.listsLocal.forEach((item, i) => {
          this.listsLocal[i].children = this.listsLocal[i].children.filter(t => t.id !== itemId)
        })
        this.listsLocal = this.listsLocal.filter(t => t.children.length > 0)
        this.refresh()
        this.getList()
        this.$notify({
          message: '任务删除成功',
          type: 'success',
          showClose: false,
          duration: 2000,
          customClass: 'notify_' + this.setting.theme
        })
      }).catch(() => {
      })
    },
    task_save (id, itemId, index, index1) {
      this.lists[index].children[index1].is_edit = false
      this.listsLocal.forEach((item, i) => {
        if (item.id === id) {
          item.children.forEach((item1, i1) => {
            if (item1.id === itemId) {
              this.listsLocal[i].children[i1].text = this.lists[index].children[index1].text
            }
          })
        }
      })
      ipcRenderer.send('isEdit', false)
      ipcRenderer.send('pageleave')
      this.refresh()
      this.getList()
    },
    task_add () {
      // 新增一条
      const date = moment(moment.now()).format('YYYY-MM-DD')
      let has = false
      this.listsLocal.forEach((item, index) => {
        if (item.date === date) {
          has = true
        }
      })
      if (!has) {
        this.listsMaxId++
        this.listsLocal.unshift({
          id: this.listsMaxId,
          date: date,
          children: []
        })
      }
      this.childrenMaxId++
      this.listsLocal[0].children.unshift({
        id: this.childrenMaxId,
        text: '',
        is_over: 0,
        is_edit: false,
        time: moment(moment.now()).format('HH:mm')
      })
      this.refresh()
      this.getList()
      this.task_edit(this.listsMaxId, this.childrenMaxId, 0, 0)
    },
    task_edit (id, itemId, index, index1) {
      this.lists[index].children[index1].is_edit = true
      ipcRenderer.send('isEdit', true)
    },
    task_over (id, itemId, index, index1) {
      let isOver = 1
      this.listsLocal.forEach((item, i) => {
        if (item.id === id) {
          item.children.forEach((item1, i1) => {
            if (item1.id === itemId) {
              isOver = this.listsLocal[i].children[i1].is_over
              this.listsLocal[i].children[i1].is_over = this.listsLocal[i].children[i1].is_over === 1 ? 0 : 1
            }
          })
        }
      })
      if (!isOver) {
        this.$notify({
          message: '任务完成',
          type: 'success',
          showClose: false,
          duration: 2000,
          customClass: 'notify_' + this.setting.theme
        })
      }
      this.refresh()
      this.getList()
    },
    getList () {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.3)'
      })
      this.listsLocal = this.$ls.get('lists', [])
      if (!this.listsLocal) {
        return
      }
      const tempLists = []
      // 已完成的任务是否显示 0不显示 1显示
      this.listsLocal.forEach((item) => {
        this.listsMaxId = item.id > this.listsMaxId ? item.id : this.listsMaxId
        const tempOne = {
          id: item.id,
          date: item.date,
          children: []
        }
        item.children.forEach((item1) => {
          this.childrenMaxId = item1.id > this.childrenMaxId ? item1.id : this.childrenMaxId
          item1.is_edit = false
          if (this.task_type === 2 || (this.task_type === 1 && ((this.task_over_show === 0 && item1.is_over === 0) || this.task_over_show === 1))) {
            tempOne.children.push(item1)
          }
        })
        if (tempOne.children.length > 0) {
          tempLists.push(tempOne)
        }
      })
      this.lists = tempLists
      loading.close()
    }
  }
}
</script>
<style scoped>
#page {
  padding: 10px;
  margin-bottom: 50px;
}
#plus_div {
  text-align: center;
}
#plus_div #plus_button {
  width: 100%;
}
#note_div {
  margin: 20px auto;
}
.note_one {
  margin-top: 20px;
}
.note_date {
  font-size: 15px;
}
.note_text {
  margin: 15px 0;
  display: flex;
  padding: 15px 5px;
  border-radius: 5px;
}
.note_text .note_text_row {
  margin-left: 10px;
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.note_text_row .note_text_text {
  margin-right: 10px;
  width: 100%;
}
.note_text_text_show{
  font-size: 13px;
}
.note_text_row .note_text_time {
  width: 28px;
  font-size: 10px;
  color: gray;
}
#footer {
  position: fixed;
  z-index: 999;
  width: 97%;
  height: 45px;
  bottom: 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.footer_setting {
  width: 50px;
  height: 30px;
  text-align: center;
  font-size: 20px;
  cursor: pointer;
}
.back_top {
  margin-right: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  text-align: center;
  font-size: 20px;
  box-shadow: 0 0 6px rgb(0 0 0 / 12%);
  cursor: pointer;
}
</style>
