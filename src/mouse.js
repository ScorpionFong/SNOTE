import { ipcRenderer } from 'electron'
// const body = document.body
document.addEventListener('mouseleave', () => {
  ipcRenderer.send('pageleave')
})
document.addEventListener('mouseover', () => {
  ipcRenderer.send('footerhover')
})
