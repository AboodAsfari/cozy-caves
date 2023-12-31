const ToolbarButton = (props) => {
    const {
        currTool,
        desiredTool,
        iconName,
        setCurrTool
    } = props;

    return (
        <span className={"material-symbols-outlined ToolIcon"} onClick={() => setCurrTool(desiredTool)}
            style={{ fontSize: 30, userSelect: "none", color: currTool === desiredTool ? "#7da36d" : "white", marginRight: 10 }}>
            {iconName}
        </span>
    );
}

export default ToolbarButton;
