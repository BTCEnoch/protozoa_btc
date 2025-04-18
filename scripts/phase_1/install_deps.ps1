npm install --save-dev typescript vite @vitejs/plugin-react three react react-dom jest @types/jest ts-jest eslint prettier husky fake-indexeddb @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react

Write-Output '{ "extends": ["plugin:@typescript-eslint/recommended", "plugin:react/recommended"], "rules": { "no-unused-vars": "error" } }' > .eslintrc.json
Write-Output '{ "semi": true, "trailingComma": "es5", "singleQuote": true, "tabWidth": 2 }' > .prettierrc
npm pkg set scripts.prepare="husky install"
npx husky-init
Write-Output "npm run lint && npm run test" > .husky/pre-commit