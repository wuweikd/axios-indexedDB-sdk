import IDB from './core';
declare class Middleware extends IDB {
    constructor(appKey: any, outTime: any, storeName: any);
    getFetchMd5DB({ reqMd5, funName }: {
        reqMd5: string;
        funName: string;
    }): Promise<any>;
    setFetchMd5DB({ reqMd5, funName, resultData }: {
        reqMd5: string;
        resultData: any;
        funName: string;
    }): Promise<boolean | void>;
}
export default Middleware;
