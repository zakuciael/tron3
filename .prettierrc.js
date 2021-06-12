/*
 * Tron 3
 * Copyright (c) 2021 Krzysztof Saczuk <zakku@zakku.eu>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

module.exports = {
    printWidth: 100,
    endOfLine: "lf",
    tabWidth: 4,
    semi: true,
    singleQuote: false,
    bracketSpacing: true,
    trailingComma: "es5",
    arrowParens: "always",
    quoteProps: "as-needed",
    overrides: [
        {
            files: "*.json",
            options: {
                tabWidth: 2,
            },
        },
    ],
};