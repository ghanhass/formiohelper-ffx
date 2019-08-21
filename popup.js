function alertMsg(alertsSpan, msg){
    alertsSpan.textContent = msg;
    window.setTimeout(function(){
        alertsSpan.textContent='';
    }, 2000);
}

function restoreUI(popupUIState){
    browser.tabs.query({active: true, currentWindow: true}, function(arrTabs){
        let activeTab = arrTabs[0];
        browser.tabs.sendMessage(activeTab.id, JSON.stringify({message: 'extRestoreUIMessage'}));
        console.log('extRestoreUIMessage sent for tab: ', activeTab.id);
    });
    console.log('inside restoreUI(): popupUIState = ', popupUIState);
    if(popupUIState){
        if(popupUIState.selectedItem){
            let actionsMenuSelect = document.querySelector('#actionsMenuSelect');
            actionsMenuSelect.value = popupUIState.selectedItem;
            document.querySelector(popupUIState.shownActionsMenuItem).classList.add('actionsMenuItemSelected');
            document.querySelector(popupUIState.shownPreElement).textContent = popupUIState.preElementText;
        }
    }
}
function saveUI(){
    let actionsMenuSelect = document.querySelector('#actionsMenuSelect');
    let selectedItem = document.querySelector('.actionsMenuItem.actionsMenuItemSelected');
    if (actionsMenuSelect.value){
        if(selectedItem){
            selectedItem.classList.remove('actionsMenuItemSelected');
        }
        document.querySelector('.actionsMenuItem[data-actionid="' + actionsMenuSelect.value + '"]').classList.add('actionsMenuItemSelected');
        let shownActionsMenuItem = '.actionsMenuItem[data-actionid="' + actionsMenuSelect.value + '"]';
        let shownPreElement = 'pre[data-actionid="' + actionsMenuSelect.value + '"] ';
        let preElement = document.querySelector(shownPreElement);
        let preElementText = preElement ? preElement.textContent : ""
        browser.tabs.query({active: true, currentWindow: true}).then((arrTabs)=>{
            let activeTab = arrTabs[0];
            let obj = {
                'selectedItem': actionsMenuSelect.value,
                'shownActionsMenuItem': shownActionsMenuItem,
                'shownPreElement': shownPreElement,
                "preElementText": preElementText
            };
            console.log("inside saveUI:   popupUIState = ", JSON.stringify(obj));
            browser.tabs.sendMessage(activeTab.id, JSON.stringify({message: 'extSaveUIMessage', popupUIState: JSON.stringify(obj)}
            )).then((response)=>{/*whatever*/});
            console.log('extSaveUIMessage sent for tab: ', activeTab.id);
            console.log(obj);
        });
    }
}

document.addEventListener('DOMContentLoaded', function(){
    console.log("inside DOMContentLoaded event!");
    document.querySelector("#custom-youtube").addEventListener("click", (event)=>{
        chrome.tabs.query({active: true, currentWindow: true}, function(arrTabs){
            let activeTab = arrTabs[0];
            chrome.tabs.sendMessage(activeTab.id, JSON.stringify({message: 'extCustomYoutubeStyle'}));
            //console.log('init message sent for tab: ', activeTab.id);
        });
    });
    
    var isFormFound = false;
    browser.tabs.query({active: true, currentWindow: true}).then((arrTabs)=>{
        let activeTab = arrTabs[0];
        browser.tabs.sendMessage(activeTab.id, JSON.stringify({message: 'extInitMessage'})).then((response)=>{/*whatever*/});
    });

    //console.log('DOMContentLoaded!');
    var alertsSpan = document.querySelector('#alerts');
    var formioDetectionStatus = document.querySelector('#formioDetectionStatus');
    var actionsMenuSelect = document.querySelector('#actionsMenuSelect');

    var btnGetComponentsObject = document.querySelector('#btnGetComponentsObject');
    var copyComponentsObject = document.querySelector('#copyComponentsObject');
    var componentsObjectTextarea =  document.querySelector("textarea[data-actionid='1']");
    var componentsObjectPre =  document.querySelector("pre[data-actionid='1']");

    var btnGetFormData = document.querySelector('#btnGetFormData');
    var btnCopyFormData = document.querySelector('#btnCopyFormData');
    var formDataTextarea =  document.querySelector("textarea[data-actionid='4']");
    var formDataPre =  document.querySelector("pre[data-actionid='4']");

    var btnExecuteFunction = document.querySelector('#btnExecuteFunction');
    var functionOnTraversePre =  document.querySelector("pre[data-actionid='3']");

    var btnExecuteFormioFunction = document.querySelector('#btnExecuteFormioFunction');
    var btnRestoreOriginalForm = document.querySelector('#btnRestoreOriginalForm');
    var btnEmptyForm = document.querySelector('#btnEmptyForm');

    var setComponentsObjectBtn = document.querySelector('#setComponentsObjectBtn');
    var setComponentsObjectPre =  document.querySelector("pre[data-actionid='1']");

    var setFormDataBtn = document.querySelector('#setFormDataBtn');
    var setFormDataPre =  document.querySelector("pre[data-actionid='4']");



    //START listening for extension events
    browser.runtime.onMessage.addListener(function(request){
        let msgObj = JSON.parse(request);
        if (msgObj.message == 'extSaveUIResponseMessage'){//extSaveUIResponseMessage extension message from contentscript
            console.log('extSaveUIResponseMessage: ', msgObj);
        }

        else  if (msgObj.message == 'extInitResponseMessage'){//extInitResponseMessage extension message from contentscript
            console.log('extInitResponseMessage: ', msgObj);
            if(msgObj.status == 'success'){
                isFormFound = true;
                formioDetectionStatus.classList.remove('formioNotFound');
                formioDetectionStatus.classList.add('formioFound');
                actionsMenuSelect.disabled = false;
                actionsMenuSelect.querySelector("option[value='']").textContent = '--Select an action--';
                let data = JSON.parse(msgObj.data);
                if(data){
                    console.log("msgObj.data = ", data);
                    restoreUI(data);
                }
                
            }
            else if(msgObj.status == 'fail' && !isFormFound){//nothing? lolz
                formioDetectionStatus.classList.add('formioNotFound');
                formioDetectionStatus.classList.remove('formioFound');
                actionsMenuSelect.value = ''
                actionsMenuSelect.disabled = true;
                actionsMenuSelect.querySelector("option[value='']").textContent = 'No formio found';
            }
        }  
        else if (msgObj.message == 'extGetComponentsObjectResponseMessage'){//extGetComponentsObjectResponseMessage extension message from contentscript
            if(msgObj.status == 'success'){
                if(msgObj.data){
                    componentsObjectPre.textContent = msgObj.data;
                    saveUI();
                }
            }
            else if(msgObj.status == 'fail'){//nothing? lolz
            }
        }  
        else if (msgObj.message == 'extGetFormDataResponseMessage'){//extGetFormDataResponseMessage extension message from contentscript
            if(msgObj.status == 'success'){
                if(msgObj.data){
                    document.querySelector("pre[contenteditable='true'][data-actionid='4']").textContent = msgObj.data;
                    saveUI();
                }
            }
            else if(msgObj.status == 'fail'){//nothing? lolz
            }
        } 
        else if (msgObj.message == 'extEmptyFormResponseMessage'){//extEmptyFormResponseMessage extension message from contentscript
            if(msgObj.status == 'success'){
                if(msgObj.data){
                    alertMsg(alertsSpan, 'Form emptied!');
                }
            }
            else if(msgObj.status == 'fail'){//nothing? lolz
            }
        }
        else if (msgObj.message == 'extRestoreOriginalFormResponseMessage'){//extRestoreOriginalFormResponseMessage extension message from contentscript
            if(msgObj.status == 'success'){
                if(msgObj.data){
                    alertMsg(alertsSpan, 'Form restored!');
                }
            }
            else if(msgObj.status == 'fail'){//nothing? lolz
            }
        }
    });
    //END listening for extension events

    //START listening for DOM events
    Array.from(document.querySelectorAll("pre[data-actionid]")).forEach((element)=>{
        element.addEventListener("keyup", saveUI);
    });
    actionsMenuSelect.addEventListener('change', function(event){
        let selectedItem = document.querySelector('.actionsMenuItem.actionsMenuItemSelected');
        if (this.value){
            if(selectedItem){
                selectedItem.classList.remove('actionsMenuItemSelected');
            }
            document.querySelector('.actionsMenuItem[data-actionid="' + this.value + '"]').classList.add('actionsMenuItemSelected');
            saveUI();
        }
    });
    ////
    btnGetComponentsObject.addEventListener('click', function(event){// get form components object
        console.log("get form components object");
        browser.tabs.query({active: true, currentWindow: true}).then((arrTabs)=>{
            browser.tabs.sendMessage(arrTabs[0].id, JSON.stringify({message: 'extGetComponentsObjectMessage'})).then((response)=>{/*whatever*/});;
        });
    });
    ////
    copyComponentsObject.addEventListener('click', function(event){// copy form components object
        componentsObjectTextarea.value = componentsObjectPre.textContent;
        componentsObjectTextarea.select();
        if(document.execCommand('copy', null)){
            alertMsg(alertsSpan, 'Object copied!');
        }
    });
    ////
    btnGetFormData.addEventListener('click', function(event){// get form data
        browser.tabs.query({active: true, currentWindow: true}).then((arrTabs)=>{
            browser.tabs.sendMessage(arrTabs[0].id, JSON.stringify({message: 'extGetFormDataMessage'})).then((response)=>{/*whatever*/});
        });
    });
    ////
    btnCopyFormData.addEventListener('click', function(event){// copy form data object
        formDataTextarea.value = formDataPre.textContent;
        formDataTextarea.select();
        if(document.execCommand('copy', null)){
            alertMsg(alertsSpan, 'Object copied!');
        }

    });
    ////
    btnEmptyForm.addEventListener('click', function(event){// empty form data
        browser.tabs.query({active: true, currentWindow: true}, function(arrTabs){
            browser.tabs.sendMessage(arrTabs[0].id, JSON.stringify({
                message: 'extEmptyFormMessage'
            })).then((response)=>{/*whatever*/});
        });
    });
    ////
    btnRestoreOriginalForm.addEventListener('click', function(event){// restore original formio function
        browser.tabs.query({active: true, currentWindow: true}).then((arrTabs)=>{
            browser.tabs.sendMessage(arrTabs[0].id, JSON.stringify({
                message: 'extRestoreOriginalFormMessage'
            })).then((response)=>{/*whatever*/});
        });
    });
    ////
    btnExecuteFunction.addEventListener('click', function(event){// run a function on formio components on global traverse
        browser.tabs.query({active: true, currentWindow: true}).then((arrTabs)=>{
            browser.tabs.sendMessage(arrTabs[0].id, JSON.stringify({
                message: 'extRunFunctionOnTraverseMessage', 
                data: functionOnTraversePre.textContent
            })).then((response)=>{/*whatever*/});
        });
    });
    ////
    setComponentsObjectBtn.addEventListener('click', function(event){// set formio's components array
        browser.tabs.query({active: true, currentWindow: true}).then((arrTabs)=>{
            browser.tabs.sendMessage(arrTabs[0].id, JSON.stringify({
                message: 'extSetComponentsObjectMessage', 
                data: setComponentsObjectPre.textContent
            })).then((response)=>{/*whatever*/});
        });
    });
    ////
    setFormDataBtn.addEventListener('click', function(event){// set formio's form data object
        browser.tabs.query({active: true, currentWindow: true}).then((arrTabs)=>{
            browser.tabs.sendMessage(arrTabs[0].id, JSON.stringify({
                message: 'extSetFormDataObjectMessage', 
                data: setFormDataPre.textContent
            })).then((response)=>{/*whatever*/});
        });
    });
    
    //END listening for DOM events
});
