import { Component } from 'react';
import { DEVICE_DENSITY } from '../constants';

export function foramt(template: string, data: any) {
    if (!data) {
        return template;
    }
    
    return template.replace(/\{([^\}]+)\}/g, function(mStr, cStr1) {
        return xEval(cStr1, data);
    });
}

function xEval(pattern: string, paramMap: HashMap<any>) {
    const args = Object.keys(paramMap||{});
    const paramValues: any[] = [];
    
    for (let key of args)  {
        paramValues.push(paramMap[key]);
    }
    
    args.push(`return (${pattern});`);
    return (new (Function.bind.apply(Function, [null].concat(args)))).apply(null, paramValues);
}