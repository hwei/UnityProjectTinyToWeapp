const fs = wx.getFileSystemManager()
GameGlobal.Module = {
    mem: fs.readFileSync('/tiny/Tiny3D.mem.scene')
}
GameGlobal.canvas.id = 'UT_CANVAS'
