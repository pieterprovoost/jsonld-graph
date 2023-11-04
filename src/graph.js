import jsonld from "jsonld";

export async function generateGraph(input) {
    const expanded = await jsonld.expand(input);
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
                type: link.type
            });
        }
    }

    for (const node of expanded) {
        addNode(nodes, node);
    
        // parentOrganization
    
        if ("http://schema.org/parentOrganization" in node) {
            for (const item of node["http://schema.org/parentOrganization"]) {
                addNode(nodes, item);
                addLink(links, {
                    source: node["@id"],
                    target: item["@id"],
                    type: "parentOrganization"
                });
            }
        }
    
        // about
    
        if ("http://schema.org/about" in node) {
            for (const item of node["http://schema.org/about"]) {
                addNode(nodes, item);
                addLink(links, {
                    source: node["@id"],
                    target: item["@id"],
                    type: "about"
                });
            }
        }
    
        // author
    
        if ("http://schema.org/author" in node) {
            for (const item of node["http://schema.org/author"]) {
                addNode(nodes, item);
                addLink(links, {
                    source: node["@id"],
                    target: item["@id"],
                    type: "author"
                });
            }
        }
    
        // includedInDataCatalog
    
        if ("http://schema.org/includedInDataCatalog" in node) {
            for (const item of node["http://schema.org/includedInDataCatalog"]) {
                addNode(nodes, item);
                addLink(links, {
                    source: node["@id"],
                    target: item["@id"],
                    type: "includedInDataCatalog"
                });
            }
        }
    
        // variableMeasured
    
        if ("http://schema.org/variableMeasured" in node) {
            for (const item of node["http://schema.org/variableMeasured"]) {
                addNode(nodes, item);
                addLink(links, {
                    source: node["@id"],
                    target: item["@id"],
                    type: "variableMeasured"
                });
            }
        }
    
    }
    
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
