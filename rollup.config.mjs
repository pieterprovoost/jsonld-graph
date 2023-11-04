import babel from "@rollup/plugin-babel";

export default {
    input: "src/index.js",
    output: {
        file: "docs/jsonldviz.min.js",
        format: "iife",
        sourceMap: "inline",
        name: "jsonldviz",
        globals: {
            "d3": "d3",
            "jsonld": "jsonld"
        }
    },
    plugins: [
        babel()
    ]
};
