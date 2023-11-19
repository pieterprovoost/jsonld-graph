import jsonld from "jsonld";

export async function generateGraph(input) {
    const regex = /\/\*[\s\S]*?\*\/|\s\/\/.*\n/g;
    const cleaned = input.replaceAll(regex, "");
    console.log(cleaned)
    const parsed = JSON.parse(cleaned);
    const expanded = await jsonld.expand(parsed);

    const nodes = {};
    const links = [];
    
    function addNode(nodes, node) {
        if (node["@id"]) {
            if (!(node["@id"] in nodes)) {
                nodes[node["@id"]] = {
                    id: node["@id"]
                };
            }
            if (node["@type"]) {
                nodes[node["@id"]]["type"] = node["@type"][0];
            }
        }
    }
    
    function addLink(links, link) {
        if (link.source && link.target) {
            links.push({
                source: link.source,
                target: link.target,
                type: link.type.split("/").pop()
            });
        }
    }

    function recursiveTraversal(list) {
        list.forEach(item => {
            if (item["@id"] && item["@type"]) {
                addNode(nodes, item);
                Object.keys(item).forEach(key => {
                    if (Array.isArray(item[key]) && item[key].length > 0 && typeof item[key][0] === "object") {
                        item[key].forEach(subitem => {
                            addNode(nodes, subitem);
                            addLink(links, {
                                source: item["@id"],
                                target: subitem["@id"],
                                type: key
                            });
                        });
                        recursiveTraversal(item[key]);
                    }
                });
    
            }
        });
    }
      
    recursiveTraversal(expanded);
    const nodeIds = Object.entries(nodes).reduce((acc, [key, value], index) => {
        acc[key] = index;
        return acc;
    }, {});
    
    const jsonGraph = {
        nodes: Object.entries(nodes).map(([key, value]) => ({
            id: nodeIds[key],
            name: value.id,
            label: value.id,
            group: value.type,
            runtime: 100
        })),
        links: links.map(link => ({
            source: nodeIds[link.source],
            target: nodeIds[link.target],
            type: link.type
        }))
    }

    return jsonGraph;
}
