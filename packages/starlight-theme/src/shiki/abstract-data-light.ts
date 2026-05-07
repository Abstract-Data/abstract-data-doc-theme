/**
 * Abstract Data — Shiki light theme.
 * Used by expressive-code in HUD/Calm light mode.
 */
export const abstractDataLight = {
  name: 'abstract-data-light',
  type: 'light',
  semanticHighlighting: true,
  colors: {
    'editor.background': '#f4efe5',
    'editor.foreground': '#1a1a1a',
    'editor.lineHighlightBackground': '#ece5d5',
    'editorLineNumber.foreground': '#8e8a7e',
    'editorLineNumber.activeForeground': '#7a1f2c',
    'editor.selectionBackground': '#007a8e2e',
    'editor.findMatchHighlightBackground': '#8a6d1f40',
  },
  tokenColors: [
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#8e8a7e', fontStyle: 'italic' },
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
      settings: { foreground: '#7a1f2c' },
    },
    {
      scope: [
        'string',
        'string.quoted',
        'string.template',
        'punctuation.definition.string',
      ],
      settings: { foreground: '#8a6d1f' },
    },
    {
      scope: ['constant.numeric', 'constant.language', 'constant.character'],
      settings: { foreground: '#7a1f2c' },
    },
    {
      scope: [
        'entity.name.function',
        'support.function',
        'meta.function-call entity.name.function',
      ],
      settings: { foreground: '#007a8e' },
    },
    {
      scope: ['variable', 'variable.parameter', 'variable.other'],
      settings: { foreground: '#1a1a1a' },
    },
    {
      scope: ['entity.name.type', 'support.type', 'support.class', 'entity.name.class'],
      settings: { foreground: '#8a6d1f' },
    },
    {
      scope: ['entity.name.tag', 'meta.tag'],
      settings: { foreground: '#7a1f2c' },
    },
    {
      scope: ['entity.other.attribute-name'],
      settings: { foreground: '#007a8e' },
    },
    {
      scope: ['punctuation', 'meta.brace', 'meta.delimiter'],
      settings: { foreground: '#5e5e66' },
    },
    {
      scope: ['keyword.operator', 'meta.operator'],
      settings: { foreground: '#5e5e66' },
    },
    {
      scope: ['markup.heading'],
      settings: { foreground: '#7a1f2c', fontStyle: 'bold' },
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
      settings: { foreground: '#007a8e' },
    },
    {
      scope: ['markup.deleted'],
      settings: { foreground: '#7a1f2c' },
    },
  ],
} as const;

export default abstractDataLight;
