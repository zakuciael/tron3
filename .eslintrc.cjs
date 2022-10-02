/*
 * Tron 3
 * Copyright (c) 2022 Krzysztof Saczuk <zakku@zakku.eu>.
 * MIT Licensed
 */

module.exports = {
    root: true,
    env: {
        es2020: true,
        node: true
    },
    extends: ["xo", "xo-typescript", "plugin:prettier/recommended", require.resolve("xo/config/plugins.cjs")],
    plugins: [
        "eslint-comments",
        "n",
        "import",
        "unicorn",
        "ava",
        "no-use-extend-native",
        "prettier"
    ],
    ignorePatterns: [
        "**/node_modules/**",
        "**/bower_components/**",
        "flow-typed/**",
        "coverage/**",
        "{tmp,temp}/**",
        "**/*.min.js",
        "vendor/**",
        "dist/**",
        "tap-snapshots/*.{cjs,js}"
    ],
    rules: {
        /* custom rules */
        "new-cap": "off",
        "capitalized-comments": "off",
        "@typescript-eslint/naming-convention": "off",
        "@typescript-eslint/consistent-type-definitions": "off",
        "@typescript-eslint/unified-signatures": "off",
        "@typescript-eslint/class-literal-property-style": "off",
        "import/no-unassigned-import": [
            "error",
            {
                "allow": [
                    "@babel/polyfill",
                    "**/register",
                    "**/register.*",
                    "**/register/**",
                    "**/register/**.*",
                    "**/*.css",
                    "**/*.scss",
                    "**/*.sass",
                    "**/*.less",
                    "reflect-metadata",
                    "dotenv/config.js"
                ]
            }
        ],

        /* xo rules */
        "@typescript-eslint/no-duplicate-imports": [
            "error"
        ],
        "import/default": [
            "off"
        ],
        "import/export": [
            "off"
        ],
        "import/named": [
            "off"
        ],
        "import/namespace": [
            "off",
            {
                "allowComputed": true
            }
        ],
        "import/no-duplicates": [
            "off"
        ],
        "n/no-unsupported-features/es-builtins": [
            "error",
            {
                "version": ">=14.16"
            }
        ],
        "n/no-unsupported-features/es-syntax": [
            "error",
            {
                "ignores": [
                    "modules"
                ],
                "version": ">=14.16"
            }
        ],
        "n/no-unsupported-features/node-builtins": [
            "error",
            {
                "version": ">=14.16"
            }
        ],
        "node/file-extension-in-import": [
            "off"
        ],
        "unicorn/empty-brace-spaces": [
            "off"
        ],
        "unicorn/import-index": [
            "off"
        ],
        "unicorn/import-style": [
            "off"
        ],
        "unicorn/no-nested-ternary": [
            "off"
        ],
        "unicorn/number-literal-case": [
            "off"
        ],
        "unicorn/prefer-top-level-await": [
            "off"
        ]
    }
};