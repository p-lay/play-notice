import mapping from "./src/contract/_mapping"
import { generateNest, generateFront } from "nest-ts-code-gen"
import { join } from "path"

generateNest({
  mapping,
  sourceContractFolderRelativePath: "../contract",
  sourceEntityFolderRelativePath: "../entity",
  // out folder must in the same level
  outFolderInfo: {
    rootPath: join(__dirname, "src"),
    controllerFolder: "controller",
    serviceFolder: "service",
    moduleFolder: "module"
  }
})

console.log("finish")
