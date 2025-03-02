/**
 * Code written by Jeanmarco Allain (https://github.com/OctavoPE)
 */

/**
 * Global shield, to prevent the script from running more than once.
 */
(function () {
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;

    /**
     * Parses HTML and returns the conversation as an array of strings.
     * @returns the conversation as an array of strings.
     */
    function GetConversation(){

        /**
         * Parses div of provided XPATH and returns the text content.
         * @param {string} xpath XPATH of the div to parse.
         * @returns text content of the div.
         */
        function parseDiv(xpath){
            let text = "";
            const result = document.evaluate(xpath, document.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            if (result.singleNodeValue) {
                const targetElement = result.singleNodeValue;
                text = targetElement.textContent;
            }
            return text;
        }

        const arr = [];

        try{
            const articles = document.querySelectorAll("article");

            articles.forEach(article => {
                const userPrompt = article.querySelector("div.whitespace-pre-wrap");
                const gptReply = article.querySelector("div.markdown.prose.w-full.break-words.dark\\:prose-invert.dark");

                if (userPrompt) {
                    arr.push({ role: "user", text: userPrompt.innerText });
                } else if (gptReply) {
                    arr.push({ role: "assistant", text: gptReply.innerText });
                }
            });

            console.log(arr);
        }
        catch(e){
            console.log("Conversation ended.");
        }

        return arr;
    }

    /**
     * Checks if the current page is a chat.
     * @returns true if the current page is a chat, false otherwise.
     */
    function isChat(){
        return true;
    }
    /**
     * If the current page is a chat, process the request by sending a message to background-script.js.
     * We must do this because this content script does not have access to the entire WebExtension API.
     * @param {*} req type of save the user has specified.
     */
    function processRequest(req){
        console.log("Running...");
        if(isChat()){
            console.log("Chat detected");
            console.log(`Type: ${req}`);
            const thisConvo = GetConversation();
            if(req == "html"){
                browser.runtime.sendMessage({command: "download", type: "html", content: thisConvo});
            }
            else if(req == "text"){
                browser.runtime.sendMessage({command: "download", type: "text", content: thisConvo});
            }
            browser.runtime.sendMessage({command: "updatePopup", type: req, status: "success"});
        }
        else{
            console.log("Not a chat");
            browser.runtime.sendMessage({command: "updatePopup", type: req, status: "failure"});
        }        
    }
    /**
     * Receives message from popup\page.js and processes it.
     */
    browser.runtime.onMessage.addListener((message) => {
        if (message.command === "save") {
            processRequest(message.type);
        }
    });
})();