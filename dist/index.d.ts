import Middleware from './middleware';
import { AxiosRequestConfig, AxiosInstance } from "axios";
declare type TFormatParams = <T>({ url, axiosRequestConfig, funName, DbHttp, params }: {
    url: string;
    axiosRequestConfig: AxiosRequestConfig;
    funName: string;
    DbHttp: AxiosInstance;
    params: T;
}) => T;
declare type TIsRealData = <T>({ url, axiosRequestConfig, funName, DbHttp, data }: {
    url: string;
    axiosRequestConfig: AxiosRequestConfig;
    funName: string;
    DbHttp: AxiosInstance;
    data: T;
}) => boolean;
declare type TFormatResultData = <T>({ url, axiosRequestConfig, funName, DbHttp, data }: {
    url: string;
    axiosRequestConfig: AxiosRequestConfig;
    funName: string;
    DbHttp: AxiosInstance;
    data: T;
}) => T;
declare class Main extends Middleware {
    private readonly formatParams;
    private readonly formatResultData;
    private readonly isRealData;
    private readonly md5;
    constructor({ appKey, outTime, formatParams, isRealData, formatResultData, storeName, md5, }: {
        appKey: string;
        outTime?: number;
        formatParams?: TFormatParams;
        isRealData?: TIsRealData;
        formatResultData?: TFormatResultData;
        storeName?: string;
        md5?: (_: any) => string;
    });
    httpWithIDB({ axiosRequestConfig, funName, DbHttp, fetchKey, newDataCb, fetchDataCb, formatParams, isRealData, formatResultData, fetchPromise }: {
        axiosRequestConfig?: AxiosRequestConfig;
        funName: string;
        DbHttp?: AxiosInstance;
        fetchPromise?: Promise<any>;
        fetchKey?: string;
        newDataCb: (_: any) => void;
        fetchDataCb?: ({ data, isNewData }: {
            data: any;
            isNewData: boolean;
        }) => void;
        formatParams?: TFormatParams;
        isRealData?: TIsRealData;
        formatResultData?: TFormatResultData;
    }): Promise<any>;
}
export default Main;
