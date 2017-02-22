export const GLOBAL = (function() { return this })();
export const IS_DEV = GLOBAL.__DEV__;
export const IS_DEBUG = GLOBAL.__DEBUG__;

export const STORE_OVERWRITE = "STORE_OVERWRITE_APP_DATA";
export const STORE_UPDATE = "STORE_UPDATE_APP_DATA";
export const STORE_REMOVE = "STORE_REMOVE_APP_DATA";

export const ORIGIN_DATA = "origin";
export const IMMUTABLE_DATA = "immutable";