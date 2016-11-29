var processes = [ "###", "master", "renderer1", "renderer2", "nodeA", "nodeB" ];

initView = function(htmlTable) {
    processes.forEach(function(nameRow) {
        let newRow = document.createElement("tr");
        if (nameRow == processes[0]) {
            let classFirstRow = document.createAttribute("class");
            classFirstRow.value = "FirstRow";
            newRow.setAttributeNode(classFirstRow);
        }
        else {
            doSubscribe(nameRow);
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

onCellClicked = function(emitter, receiver) {
    // to be replaced with calls to ipcBus
    console.info("Cell clicked: %s/%s", emitter, receiver);
    ipcBus.send(receiver, emitter);
};

doSubscribe = function(topic) {
    ipcBus.subscribe(topic, onIPCMessageReceived);
    // console.log("Subscribed to '%s'", topic);
};

onIPCMessageReceived = function(topic, message) {
    // console.info("Message received on '%s': '%s'", topic, message);
    let cellId = "IPC_TEST_" + message + "_" + topic;
    let targetCell = document.getElementById(cellId);
    targetCell.innerHTML = "Success"; 
};