import {
    isSmallDevice,
    toolTip,
    stratify,
    treemap,
    drawBranch,
    drawNode,
    drawBarChart,
    drawAxis,
    hoverDetail,
    createZoomArea
} from "./dendrogramBarChart";

export default function backendTreeInit () {
    const BACKEND_CHART_WRAPPER_ID = "backend-svg-wrapper";
    const SVG_ID = "backend-svg";
    const G_WRAPPER_ID = 'backend-g-wrapper';

    const chartWrapper = d3.select(`#${BACKEND_CHART_WRAPPER_ID}`);

    const groupWrapperTransition = isSmallDevice ? "translate(32, 10) scale(0.8)" : "translate(48, 10) scale(0.9)";

    const createSVG = () => {
        chartWrapper
            .append("svg")
            .attr("id", SVG_ID)
            .append("g")
            .attr("id", G_WRAPPER_ID)
            .attr("transform", groupWrapperTransition);
    };

    createSVG();

    d3.select(`#${SVG_ID}`).call(toolTip);

    const svg = $(`#${SVG_ID}`);
    const svgHeight = svg.height();
    const svgWidth = svg.width();
    const dendrogramWidth = svgWidth * 1 / 2;

    const barChartWidth = svgWidth - dendrogramWidth;

    const xScale = d3.scaleLinear().domain([0,5]).range([0, barChartWidth]);

    const firstEndNodeId = "Node.js";

    const arrangeData = (data) => {
        if (data.skill === "backend") {
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
                parent: data.parent
            };
        };
    };

    d3.csv("../data/backendTree.csv", arrangeData, (error, data) => {
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
    });
};