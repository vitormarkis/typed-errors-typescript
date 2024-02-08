import type { Config } from "jest"

import { pathsToModuleNameMapper } from "ts-jest"
const { compilerOptions } = require("./tsconfig")

const config: Config = {
  // clearMocks: true,
  // collectCoverage: true,
  // coverageDirectory: "coverage",
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>",
  }),
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  coverageProvider: "v8",
}

export default config
