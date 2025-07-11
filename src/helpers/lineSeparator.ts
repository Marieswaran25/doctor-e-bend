export function lineSeparator<T extends Record<string, any>>(obj: T, options: { appendColon?: boolean } = { appendColon: true }, indentLevel = 0): string {
    const indent = '  '.repeat(indentLevel);
    return Object.entries(obj)
        .map(([key, value]) => {
            const isNumericKey = !isNaN(Number(key));

            if (isNumericKey) {
                if (value && typeof value === 'object') {
                    return lineSeparator(value, options, indentLevel);
                }
                return '';
            }

            if (value && typeof value === 'object') {
                const nested = lineSeparator(value, options, indentLevel + 1);
                return `${indent}${key}:${nested ? '\n' + nested : ''}`;
            }

            return `${indent}${key}${options.appendColon ? ':' : ''} ${value}`;
        })
        .filter(Boolean)
        .join('\n');
}
