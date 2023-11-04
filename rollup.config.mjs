import babel from "@rollup/plugin-babel";

export default {
    input: "src/index.js",
    output: {
        file: "docs/jsonldgraph.min.js",
        format: "iife",
        sourceMap: "inline",
        name: "jsonldgraph",
        globals: {
            "d3": "d3",
            "jsonld": "jsonld"
        }
    },
    plugins: [
        babel()
    ]
};
