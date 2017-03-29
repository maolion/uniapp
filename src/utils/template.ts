import { HashMap } from '../types';

let cachedTemplate = '';
let cachedDefaultValue = '';
let cachedParsedTemplate = '';

// 原理是，把字符串模板 简单转换成可执行的js代码，然后把会被使用到的数据对象的属性标识符，添加
// 到这段js代码运行上下文中(下面实现是在函数参数申明位置)
//
// format("hello, {name}", { name: "lion" })
// 上面的调用，简单编译后的js代码会像下面这样
// (new Function('name', 'return ("hello, " + name)'))('lion');

/**
 * 编译一个字符串模板，并返回可多次填充模块数据的可执行函数
 *
 * 返回的可执行函数中的data参数属性 需要与 paramKeys 参数列表中的对应，否则不存在的会使用
 * 默认值代替
 */
export function buildTemplate(template: string, paramKeys: string[], defaultValue = '') {
  let parsedTemplate = parseTemplate(template, defaultValue);
  let func = Function.bind.apply(Function, paramKeys.concat(
    parseTemplate(template, defaultValue)
  ));
  let formatFunc = new func();

  return (data: any) => {
    let paramValues = [];

    for (let i = 0, l = paramKeys.length; i < l; i++) {
      let key = paramKeys[i];
      let value = data.hasOwnProperty(key) ? data[key] : defaultValue;
      paramValues.push(value);
    }

    return formatFunc.apply(null, paramValues);
  };
}
/*
// buildTemplate 使用说明

var templte = buildTemplate(`hello, {name}`, ['name']);
templte({ name: 'lion' }); // hello, lion
templte({ name: 'xxxx' }); // hello, xxxx
*/

/** 将数据填充到模板中，并返回填充后的最终字符串结果 */
export function format(template: string, data: any, defaultValue = '') {
  if (!template) {
    return '';
  }

  let paramKeys: any[] = [null];
  let paramValues: string[] = [];

  for (let key of Object.keys(data)) {
    paramKeys.push(key);
    paramValues.push(data[key]);
  }

  let func = Function.bind.apply(Function, paramKeys.concat(
    parseTemplate(template, defaultValue)
  ));

  return (new func()).apply(null, paramValues);
}
/*
// format 使用说明

format(`{1+1}`, {}); // 2
format(`{1 + n}`, { n: 2 }); // 3
format(`{a} + {b} = {a + b}`, { a: 1, : b: 2 }); // 1 + 2 = 3
*/

/** 将模板代码简单转换成可执行的 js代码 */
function parseTemplate(template: string, defaultValue = '') {
  if (!template) {
    return '';
  }

  // 如果解析数据与最近一次的解析数据一样，就返缓存的解析结果
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

  while (true) {
    match = reg.exec(template);

    if (!match) {
      break;
    }

    let pattern = match[1].trim();

    // 单引号转义处理
    parsedTemplate += template.substr(lastIndex, match.index - lastIndex).replace(/(?=[^\\]|^)'/g, '\\\'');

    lastIndex = reg.lastIndex;

    if (!pattern) {
      continue;
    }

    let statement;

    // 相同 pattern 做一次 字符串拼接处理
    if (statementMapping.hasOwnProperty(pattern)) {
      statement = statementMapping[pattern];
    } else {
      statement = `' + ((${pattern}) || '${defaultValue}') + '`;
      statementMapping[pattern] = statement;
    }

    parsedTemplate += statement;
  }

  // 单引号转义处理
  parsedTemplate += template.substr(lastIndex).replace(/(?=[^\\]|^)'/g, '\\\'') + '\'';

  cachedTemplate = template;
  cachedParsedTemplate = parsedTemplate;
  cachedDefaultValue = defaultValue;

  return parsedTemplate;
}
