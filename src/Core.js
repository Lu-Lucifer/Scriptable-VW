// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: car;
// Variables used by Scriptable.
//

class Core {
  constructor(arg = '') {
    this.arg = arg
    this._actions = {}
    this.init()
  }

  /**
   * 初始化配置
   * @param {string} widgetFamily
   */
  init(widgetFamily = config.widgetFamily) {
    // 组件大小：small,medium,large
    this.widgetFamily = widgetFamily
    // 系统设置的key，这里分为三个类型：
    // 1. 全局
    // 2. 不同尺寸的小组件
    // 3. 不同尺寸+小组件自定义的参数
    // 当没有key2时，获取key1，没有key1获取全局key的设置
    // this.SETTING_KEY = this.md5(Script.name()+'@'+this.widgetFamily+'@'+this.arg)
    // this.SETTING_KEY1 = this.md5(Script.name()+'@'+this.widgetFamily)
    this.SETTING_KEY = this.md5(Script.name())
    // 插件设置
    this.settings = this.getSettings()
    // 设置存储设置到 key
    if (!Keychain.contains('SETTING_KEY')) Keychain.set('SETTING_KEY', this.SETTING_KEY)
  }

  /**
   * 注册点击操作菜单
   * @param {string} name 操作函数名
   * @param {Function} func 点击后执行的函数
   */
  registerAction(name, func) {
    this._actions[name] = func.bind(this)
  }

  /**
   * 生成操作回调URL，点击后执行本脚本，并触发相应操作
   * @param {string} name 操作的名称
   * @param {string} data 传递的数据
   */
  actionUrl(name = '', data = '') {
    let u = URLScheme.forRunningScript()
    let q = `act=${encodeURIComponent(name)}&data=${encodeURIComponent(data)}&__arg=${encodeURIComponent(this.arg)}&__size=${this.widgetFamily}`
    let result = ''
    if (u.includes('run?')) {
      result = `${u}&${q}`
    } else {
      result = `${u}?${q}`
    }
    return result
  }

  /**
   * 动态设置组件字体或者图片颜色
   * @param {WidgetText || WidgetImage || WidgetStack} widget
   * @param {'textColor' || 'tintColor' || 'borderColor' || 'backgroundColor'} type
   * @param {'Small' || 'Medium' || 'Large'} size
   * @param {number} alpha
   */
  setWidgetNodeColor(widget, type = 'textColor', size = 'Small', alpha = 1) {
    if (
      this.settings['backgroundPhoto' + size + 'Light'] ||
      this.settings['backgroundPhoto' + size + 'Dark']
    ) {
      const lightTextColor = this.settings['backgroundImageLightTextColor'] || '#000000'
      const darkTextColor = this.settings['backgroundImageDarkTextColor'] || '#ffffff'
      widget[type] = Color.dynamic(new Color(lightTextColor, alpha), new Color(darkTextColor, alpha))
    } else {
      const lightTextColor = this.settings['lightTextColor'] ? this.settings['lightTextColor'] : '#000000'
      const darkTextColor = this.settings['darkTextColor'] ? this.settings['darkTextColor'] : '#ffffff'
      widget[type] = Color.dynamic(new Color(lightTextColor, alpha), new Color(darkTextColor, alpha))
    }
  }

  /**
   * 设置字体
   * @param {WidgetText} widget
   * @param size
   * @param { 'regular' || 'bold' } type
   */
  setFontFamilyStyle(widget, size, type = 'regular') {
    const regularFont = this.settings['regularFont'] || 'PingFangSC-Regular '
    const boldFont = this.settings['boldFont'] || 'PingFangSC-Semibold'

    widget.font = new Font(type === 'regular' ? regularFont : boldFont, size)
  }

  /**
   * 获取当前插件的设置
   * @param {boolean} json 是否为json格式
   * @param key
   */
  getSettings(json = true, key = this.SETTING_KEY) {
    let result = json ? {} : ''
    let cache = ''
    if (Keychain.contains(key)) {
      cache = Keychain.get(key)
    }
    if (json) {
      try {
        result = JSON.parse(cache)
      } catch (error) {
        // throw new Error('JSON 数据解析失败' + error)
      }
    } else {
      result = cache
    }

    return result
  }

  /**
   * md5 加密
   * @param string
   * @returns {string}
   */
  md5(string) {
    const safeAdd = (x, y) => {
      let lsw = (x & 0xFFFF) + (y & 0xFFFF)
      return (((x >> 16) + (y >> 16) + (lsw >> 16)) << 16) | (lsw & 0xFFFF)
    }
    const bitRotateLeft = (num, cnt) => (num << cnt) | (num >>> (32 - cnt))
    const md5cmn = (q, a, b, x, s, t) => safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b),
      md5ff = (a, b, c, d, x, s, t) => md5cmn((b & c) | ((~b) & d), a, b, x, s, t),
      md5gg = (a, b, c, d, x, s, t) => md5cmn((b & d) | (c & (~d)), a, b, x, s, t),
      md5hh = (a, b, c, d, x, s, t) => md5cmn(b ^ c ^ d, a, b, x, s, t),
      md5ii = (a, b, c, d, x, s, t) => md5cmn(c ^ (b | (~d)), a, b, x, s, t)
    const firstChunk = (chunks, x, i) => {
        let [a, b, c, d] = chunks
        a = md5ff(a, b, c, d, x[i + 0], 7, -680876936)
        d = md5ff(d, a, b, c, x[i + 1], 12, -389564586)
        c = md5ff(c, d, a, b, x[i + 2], 17, 606105819)
        b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330)

        a = md5ff(a, b, c, d, x[i + 4], 7, -176418897)
        d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426)
        c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341)
        b = md5ff(b, c, d, a, x[i + 7], 22, -45705983)

        a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416)
        d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417)
        c = md5ff(c, d, a, b, x[i + 10], 17, -42063)
        b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162)

        a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682)
        d = md5ff(d, a, b, c, x[i + 13], 12, -40341101)
        c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290)
        b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329)

        return [a, b, c, d]
      },
      secondChunk = (chunks, x, i) => {
        let [a, b, c, d] = chunks
        a = md5gg(a, b, c, d, x[i + 1], 5, -165796510)
        d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632)
        c = md5gg(c, d, a, b, x[i + 11], 14, 643717713)
        b = md5gg(b, c, d, a, x[i], 20, -373897302)

        a = md5gg(a, b, c, d, x[i + 5], 5, -701558691)
        d = md5gg(d, a, b, c, x[i + 10], 9, 38016083)
        c = md5gg(c, d, a, b, x[i + 15], 14, -660478335)
        b = md5gg(b, c, d, a, x[i + 4], 20, -405537848)

        a = md5gg(a, b, c, d, x[i + 9], 5, 568446438)
        d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690)
        c = md5gg(c, d, a, b, x[i + 3], 14, -187363961)
        b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501)

        a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467)
        d = md5gg(d, a, b, c, x[i + 2], 9, -51403784)
        c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473)
        b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734)

        return [a, b, c, d]
      },
      thirdChunk = (chunks, x, i) => {
        let [a, b, c, d] = chunks
        a = md5hh(a, b, c, d, x[i + 5], 4, -378558)
        d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463)
        c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562)
        b = md5hh(b, c, d, a, x[i + 14], 23, -35309556)

        a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060)
        d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353)
        c = md5hh(c, d, a, b, x[i + 7], 16, -155497632)
        b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640)

        a = md5hh(a, b, c, d, x[i + 13], 4, 681279174)
        d = md5hh(d, a, b, c, x[i], 11, -358537222)
        c = md5hh(c, d, a, b, x[i + 3], 16, -722521979)
        b = md5hh(b, c, d, a, x[i + 6], 23, 76029189)

        a = md5hh(a, b, c, d, x[i + 9], 4, -640364487)
        d = md5hh(d, a, b, c, x[i + 12], 11, -421815835)
        c = md5hh(c, d, a, b, x[i + 15], 16, 530742520)
        b = md5hh(b, c, d, a, x[i + 2], 23, -995338651)

        return [a, b, c, d]
      },
      fourthChunk = (chunks, x, i) => {
        let [a, b, c, d] = chunks
        a = md5ii(a, b, c, d, x[i], 6, -198630844)
        d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415)
        c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905)
        b = md5ii(b, c, d, a, x[i + 5], 21, -57434055)

        a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571)
        d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606)
        c = md5ii(c, d, a, b, x[i + 10], 15, -1051523)
        b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799)

        a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359)
        d = md5ii(d, a, b, c, x[i + 15], 10, -30611744)
        c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380)
        b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649)

        a = md5ii(a, b, c, d, x[i + 4], 6, -145523070)
        d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379)
        c = md5ii(c, d, a, b, x[i + 2], 15, 718787259)
        b = md5ii(b, c, d, a, x[i + 9], 21, -343485551)
        return [a, b, c, d]
      }
    const binlMD5 = (x, len) => {
      /* append padding */
      x[len >> 5] |= 0x80 << (len % 32)
      x[(((len + 64) >>> 9) << 4) + 14] = len
      let commands = [firstChunk, secondChunk, thirdChunk, fourthChunk],
        initialChunks = [
          1732584193,
          -271733879,
          -1732584194,
          271733878
        ]
      return Array.from({length: Math.floor(x.length / 16) + 1}, (v, i) => i * 16)
        .reduce((chunks, i) => commands
          .reduce((newChunks, apply) => apply(newChunks, x, i), chunks.slice())
          .map((chunk, index) => safeAdd(chunk, chunks[index])), initialChunks)

    }
    const binl2rstr = input => Array(input.length * 4).fill(8).reduce((output, k, i) => output + String.fromCharCode((input[(i * k) >> 5] >>> ((i * k) % 32)) & 0xFF), '')
    const rstr2binl = input => Array.from(input).map(i => i.charCodeAt(0)).reduce((output, cc, i) => {
      let resp = output.slice()
      resp[(i * 8) >> 5] |= (cc & 0xFF) << ((i * 8) % 32)
      return resp
    }, [])
    const rstrMD5 = string => binl2rstr(binlMD5(rstr2binl(string), string.length * 8))
    const rstr2hex = input => {
      const hexTab = (pos) => '0123456789abcdef'.charAt(pos)
      return Array.from(input).map(c => c.charCodeAt(0)).reduce((output, x) => output + hexTab((x >>> 4) & 0x0F) + hexTab(x & 0x0F), '')
    }
    const str2rstrUTF8 = unicodeString => {
      if (typeof unicodeString !== 'string') throw new TypeError('parameter ‘unicodeString’ is not a string')
      const cc = c => c.charCodeAt(0)
      return unicodeString
        .replace(/[\u0080-\u07ff]/g,  // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz
          c => String.fromCharCode(0xc0 | cc(c) >> 6, 0x80 | cc(c) & 0x3f))
        .replace(/[\u0800-\uffff]/g,  // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz
          c => String.fromCharCode(0xe0 | cc(c) >> 12, 0x80 | cc(c) >> 6 & 0x3F, 0x80 | cc(c) & 0x3f))
    }
    const rawMD5 = s => rstrMD5(str2rstrUTF8(s))
    const hexMD5 = s => rstr2hex(rawMD5(s))
    return hexMD5(string)
  }

  /**
   * 新增 Stack 布局
   * @param {WidgetStack | ListWidget} stack 节点信息
   * @param {'horizontal' | 'vertical'} layout 布局类型
   * @returns {WidgetStack}
   */
  addStackTo(stack, layout) {
    const newStack = stack.addStack()
    layout === 'horizontal' ? newStack.layoutHorizontally() : newStack.layoutVertically()
    return newStack
  }

  /**
   * 根据百分比输出 hex 颜色
   * @param {number} pct
   * @returns {Color}
   */
  getColorForPercentage(pct) {
    const percentColors = [
      { pct: 0.0, color: { r: 0xff, g: 0x00, b: 0 } },
      { pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
      { pct: 1.0, color: { r: 0x00, g: 0xff, b: 0 } }
    ]

    let i = 1
    for (i; i < percentColors.length - 1; i++) {
      if (pct < percentColors[i].pct) {
        break
      }
    }
    const lower = percentColors[i - 1]
    const upper = percentColors[i]
    const range = upper.pct - lower.pct
    const rangePct = (pct - lower.pct) / range
    const pctLower = 1 - rangePct
    const pctUpper = rangePct
    const color = {
      r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
      g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
      b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    }
    // return 'rgb(' + [color.r, color.g, color.b].join(',') + ')'
    return new Color('#' + ((1 << 24) + (color.r << 16) + (color.g << 8) + color.b).toString(16).slice(1), 1)
  }

  /**
   * 一维数组转换多维数组
   * @param arr
   * @param num
   * @returns {*[]}
   */
  format2Array(arr, num) {
    const  pages = []
    arr.forEach((item, index) => {
      const page = Math.floor(index / num)
      if (!pages[page]) {
        pages[page] = []
      }
      pages[page].push(item)
    })
    return pages
  }

  /**
   * 时间格式化
   * @param date
   * @param format
   * @return {string}
   */
  formatDate(date = new Date(), format = 'MM-dd HH:mm') {
    const formatter = new DateFormatter()
    formatter.dateFormat = format
    const updateDate = new Date(date)
    return formatter.string(updateDate)
  }

  /**
   * HTTP 请求接口
   * @param {Object} options request 选项配置
   * @returns {Promise<JSON | String>}
   */
  async http(options) {
    const url = options?.url || url
    const method = options?.method || 'GET'
    const headers = options?.headers || {}
    const body = options?.body || ''
    const json = options?.json || true

    let response = new Request(url)
    response.method = method
    response.headers = headers
    if (method === 'POST' || method === 'post') response.body = body
    return (json ? response.loadJSON() : response.loadString())
  }

  /**
   * 获取远程图片内容
   * @param {string} url 图片地址
   * @param {boolean} useCache 是否使用缓存（请求失败时获取本地缓存）
   */
  async getImageByUrl(url, useCache = true) {
    const cacheKey = this.md5(url)
    const cacheFile = FileManager.local().joinPath(FileManager.local().temporaryDirectory(), cacheKey)
    // 判断是否有缓存
    if (useCache && FileManager.local().fileExists(cacheFile)) {
      return Image.fromFile(cacheFile)
    }
    try {
      const req = new Request(url)
      const img = await req.loadImage()
      // 存储到缓存
      FileManager.local().writeImage(cacheFile, img)
      return img
    } catch (e) {
      // 没有缓存+失败情况下，返回自定义的绘制图片（红色背景）
      let ctx = new DrawContext()
      ctx.size = new Size(100, 100)
      ctx.setFillColor(Color.red())
      ctx.fillRect(new Rect(0, 0, 100, 100))
      return ctx.getImage()
    }
  }

  /**
   * 弹出一个通知
   * @param {string} title 通知标题
   * @param {string} body 通知内容
   * @param {string} url 点击后打开的URL
   * @param {Object} opts
   * @returns {Promise<void>}
   */
  async notify(title, body = '', url = undefined, opts = {}) {
    let n = new Notification()
    n = Object.assign(n, opts)
    n.title = title
    n.body = body
    if (url) n.openURL = url
    return await n.schedule()
  }

  /**
   * 存储当前设置
   * @param {boolean} notify 是否通知提示
   */
  async saveSettings(notify = true) {
    const result = (typeof this.settings === 'object') ? JSON.stringify(this.settings) : String(this.settings)
    Keychain.set(this.SETTING_KEY, result)
    if (notify) await this.notify('设置成功', '桌面组件稍后将自动刷新')
  }

  /**
   * 获取用户车辆照片
   * @returns {Promise<Image|*>}
   */
  async getMyCarPhoto(photo) {
    let myCarPhoto = await this.getImageByUrl(photo)
    if (this.settings['myCarPhoto']) myCarPhoto = await FileManager.local().readImage(this.settings['myCarPhoto'])
    return myCarPhoto
  }

  /**
   * 关于组件
   */
  async actionAbout() {
    Safari.open( 'https://joiner.i95.me/about.html')
  }
}

export default Core