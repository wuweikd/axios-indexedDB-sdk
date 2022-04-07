import {get, keys, delMany, setMany, createStore} from 'idb-keyval'
import debounce from 'debounce'
const time7D = 86400000 * 7 // 7天

class IDB {
  private readonly preAppKey: string
  private static readonly IS_SUP_IDB = typeof window.indexedDB === 'object'
  private static readonly ERROR_TXT = '【idb】not support idb' // 文案
  private static readonly DEBOUNCE_TIME = 3000 // 接口停止3秒后，开始执行删除数据库的操作
  private readonly OUT_TIME: number
  private customStore
  constructor(appKey: string, outTime: number, storeName: string) {
    this.preAppKey = appKey + '_'
    this.OUT_TIME = outTime || time7D
    if (!IDB.IS_SUP_IDB) {
      console.error('[idb]不支持')
    }
    this.customStore = createStore(storeName || 'keyval-store', 'keyval')
  }

  /* 删除过期的数据 */
  private delWhenOutTime = debounce(() => {
    const isOutTime = (setTime: number) => Date.now() > this.OUT_TIME + setTime
    keys(this.customStore)
      .then(list => {
        list.map(key => {
          if (typeof key === 'string' && key.endsWith('outTime')) {
            get(key, this.customStore).then(res => {
              if (isOutTime(res)) {
                delMany([key, key.replace('_outTime', '')], this.customStore).catch(() => {})
              } else {
              }
            })
          }
        })
      })
      .catch(e => {
        console.error('[idb]keys', e)
      })
  }, IDB.DEBOUNCE_TIME)

  /* set */
  public async setIDB(dataKey: string, data: any) {
    if (!IDB.IS_SUP_IDB) return Promise.reject(IDB.ERROR_TXT)
    // 删除过期的数据
    this.delWhenOutTime()
    // 同时设置过期时间和数据
    return setMany([
      [`${this.preAppKey}${dataKey}_outTime`, Date.now() + this.OUT_TIME],
      [`${this.preAppKey}${dataKey}`, data],
    ], this.customStore)
  }

  /* get */
  public async getIDB(dataKey: string) {
    if (!IDB.IS_SUP_IDB) return Promise.reject(IDB.ERROR_TXT)
    return get(`${this.preAppKey}${dataKey}`, this.customStore)
  }
}

export default IDB
