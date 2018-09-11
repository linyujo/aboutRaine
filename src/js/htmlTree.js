import {
    isSmallDevice,
    stratify, 
    createNodes,
    treemap,
    drawBranch,
    drawNode,
    drawBarChart,
    drawAxis,
    hoverDetail,
} from "./dendrogramBarChart";

export default function htmlTreeInit () {
    const HTML_CHART_WRAPPER_ID = "html-svg-wrapper";
    const SVG_ID = "html-svg";
    const G_WRAPPER_ID = 'html-g-wrapper';

    const chartWrapper = d3.select(`#${HTML_CHART_WRAPPER_ID}`);

    const groupWrapperTransition = isSmallDevice ? "translate(30, 0) scale(0.8)" : "translate(30, 0) scale(0.9)";

    const createSVG = () => {
        chartWrapper
            .append("svg")
            .attr("id", SVG_ID)
            .append("g")
            .attr("id", G_WRAPPER_ID)
            .attr("transform", groupWrapperTransition);
    };

    createSVG();

    const svg = $(`#${SVG_ID}`);
    const svgHeight = svg.height();
    // const svgHeight = 265;
    const svgWidth = svg.width();
    // const svgWidth = 900;
    const dendrogramWidth = svgWidth * 1 / 4;

    const barChartWidth = svgWidth - dendrogramWidth;

    const xScale = d3.scaleLinear().domain([0,5]).range([0, barChartWidth]);

    const firstEndNodeId = "semantic HTML";

    const arrangeData = (data) => {
        if (data.skill === "HTML") {
            return {
                id: data.skill,
                detail: "",
                score: 0,
                color: "",
                parent: null
            };
        } else {
            return {
                id: data.skill,
                detail: data.detail,
                score: +data.score, // 轉成number
                color: data.color,
                parent: "HTML"
            };
        };
    };

    d3.csv("../data/htmlTree.csv", arrangeData, (error, data) => {
        if (error) throw error;
        const treeData = stratify(data); 
        // 賦予資料 父-子 的階級關係
        const nodes = treemap(svgHeight, dendrogramWidth, treeData);
        // 畫樹枝
        drawBranch(G_WRAPPER_ID, nodes);
        // 畫樹葉
        drawNode(G_WRAPPER_ID, nodes);
        // 長條圖
        drawBarChart(G_WRAPPER_ID, xScale);
        // 畫長條圖上方的x軸
        drawAxis(SVG_ID, G_WRAPPER_ID, svgHeight, firstEndNodeId, xScale);
        // 滑鼠hover
        hoverDetail(SVG_ID, svgHeight);
        // 縮放
        // createZoomArea(G_WRAPPER_ID, svgWidth, svgHeight);
    });
}