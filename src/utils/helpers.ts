const Immutable = require('immutable');

import { HashMap } from '../types';

export module String {
    let cachedTemplate = '';
    let cachedDefaultValue = '';
    let cachedParsedTemplate = '';

    function parseTemplate(template: string, defaultValue = '') {
        if (!template) {
            return '';
        }

        if (template.length === cachedTemplate.length && 
            template === cachedTemplate && 
            defaultValue === cachedDefaultValue
        ) {
            return cachedParsedTemplate;
        }

        let parsedTemplate = 'return \'';
        let reg = /\{([^\}]+)\}/g;
        let match = null;
        let statementMapping: HashMap<string> = {};
        let lastIndex = 0;

        // 将 \{ 或 \} 这些 可能会干扰到 模板字符串结果的的字符 替换成 unicode
        template = template.replace(/\\\{/g, '\\x7b').replace(/\}\\/g, '\\x7d');

        while (match = reg.exec(template)) {
            let pattern = match[1].trim();
            parsedTemplate += template.substr(lastIndex, match.index - lastIndex).replace(/(?=[^\\]|^)'/g, '\\\'');
            lastIndex = reg.lastIndex;

            if (!pattern) {
                continue;
            }

            let statement;

            if (statementMapping.hasOwnProperty(pattern)) {
                statement = statementMapping[pattern];
            } else {
                statement = `' + ((${pattern}) || '${defaultValue}') + '`;
                statementMapping[pattern] = statement;
            }

            parsedTemplate += statement;
        }

        parsedTemplate += template.substr(lastIndex).replace(/(?=[^\\]|^)'/g, '\\\'') + '\'';
        
        cachedTemplate = template;
        cachedParsedTemplate = parsedTemplate;
        cachedDefaultValue = defaultValue;

        return parsedTemplate;
    }

    export function buildFormatTemplate(template: string, paramKeys: string[], defaultValue = '') {
        let parsedTemplate = parseTemplate(template, defaultValue);
        let func = Function.bind.apply(Function, paramKeys.concat(
            parseTemplate(template, defaultValue)
        ));
        let formatFunc = new func();

        return function(data: any) {
            let paramValues = [];
            for (let i = 0, l = paramKeys.length; i < l; i++) {
                let key = paramKeys[i];
                let value = data.hasOwnProperty(key) ? data[key] : defaultValue;
                paramValues.push(value);
            }

            return formatFunc.apply(null, paramValues);
        }
    }

    export function format(template: string, data: any, defaultValue = '') {
        if (!template) {
            return '';
        }

        let paramKeys: string[] = [ null ];
        let paramValues: string[] = [];

        for (var key in data) {
            paramKeys.push(key);
            paramValues.push(data[key]);
        }
        
        let func = Function.bind.apply(Function, paramKeys.concat(
            parseTemplate(template, defaultValue)
        ));

        return (new func()).apply(null, paramValues);
    }
}

export function isImmutableData(obj: any) {
    return !!obj && (
        obj instanceof Immutable.Map ||
        obj instanceof Immutable.List ||
        obj instanceof Immutable.Set ||
        obj instanceof Immutable.Seq ||
        obj instanceof Immutable.Record ||
        obj instanceof Immutable.Stack ||
        obj instanceof Immutable.OrderedMap ||
        obj instanceof Immutable.OrderedSet ||
        obj instanceof Immutable.Seq.Indexed ||
        obj instanceof Immutable.Iterable || 
        obj instanceof Immutable.Collection
    );
}