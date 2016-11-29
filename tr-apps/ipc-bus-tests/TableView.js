var processes = [ "###", "master", "renderer1", "renderer2", "nodeA", "nodeB" ];

initialize = function(htmlTable) {
    initView(htmlTable);
    initProcesses();
};

initView = function(htmlTable) {
    processes.forEach(function(nameRow) {
        let newRow = document.createElement("tr");
        if (nameRow == processes[0]) {
            let classFirstRow = document.createAttribute("class");
            classFirstRow.value = "FirstRow";
            newRow.setAttributeNode(classFirstRow);
        }
        else {
            initProcess(nameRow);
        }
        processes.forEach(function(nameCol) {
            let newCol = document.createElement("td");
            if (nameRow == processes[0]) {
                if (nameCol == processes[0]) {
                    newCol.innerHTML = "RESULTS";
                }
                else {
                    newCol.innerHTML = nameCol;
                }
            }
            else if (nameCol == processes[0]) {
                newCol.innerHTML = nameRow;
                let classFirstColumn = document.createAttribute("class");
                classFirstColumn.value = "FirstColumn";
                newCol.setAttributeNode(classFirstColumn);
            }
            else {
                // console.info("%s -> %s", nameRow, nameCol);
                let cellName = nameRow + "_" + nameCol;
                let attrId = document.createAttribute("id");
                attrId.value = "IPC_TEST_" + cellName;
                newCol.setAttributeNode(attrId);
                let attrOnClick = document.createAttribute("onclick");
                attrOnClick.value = "onCellClicked('" + nameRow + "', '" + nameCol + "')";
                newCol.setAttributeNode(attrOnClick);
                newCol.innerHTML = "Not started";
            }
            newRow.appendChild(newCol);
        });
        htmlTable.appendChild(newRow);
    });
};

initProcesses = function() {
    ;
};

initProcess = function(processName) {
    if (processName.lastIndexOf("master") == 0) {
        // console.debug("master: '%s'", processName);
        doSubscribe(processName);
    }
    else if (processName.lastIndexOf("renderer") == 0) {
        createRenderer(processName);
    }
    else if (processName.lastIndexOf("node") == 0) {
        createNodeProcess(processName);
    }
};

createNodeProcess = function(processName) {
    // console.debug("node: '%s'", processName);
    doSubscribe(processName);
};

createRenderer = function(processName) {
    // console.debug("renderer: '%s'", processName);
    doSubscribe(processName);
};

onCellClicked = function(emitter, receiver) {
    // console.debug("Cell clicked: %s/%s", emitter, receiver);
    let cellId = "IPC_TEST_" + emitter + "_" + receiver;
    let sourceCell = document.getElementById(cellId);
    let backgroundColor = document.createAttribute("style");
    backgroundColor.value = "color:white;background-color:red";
    sourceCell.setAttributeNode(backgroundColor);
    let date = new Date();
    sourceCell.innerHTML = date.getTime();
    // topic is the receiver, message is the emitter
    setTimeout(function() {
        ipcBus.send(receiver, emitter);
    }, 5);
};

doSubscribe = function(topic) {
    // console.debug("Subscribed to '%s'", topic);
    ipcBus.subscribe(topic, onIPCMessageReceived);
};

onIPCMessageReceived = function(topic, message) {
    // console.debug("Message received on '%s': '%s'", topic, message);
    let cellId = "IPC_TEST_" + message + "_" + topic;
    let targetCell = document.getElementById(cellId);
    let backgroundColor = document.createAttribute("style");
    backgroundColor.value = "color:white;background-color:green";
    targetCell.setAttributeNode(backgroundColor);
    let date = new Date();
    targetCell.innerHTML = date.getTime() - targetCell.innerHTML;
};