/**
 * Abstract Data — Shiki dark theme.
 * Used by expressive-code in HUD/Calm dark mode.
 */
export const abstractDataDark = {
  name: 'abstract-data-dark',
  type: 'dark',
  semanticHighlighting: true,
  colors: {
    'editor.background': '#0c0d11',
    'editor.foreground': '#f0f0f5',
    'editor.lineHighlightBackground': '#14151a',
    'editorLineNumber.foreground': '#5a5b62',
    'editorLineNumber.activeForeground': '#00d9ff',
    'editor.selectionBackground': '#00d9ff2e',
    'editor.findMatchHighlightBackground': '#d4af3733',
  },
  tokenColors: [
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#5a5b62', fontStyle: 'italic' },
    },
    {
      scope: [
        'keyword',
        'storage',
        'storage.type',
        'storage.modifier',
        'keyword.control',
        'keyword.operator.new',
        'keyword.operator.expression',
      ],
      settings: { foreground: '#00d9ff' },
    },
    {
      scope: [
        'string',
        'string.quoted',
        'string.template',
        'punctuation.definition.string',
      ],
      settings: { foreground: '#d4af37' },
    },
    {
      scope: ['constant.numeric', 'constant.language', 'constant.character'],
      settings: { foreground: '#c04a5b' },
    },
    {
      scope: [
        'entity.name.function',
        'support.function',
        'meta.function-call entity.name.function',
      ],
      settings: { foreground: '#c0e0ff' },
    },
    {
      scope: ['variable', 'variable.parameter', 'variable.other'],
      settings: { foreground: '#f0f0f5' },
    },
    {
      scope: ['entity.name.type', 'support.type', 'support.class', 'entity.name.class'],
      settings: { foreground: '#d4af37' },
    },
    {
      scope: ['entity.name.tag', 'meta.tag'],
      settings: { foreground: '#00d9ff' },
    },
    {
      scope: ['entity.other.attribute-name'],
      settings: { foreground: '#d4af37' },
    },
    {
      scope: ['punctuation', 'meta.brace', 'meta.delimiter'],
      settings: { foreground: '#8a8a93' },
    },
    {
      scope: ['keyword.operator', 'meta.operator'],
      settings: { foreground: '#8a8a93' },
    },
    {
      scope: ['markup.heading'],
      settings: { foreground: '#00d9ff', fontStyle: 'bold' },
    },
    {
      scope: ['markup.bold'],
      settings: { fontStyle: 'bold' },
    },
    {
      scope: ['markup.italic'],
      settings: { fontStyle: 'italic' },
    },
    {
      scope: ['markup.inserted'],
      settings: { foreground: '#00d9ff' },
    },
    {
      scope: ['markup.deleted'],
      settings: { foreground: '#c04a5b' },
    },
  ],
} as const;

export default abstractDataDark;
