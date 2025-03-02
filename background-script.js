/**
 * Code written by Jeanmarco Allain (https://github.com/OctavoPE)
 */

/**
 * Begins download sequence for given object url and filename.
 * @param {String} url url to the blob object
 * @param {String} filename name of the file to download
 */
function beginDownload(url,filename){
    function onStartedDownload(id) {
        console.log(`Started downloading: ${id}`);
    }     
    function onFailed(error) {
        console.log(`Download failed: ${error}`);
    }
    console.log("Downloading...");
    let downloading = browser.downloads.download({
        url : url,
        filename : filename,
        conflictAction : 'uniquify'
    });
    downloading.then(onStartedDownload, onFailed);

    browser.downloads.onChanged.addListener((d) => {
        if(d.state && d.state.current == "complete"){
            console.log("Download complete.");
        }
    });

}

/**
 * Downloands conversation as HTML file.
 */
function downloadhtml(content){
    let arr = [];
    const style = `<style>
    html{font-family: Söhne,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif,Helvetica Neue,Arial,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;}
    body{background-color: #343541;}
    div{color: #ececf1;
    margin-top: 15px;
    margin-bottom: 15px;
    padding: 20px;
    padding-left: 5em;
    padding-right: 5em;
    }
    .prompt{background-color:#343541;}
    .response{background-color:#444654;}
    </style>`;
    const header = '<!DOCTYPE html><html lang=\'en\'><head>' + style +'<title>Conversation</title></head><body>';
    arr.push(header);
    content.forEach(element => { 
        if(element["role"] === "assistant"){
            let line = `<div class="response">${element["text"]}</div>`;
            arr.push(line);
        }
        else{
            let line = `<div class="prompt">${element["text"]}</div>`;
            arr.push(line);
        }
    });

    const footer = '</body></html>';
    arr.push(footer);
    
    const blob = new Blob(arr, { type: "text/html" }); 
    beginDownload(URL.createObjectURL(blob),'conversation.html');
    URL.revokeObjectURL(blob);
}

/**
 * Downloads conversation as text file.
 */
function downloadtext(content){   
    const jsonString = JSON.stringify(content, null, 2);

    const blob = new Blob([jsonString], { type: "application/json" }); 

    beginDownload(URL.createObjectURL(blob),'conversation.json');
}

/**
 * Only background scripts have access to the entire WebExtension API, which is used to download files.
 * Therefore, we can establish a listener that runs from our content script to our background script.
 */
browser.runtime.onMessage.addListener((message) => {
    if (message.command === "download") {
        if (message.type === "html") {
            downloadhtml(message.content);
        }
        else {
            downloadtext(message.content);
        }     
    }
});