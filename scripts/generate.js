const { readFile } = require('fs').promises;
const { join } = require('path');
const { Type, DEFAULT_SCHEMA, load } = require('js-yaml');

/**
 * @typedef {Object} TokenColor - Textmate token color.
 * @prop {string} [name] - Optional name.
 * @prop {string[]} scope - Array of scopes.
 * @prop {Record<'foreground'|'background'|'fontStyle',string|undefined>} settings - Textmate token settings.
 *       Note: fontStyle is a space-separated list of any of `italic`, `bold`, `underline`.
 */

/**
 * @typedef {Object} Theme - Parsed theme object.
 * @prop {Record<'base'|'ansi'|'brightOther'|'other', string[]>} oxfordDark - Base color variables.
 * @prop {Record<string, string|null|undefined>} colors - VSCode color mapping.
 * @prop {TokenColor[]} tokenColors - Textmate token colors.
 */

/**
 * @typedef {(yamlObj: Theme) => Theme} ThemeTransform
 */

const withAlphaType = new Type('!alpha', {
    kind: 'sequence',
    construct: ([hexRGB, alpha]) => hexRGB + ("0" + alpha).slice(-2),
    represent: ([hexRGB, alpha]) => hexRGB + ("0" + alpha).slice(-2),
});

const schema = DEFAULT_SCHEMA.extend([withAlphaType]);

module.exports = async () => {
    const yamlFile = await readFile(
        join(__dirname, '..', 'src', 'oxford-dark-color-theme.yml'),
        'utf-8'
    );

    /** @type {Theme} */
    const base = load(yamlFile, { schema });

    // Remove nulls and other falsey values from colors
    for (const key of Object.keys(base.colors)) {
        if (!base.colors[key]) {
            delete base.colors[key];
        }
    }

    return { base };
};
