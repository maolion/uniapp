
function format(template, data, defaultValue = '') {
    if (!template) {
        return '';
    }

    let paramKeys = [ null ];
    let paramValues = [];

    for (var key in data) {
        paramKeys.push(key);
        paramValues.push(data[key]);
    }

    let compiledCode = 'return \'';
    let reg = /\{([^\}]+)\}/g;
    let match = null;
    let statementMapping = {};
    let lastIndex = 0;

    template = template.replace(/\\\{/g, '\\x7b').replace(/\}\\/g, '\\x7d');

    while (match = reg.exec(template)) {
        let pattern = match[1].trim();
        compiledCode += template.substr(lastIndex, match.index - lastIndex).replace(/(?=[^\\]|^)'/g, '\\\'');
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

        compiledCode += statement;
    }

    compiledCode += template.substr(lastIndex).replace(/(?=[^\\]|^)'/g, '\\\'') + '\'';

    let func = Function.bind.apply(Function, paramKeys.concat(
        compiledCode
    ));

    return (new func()).apply(null, paramValues);
}
