export default {
  plugins: {
    // Import processing
    'postcss-import': {},
    
    // Tailwind CSS
    tailwindcss: {},
    
    // Autoprefixer for browser compatibility
    autoprefixer: {},
    
    // CSS optimization for production
    ...(process.env.NODE_ENV === 'production' ? {
      // Optimize CSS
      'postcss-preset-env': {
        stage: 1,
        features: {
          'nesting-rules': true,
          'custom-media-queries': true,
          'custom-properties': true,
          'color-function': true,
        },
      },
      
      // Remove unused CSS
      '@fullhuman/postcss-purgecss': {
        content: [
          './src/**/*.{js,jsx,ts,tsx}',
          './public/index.html',
        ],
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
        safelist: [
          // Bootstrap classes that might be added dynamically
          /^btn-/,
          /^alert-/,
          /^badge-/,
          /^card-/,
          /^modal-/,
          /^dropdown-/,
          /^nav-/,
          /^navbar-/,
          /^form-/,
          /^input-/,
          /^table-/,
          /^bg-/,
          /^text-/,
          /^border-/,
          /^rounded-/,
          /^shadow-/,
          /^p-/,
          /^m-/,
          /^w-/,
          /^h-/,
          /^flex-/,
          /^grid-/,
          /^col-/,
          /^row-/,
          // DriveZone specific classes
          /^dz-/,
          // React transition classes
          /^fade/,
          /^collapse/,
          /^show/,
          /^hide/,
          // Animation classes
          /^animate-/,
          // State classes
          'active',
          'disabled',
          'hover',
          'focus',
          'visited',
        ],
        keyframes: true,
        fontFace: true,
      },
      
      // Minify CSS
      cssnano: {
        preset: [
          'default',
          {
            discardComments: {
              removeAll: true,
            },
            normalizeWhitespace: true,
            colormin: true,
            minifySelectors: true,
            minifyParams: true,
            minifyFontValues: true,
            convertValues: true,
            discardDuplicates: true,
            discardEmpty: true,
            discardOverridden: true,
            discardUnused: true,
            mergeIdents: true,
            mergeLonghand: true,
            mergeRules: true,
            normalizeCharset: true,
            normalizeDisplayValues: true,
            normalizePositions: true,
            normalizeRepeatStyle: true,
            normalizeString: true,
            normalizeTimingFunctions: true,
            normalizeUnicode: true,
            normalizeUrl: true,
            orderedValues: true,
            reduceIdents: true,
            reduceInitial: true,
            reduceTransforms: true,
            svgo: true,
            uniqueSelectors: true,
          },
        ],
      },
    } : {}),
  },
}; 