import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs"; // commonjs => es6
import filesize from "rollup-plugin-filesize";
import { terser } from "rollup-plugin-terser"; // 压缩代码
import { babel } from "@rollup/plugin-babel";
import { visualizer } from "rollup-plugin-visualizer";

function configPlugin() {
  return [
    typescript(),
    resolve(),
    commonjs(),
    terser({
      format: { comments: false }
    }),
    filesize(),
    visualizer({
      // open: true,
      gzipSize: true
    }),
    babel({
      babelHelpers: "runtime",
      exclude: [
        "/node_modules/",
      ],
      extensions: [".js", ".ts",],
      presets: [
        [
          "@babel/preset-env",
          {
            modules: false,
            targets: {
              "browsers": [
                "last 2 versions",
                "ie >= 10"
              ],
            },
            useBuiltIns: "entry", // usage
            corejs: 3,
          },
        ],
      ],
      babelrc: false,
      plugins: [
        "@babel/plugin-syntax-dynamic-import",
        [
          "@babel/plugin-transform-runtime",
          {
            useESModules: true,
          },
        ],
      ],
    })
  ]
}


export default [
  {
    input: "lib/index.ts",
    plugins: configPlugin(),
    output: {
      file: "dist/bundle.js",
      format: "esm",
      name: "axios-indexeddb-sdk",
      sourcemap: true
    },
    external: ["axios"]
  },
]

