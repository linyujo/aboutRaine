export const isSmallDevice = $(window).width() < 768 ? true : false; 

// This D3 API method gives cvs file flat data array dimensions.
export const stratify = d3.stratify().id(d => d.id).parentId(d => d.parent);

// export const sortData = data => data.sort((a, b) => b.height - a.height);

//  賦予資料 父-子 的階級關係
export const createNodes = treeData => d3.hierarchy(treeData, d => d.children);

// 父-子的階級關係給予樹狀座標
export const treemap = (svgHeight, dendrogramWidth, nodes) => d3.cluster().size([svgHeight, dendrogramWidth])(nodes);

// 畫樹枝
export const drawBranch = (G_WRAPPER_ID ,nodes) => {
    d3.select(`#${G_WRAPPER_ID}`)
        .selectAll(".link")
        .data(nodes.descendants().slice(1))
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", data => `
            M${data.y},
            ${data.x}C${data.parent.y + 50},
            ${data.x} ${data.parent.y + 50},
            ${data.parent.x} ${data.parent.y},
            ${data.parent.x}`
        );
};

export const drawNode = (G_WRAPPER_ID, nodes) => {
    const node = d3.select(`#${G_WRAPPER_ID}`)
                    .selectAll(".node")
                    .data(nodes.descendants())
                    .enter()
                    .append("g")
                    .attr("class", d => `node ${d.children ? "node--internal" : "node--leaf"}`)
                    .attr("transform", d => `translate(${d.y},${d.x})`);
    // 每個端點上畫圈
    node.append("circle").attr("r", 4);
    // 在非樹葉(".node--internal")的端點加上text
    d3.select(`#${G_WRAPPER_ID}`)
        .selectAll(".node--internal")
        .append("text")
        .attr("y", -10)
        .style("text-anchor", "middle")
        .text( d => d.data.id );
};

// const xScale = d3.scaleLinear().domain([0,5]).range([0, 400]);

export const drawBarChart = (G_WRAPPER_ID, xScale) => {
    const _gLeafNode = d3.select(`#${G_WRAPPER_ID}`)
                            .selectAll(".node--leaf")
                            .append("g")
                            .attr("class", "node--leaf-g")
                            .attr("transform", "translate(" + 8 + "," + -13 + ")");
    const bar = () => {
        _gLeafNode.append("rect")
                    .attr("class", "shadow")
                    .style("fill", vo => vo.data.color)
                    .attr("width", 2)
                    .attr("height", 30)
                    .attr("rx", 2)
                    .attr("ry", 2)
                    .transition()
                    .duration(800)
                    .attr("width", vo => xScale(vo.data.score));
    };

    const barText = () => {
        _gLeafNode.append("text")
                    .attr("dy", 19.5)
                    .attr("x", 8)
                    .style("text-anchor", "start")
                    .text( vo => vo.data.id );
    };

    bar();
    barText();
};

export const drawAxis = (SVG_ID, G_WRAPPER_ID, svgHeight, firstEndNodeId, xScale) => {
    const firstEndNode = d3.select(`#${G_WRAPPER_ID}`).selectAll(".node--leaf").filter(d => d.data.id === firstEndNodeId);
    const smScale = ["", "1.0","2.0","3.0","4.0","5.0"];
    const mdScale = ["", "Basic 1.0","Alright 2.0","Handy 3.0","Expert 4.0","Guru 5.0"];
    const experienceName = isSmallDevice ? smScale : mdScale;

    const formatSkillPoints = data => experienceName[data % 6];
    const xAxis = d3.axisTop().scale(xScale).ticks(5).tickFormat(formatSkillPoints);

    if (SVG_ID !== 'css-svg') {
        // Attach axis on top of the first leaf datum.
        firstEndNode.insert("g")
                    .attr("class","xAxis")
                    .attr("transform", "translate(7,-14)")
                    .call(xAxis);
    };
    
    // tick mark for x-axis
    firstEndNode.insert("g")
                .attr("class", "grid")
                .attr("transform", `translate(7,${svgHeight - 15})`)
                .call(d3.axisBottom()
                        .scale(xScale)
                        .ticks(5)
                        .tickSize(-svgHeight, 0, 0)
                        .tickFormat("")
                );
    // Emphasize the y-axis baseline.
    d3.select(`#${SVG_ID}`)
        .selectAll(".grid")
        .select("line")
        .style("stroke-dasharray","20,1")
        .style("stroke","black");
};

export const toolTip = d3.tip()
                        .attr('class', 'd3-tip')
                        .attr( vo => ("transform", `translate(${vo.y + xScale(vo.data.score) + 30}, ${vo.x + 30})`))
                        .offset([0, 0])
                        .html( vo => vo.data.detail);

export const hoverDetail = (SVG_ID, svgHeight) => {
    // init detailRect
    // const detailRectG = d3.select(`#${SVG_ID}`)
    //                         .insert("g")
    //                         .attr("class","rectG")
    //                         .attr("transform", `translate(${svgHeight},${svgHeight/2})`);

    // detail-text
    // detailRectG.insert("text").style("text-anchor", "middle");

    const handleMouseOver = (vo, index, parent) => {
        const leafG = d3.select(parent[index]);
        // border
        leafG.select("rect").attr("stroke","#4D4D4D").attr("stroke-width","2");
        // change rect position
        // const detailRectMovement = detailRectG.transition()
        //                                     .duration(400)
        //                                     .attr("transform", `translate(${vo.y + xScale(vo.data.data.score) + 30}, ${vo.x + 30})`)
                            
        // change detail text
        // detailRectMovement.select("text").text(vo.data.data.detail);
    };
    const handleMouseOut = (vo, index, parent) => {
        const leafG = d3.select(parent[index]);
        leafG.select("rect").attr("stroke-width","0");
    };
    
    d3.selectAll(".node--leaf-g")
        .on("mouseover", toolTip.show)
        .on("mouseout", toolTip.hide);
};

export const createZoomArea = (G_WRAPPER_ID, svgWidth, svgHeight) => {
    const zoomWrapper = d3.select(`#${G_WRAPPER_ID}`).append("rect");
    zoomWrapper
        .attr("class", "zoom")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .call(zoomListener);

    const zoomListener = d3.zoom().on("zoom", () => {
        zoomWrapper.attr("transform", d3.event.transform);
    });
};

/*
export const createZoomArea = (G_WRAPPER_ID, svgWidth, svgHeight) => {
    const zoomHandler = () => {
        d3.select(`#${G_WRAPPER_ID}`).attr("transform", d3.event.transform);
    };
    const zoomListener = d3.zoom().on("zoom", zoomHandler);
    
    d3.select(`#${G_WRAPPER_ID}`)
        .append("rect")
        .attr("class", "zoom")
        .attr("width", "100%")
        .attr("height", "100%")
        .call(zoomListener);
};
*/