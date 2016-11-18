import { Component } from 'react';

export module String {
    export function foramt(template: string, data: any, defaultValue: any = '') {
        if (!data) {
            return template;
        }

        let paramKeys: string[] = [ null ];
        let paramValues: string[] = [];

        for (var key in data) {
            paramKeys.push(key);
            paramValues.push(data[key]);
        }

        return template.replace(/\{([^\}]+)\}/g, function(mStr, pattern) {
            let func = Function.bind.apply(Function, paramKeys.concat(
                'try { return ('+ pattern +') } catch (e) { return "'+ defaultValue +'" }'
            ));

            return (new func()).apply(null, paramValues)
        });
    }
}