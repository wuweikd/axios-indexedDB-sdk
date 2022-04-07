declare class IDB {
    private readonly preAppKey;
    private static readonly IS_SUP_IDB;
    private static readonly ERROR_TXT;
    private static readonly DEBOUNCE_TIME;
    private readonly OUT_TIME;
    private customStore;
    constructor(appKey: string, outTime: number, storeName: string);
    private delWhenOutTime;
    setIDB(dataKey: string, data: any): Promise<void>;
    getIDB(dataKey: string): Promise<any>;
}
export default IDB;
