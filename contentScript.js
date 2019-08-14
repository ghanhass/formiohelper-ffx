var popupUIState;
//if (!window.isCustomScriptLoaded){//prevent multiple 
    var s = document.createElement('script');
    s.src = browser.runtime.getURL('script.js');
    (document.head || document.documentElement).appendChild(s);
    s.onload = function(){
        //window.isCustomScriptLoaded = true;
        console.log('script.js loaded and executed !');
        window.isScriptLoaded = true;
    };
    
    browser.runtime.onMessage.addListener(function(request){//extension-specific events listeners
        let msgObj = JSON.parse(request);
        console.log("msgObj: ", msgObj)
        if (window.isScriptLoaded)//prevent multiple 
        {
            switch(msgObj.message){
                case 'extCustomYoutubeStyle': document.dispatchEvent(new Event("domCustomYoutubeStyle"));
                break;
                
                case 'extSaveUIMessage': 
                popupUIState = msgObj.popupUIState;//stringified already
                browser.runtime.sendMessage(JSON.stringify({ message: 'extSaveUIResponseMessage', status: 'success', data: popupUIState }));
                //savePopupUI(msgObj.data) //trigger domSaveUIEvent event in the shared 
                window.localStorage.setItem('popupUIState', msgObj.popupUIState)
                break;

                //case 'extRestoreUIMessage': restorePopupUI() //trigger domSaveUIEvent event in the shared DOM
                //break;

                case 'extInitMessage': document.dispatchEvent(new Event ('domInitEvent')); //trigger domInitEvent event in the shared DOM
                console.log('init event sent to shared DOM');
                break;

                case 'extGetComponentsObjectMessage': document.dispatchEvent(new Event ('domGetComponentsObjectEvent')); //trigger domGetComponentsObjectEvent event in the shared DOM
                //console.log('extGetComponentsObjectMessage extension event detected!');
                break;
                case 'extGetFormDataMessage': document.dispatchEvent(new Event ('domGetFormDataEvent')); //trigger domGetFormDataEvent event in the shared DOM
                break;

                case 'extRunFunctionOnTraverseMessage': document.dispatchEvent(new CustomEvent ('domRunFunctionOnTraverseEvent', { //trigger domRunFunctionOnTraverseEvent event in the shared DOM
                    detail:msgObj.data
                }));
                break;

                case 'extEmptyFormMessage': document.dispatchEvent(new Event('domEmptyFormEvent')); //trigger domEmptyFormEvent event in the shared DOM
                break;
                case 'extRestoreOriginalFormMessage': document.dispatchEvent(new Event('domRestoreOriginalFormEvent')); //trigger domRestoreOriginalFormEvent event in the shared DOM
                break;

                case 'extSetComponentsObjectMessage':
                window.localStorage.usefulData = msgObj.data;
                document.dispatchEvent(new CustomEvent('domSetComponentsObjectEvent', { //trigger domSetComponentsObjectEvent event in the shared DOM
                    detail:msgObj.data
                }));
                break;

                case 'extSetFormDataObjectMessage': document.dispatchEvent(new CustomEvent('domSetFormDataObjectEvent', { //trigger domSetFormDataObjectEvent event in the shared DOM
                    detail:msgObj.data
                }));
                break;
            }
        }
    });
    ////////////
    document.addEventListener('domInitResponseEvent', function(event){
        //console.log("domInitResponseEvent event: ", event);
        if(event.detail.status == 'success'){
            isFormioExistant = true;
            browser.runtime.sendMessage(JSON.stringify({message: 'extInitResponseMessage', status: 'success', data: popupUIState}));
        }
        else if (event.detail.status == 'fail'){
            isFormioExistant = false;
            browser.runtime.sendMessage(JSON.stringify({message: 'extInitResponseMessage', status: 'fail'}));
        }
    });
    document.addEventListener('domGetComponentsObjectResponseEvent', function(event){
        if(event.detail.status == 'success'){
            //console.log('event.detail.data = ', event.detail.data);
            browser.runtime.sendMessage(JSON.stringify({message: 'extGetComponentsObjectResponseMessage', status: 'success', data: event.detail.data}));
        }
        else if (event.detail.status == 'fail'){
            browser.runtime.sendMessage(JSON.stringify({message: 'extGetComponentsObjectResponseMessage', status: 'fail'}));
        }
    });
    document.addEventListener('domGetFormDataResponseEvent', function(event){
        if(event.detail.status == 'success'){
            //console.log('event.detail.data = ', event.detail.data);
            browser.runtime.sendMessage(JSON.stringify({message: 'extGetFormDataResponseMessage', status: 'success', data: event.detail.data}));
        }
        else if (event.detail.status == 'fail'){
            browser.runtime.sendMessage(JSON.stringify({message: 'extGetFormDataResponseMessage', status: 'fail'}));
        }
    });
    document.addEventListener('domEmptyFormResponseEvent', function(event){
        if(event.detail.status == 'success'){
            //console.log('event.detail.data = ', event.detail.data);
            browser.runtime.sendMessage(JSON.stringify({message: 'extEmptyFormResponseMessage', status: 'success'}));
        }
        else if (event.detail.status == 'fail'){
            browser.runtime.sendMessage(JSON.stringify({message: 'extEmptyFormResponseMessage', status: 'fail'}));
        }
    });
    document.addEventListener('domRestoreOriginalFormResponseEvent', function(event){
        if(event.detail.status == 'success'){
            //console.log('event.detail.data = ', event.detail.data);
            browser.runtime.sendMessage(JSON.stringify({message: 'extRestoreOriginalFormResponseMessage', status: 'success'}));
        }
        else if (event.detail.status == 'fail'){
            browser.runtime.sendMessage(JSON.stringify({message: 'extRestoreOriginalFormResponseMessage', status: 'fail'}));
        }
    });
    document.addEventListener('domSaveUIResponseEvent', function(event){
        if(event.detail.status == 'success'){
            //console.log('event.detail.data = ', event.detail.data);
            browser.runtime.sendMessage(JSON.stringify({message: 'extSaveUIResponseMessage', status: 'success', data: JSON.stringify(event.detail.popupUIState)}));
        }
        else if (event.detail.status == 'fail'){
            browser.runtime.sendMessage(JSON.stringify({message: 'extSaveUIResponseMessage', status: 'fail'}));
        }
    });
    
//}