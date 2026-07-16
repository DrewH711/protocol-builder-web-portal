async function send(mcpMethod, params, requestID=null, mcpSessionID=null){
    const access_token = sessionStorage.getItem('access_token');

    const body = {jsonrpc : "2.0", method: mcpMethod, "params": params};
    
    const mcpHeaders = new Headers();
    mcpHeaders.append("Content-Type", "application/json");
    mcpHeaders.append("Accept","application/json, text/event-stream");
    mcpHeaders.append("Authorization", `Bearer ${access_token}`);

    if(requestID!==null) body.id = requestID;
    if(mcpSessionID!==null) mcpHeaders.append('mcp-session-id',mcpSessionID);
    
    try{
        const res = await fetch(url, {
            method: "POST",
            headers: mcpHeaders,
            body: JSON.stringify(body)
        });

    // Notifications (no id) get 202 with no meaningful body — nothing to await.
    if (requestID === null) return { res, result: null };

    const contentType = res.headers.get("content-type") || "";

    // Plain JSON: the whole result is the body.
    if (contentType.includes("application/json")) {
        return { res, result: await res.json() };
    }

    if (contentType.includes("text/event-stream")){
        const text = await res.text();

        const lines = text.split(/\r?\n/);

        for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            
            const msg = JSON.parse(line.slice(5).trim());
            
            if (msg.id === requestID) {
                return { res, result: msg };
            }
        }
    }

    return {res, result: null};

    } catch (err) {
        setTimeout( () => {
        window.hideSpinner();
        showMessage("Error: could not reach the server", "red");
        return {res: null, result: null};
        }, 1000);
    }
}

const url = "http://localhost:8000/mcp";

async function deployProtocol(protocol, fileContents, commitMessage, releaseNotes, isLatest){
    let id = 1;
    const loadingTextElement = document.getElementById("loading-text");

    loadingTextElement.textContent = "Connecting to the server...";

    //initialize
    const init = await send(
        "initialize", {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "my-client", version: "1.0.0" }}, 
        id
    );

    if(!(init.res.ok)) {
        window.hideSpinner();
        showMessage("Error: Could not connect to the server", "red");
        return;
    }
    showMessage("Connected to the server", "green");

    loadingTextElement.textContent = "Connected to the server";

    let mcpSessionID = init.res.headers.get('mcp-session-id');

    //initialized notification
    const initialized = await send("notifications/initialized", {}, null, mcpSessionID);

    if (!initialized.res.ok) {
        window.hideSpinner();
        showMessage("Error: could not initialize", "red");
        return;
    }
    showMessage("Initialized", "green");

    loadingTextElement.textContent = "Retrieving protocol...";

    id++;
    //ensure protocol_existence
    const get_protocol = await send(
        "tools/call", {
            "name":"get_protocol",
            "arguments": {
                "args":{
                    "protocol_name":protocol
                }
            }
        }, 
        id, 
        mcpSessionID
    );

    if (get_protocol.result["isError"]){
        window.hideSpinner();
        showMessage("Failed to retrieve protocol on server", "red");
        return;
    }
    showMessage("Retrieved protocol...", "green");
    loadingTextElement.textContent = "Uploading files...";

    //replace CSV files
    for (const [filename, contents] of Object.entries(fileContents)) {
        id++;
        let get_protocol = await send(
            "tools/call", {
                "name":"swap_csv",
                "arguments": {
                    "args":{
                        "protocol_name":protocol,
                        "file_name":filename,
                        "content":contents
                    }
                }
            },
            id,
            mcpSessionID
        );

        if (get_protocol.result["isError"]){
            window.hideSpinner();
            showMessage(`Failed to read file ${filename}. Please try again`, "red");
            return;
        }
        
    }

    showMessage("Files read succesfully", "green");
    id++;
    loadingTextElement.textContent = "Building protocol...";
    //build/save/release
    const buildSaveRelease = await send(
        "tools/call", {
            "name":"build_save_and_release_protocol",
            "arguments": {
                "args": {
                    "protocol_name": protocol,
                    "release_message" : commitMessage,
                    "release_notes" : releaseNotes,
                    "isLatest" : isLatest
                },
            }
        },
        id,
        mcpSessionID
    );

    if (buildSaveRelease.result["isError"]){
        window.hideSpinner();
        showMessage(`Release failed: ${buildSaveRelease.result}`);
    }

    showMessage("Succesfully deployed protocol!");
    loadingTextElement.textContent = "Succesfully deployed protocol!";
    
    setTimeout( () => {
        window.hideSpinner();
    }, 1000);

}

window.deployProtocol = deployProtocol;