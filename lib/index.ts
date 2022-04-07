import Middleware from './middleware'

import {AxiosRequestConfig, AxiosInstance} from "axios";

type TFormatParams = <T>({
                           url,
                           axiosRequestConfig,
                           funName,
                           DbHttp,
                           params
                         }: { url: string, axiosRequestConfig: AxiosRequestConfig, funName: string, DbHttp: AxiosInstance, params: T }) => T

type TIsRealData = <T>({
                         url,
                         axiosRequestConfig,
                         funName,
                         DbHttp,
                         data
                       }: { url: string, axiosRequestConfig: AxiosRequestConfig, funName: string, DbHttp: AxiosInstance, data: T }) => boolean

type TFormatResultData = <T>({
                               url,
                               axiosRequestConfig,
                               funName,
                               DbHttp,
                               data
                             }: { url: string, axiosRequestConfig: AxiosRequestConfig, funName: string, DbHttp: AxiosInstance, data: T }) => T

/* 一些默认格式化方法 */
const defFormatParams = ({params}) => params
const defFormatResultData = ({data}) => data.data ? {data: data.data} : data // 默认会去除axios的其他字段，如headers
const defIsRealData = ({data}) => !!data

class Main extends Middleware {
  /* 格式化入参，去除非必要数据，如uuid不作为查询数据库的key  */
  private readonly formatParams: TFormatParams
  /* 格式化出参，去除非必要数据 */
  private readonly formatResultData: TFormatResultData
  /* 判断存储的数据的合法性，如果数据非法就不取用，直接拿最新的接口 */
  private readonly isRealData: TIsRealData
  private readonly md5: any

  constructor({
                appKey,
                outTime,
                formatParams,
                isRealData,
                formatResultData,
                storeName,
                md5,
              }: {
    appKey: string,
    outTime?: number,
    formatParams?: TFormatParams,
    isRealData?: TIsRealData,
    formatResultData?: TFormatResultData,
    storeName?: string,
    md5?: (_: any) => string, // 加密方法，若不传fetchKey,则需要传此参数
  }) {
    super(appKey, outTime, storeName);
    this.formatParams = formatParams || defFormatParams
    this.formatResultData = formatResultData || defFormatResultData
    this.isRealData = isRealData || defIsRealData
    this.md5 = md5 || null
  }

  async httpWithIDB({
                      axiosRequestConfig,
                      funName,
                      DbHttp,
                      fetchKey,
                      newDataCb,
                      fetchDataCb,
                      formatParams,
                      isRealData,
                      formatResultData,
                      fetchPromise
                    }: {
    axiosRequestConfig?: AxiosRequestConfig,
    funName: string,
    DbHttp?: AxiosInstance,
    fetchPromise?: Promise<any> // 若传入fetchPromise 则使用此发请求，否则使用axios发请求
    fetchKey?: string // 若传入fetchKey，则使用此key作为请求唯一标识，否则使用md5(axiosRequestConfig.params)作为唯一标识，需要传入md5和axiosRequestConfig
    newDataCb: (_: any) => void,
    fetchDataCb?:  ({data, isNewData}: {data: any, isNewData: boolean}) => void,
    formatParams?: TFormatParams,
    isRealData?: TIsRealData,
    formatResultData?: TFormatResultData,
  }) {
    const url = axiosRequestConfig?.url
    formatParams = formatParams || this.formatParams
    isRealData = isRealData || this.isRealData
    formatResultData = formatResultData || this.formatResultData
    const pureParamsMd5 = fetchKey || this.md5(JSON.stringify(formatParams({
      url,
      axiosRequestConfig,
      funName,
      DbHttp,
      params: axiosRequestConfig?.params || axiosRequestConfig?.data || {},
    })))
    let IDBResult: '0' | '-1' | string = '0' // 默认为0，-1查询为空，其余为正常；用于判断IDB的数据是否命中
    /*
     * 获取DB的数据
     * */
    const fnDB = this.getFetchMd5DB({reqMd5: pureParamsMd5, funName})
      .then(res => {
        const data = res && JSON.parse(res)
        // 数据合法就取数据库数据，否则直接走接口逻辑
        if (isRealData({url, axiosRequestConfig, funName, DbHttp, data})) {
          IDBResult = res
          return Promise.resolve(data) // 命中设置为resolved态
        } else {
          IDBResult = '-1' // 数据库非法
          return (new Promise(() => {}) as unknown) as any // 未命中设置为pending态
        }
      })
      .catch(e => {
        console.warn('[idb]getFetchMd5DB不支持', e)
        return (new Promise(() => {
        }) as unknown) as any // IDB失败设置为pending态
      })

    /*
     * 获取接口的数据
     * */
    let fnHttp: Promise<any>
    // 处理接口返回结果
    const dealData = async (data) => {
       // 回调接口的数据
      data = formatResultData({url, axiosRequestConfig, funName, DbHttp, data})
      const dataStr = JSON.stringify(data)
      await this.setFetchMd5DB({reqMd5: pureParamsMd5, funName, resultData: dataStr})
      const isNewData = IDBResult !== '0' && IDBResult !== '-1' && dataStr !== IDBResult
      fetchDataCb && fetchDataCb({data, isNewData})
      if (isNewData) {
        newDataCb && newDataCb(data)
      }
      return Promise.resolve(data) // 得到结果为resolved态
    }
    if (fetchPromise) {
      fnHttp = fetchPromise.then(async res => {
        return dealData(res)
      })
      .catch(async e => {
        console.error('[idb]fnHttp', e)
        return Promise.reject(e) // 未得到结果为rejected态
      })
    } else {
      fnHttp = DbHttp(axiosRequestConfig)
        .then(async res => {
          return dealData(res)
        })
        .catch(async e => {
          console.error('[idb]fnHttp', e)
          return Promise.reject(e) // 未得到结果为rejected态
        })
    }

    return await Promise.race([fnHttp, fnDB])
      .then(res => {
        return res
      })
      .catch(e => {
        console.error('[idb]Promise.race', e)
        return e
      })
  }
}

export default Main
