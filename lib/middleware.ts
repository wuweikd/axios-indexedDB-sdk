import IDB from './core'

class Middleware extends IDB{
  constructor(appKey, outTime, storeName) {
    super(appKey, outTime, storeName);
  }

  // 获取存储的信息
  async getFetchMd5DB({reqMd5, funName}: {
    reqMd5: string
    funName: string
  }) {
    return this
      .getIDB(`${funName}_${reqMd5}`)
      .then(res => res)
      .catch(e => {
        console.error('[idb]getFetchMd5DB', e)
        return false
      })
  }

// 存储档位的结果
  async setFetchMd5DB({reqMd5, funName, resultData}: { reqMd5: string; resultData: any; funName: string }) {
    return this
      .setIDB(`${funName}_${reqMd5}`, resultData)
      .then(res => res)
      .catch(e => {
        console.error('[idb]setFetchMd5DB', e)
        return false
      })
  }
}

export default Middleware
