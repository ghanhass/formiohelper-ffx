/**
 * Traverse Formio's form components and apply on each one a set of user-defined functions
 * @param formComponents - Formio components array;
 * @param callbacksArray - Array of calback functions to execute consecutively
 * @param _COMPONENT - Reference angular component for this call
 */
function traverseFormioComponents(formComponents, callbacksArray){
  
    formComponents.forEach( (element, index)=>{
      
        //START traversing
        for(let i = (callbacksArray.length -1); i>=0; i--){ //execute provided callback functions according to their priorities
          callbacksArray[i](element);
        }
        //element['transversed'] = true;
        if(element.components){
            this.traverseFormioComponents(element.components, callbacksArray);
        }
        else if(element.columns){
            this.traverseFormioComponents(element.columns, callbacksArray);
        }
        else if(element.rows && typeof(element.rows) == "object" && typeof(element.rows).length !== undefined && typeof(element.rows).length !== null) {
            console.log(element.rows);
            element.rows.forEach((component) => {this.traverseFormioComponents(component, callbacksArray)});
        }
        //END traversing
      
    } );
}

/**
 * A Recursive Function to search for the submission data of any formio component by key or scan traverse the form data object to apply specific data.
 * @param key component key
 * @param formDataContentObject form data object used in every recursion phase
 * @param key a component key to search against
 * @param val a value to apply to every component satisfying the search condition
 * @param obj variable used to save the found submission data in a 'findMe' property
 */
function searchFormData( formDataContentObject, mode = 1, val = undefined, key = undefined, obj = {findMe: undefined} ){
    /*console.log("key = ", key);
    console.log("formDataContentObject = ", formDataContentObject);
    console.log("formDataContentValuesArray = ", formDataContentValuesArray);
    console.log("obj = ", obj);
    console.log("--------------------------------");*/
     if (mode == 1){
        if(formDataContentObject[key] !== undefined && formDataContentObject[key] !== null){
            obj.findMe = formDataContentObject[key];

        }
        else{
            if(typeof(formDataContentObject) == 'object' && formDataContentObject.length === undefined){//object
                let formDataArrayValues = Object.values(formDataContentObject);
                formDataArrayValues.forEach((element, index)=>{
                    searchFormData( element, mode, val, key, obj );
                });
            }
            else if(typeof(formDataContentObject) == 'object' && formDataContentObject.length !== undefined){//Array
                formDataContentObject.forEach((element, index)=>{
                    searchFormData( element, mode, val, key, obj );
                });
            }
            else{

            }

        }
    }
    else if (mode == 2){
        let formDataArrayValues = Object.values(formDataContentObject);
        let formDataArrayKeys = Object.keys(formDataContentObject);
        formDataArrayValues.forEach((element, index)=>{
            if(element !== null && element !== undefined){
                if(typeof(element) == 'object' && element.length === undefined){//object
                    searchFormData( element, mode, val, key, obj );
                }
                else if(typeof(element) == 'object' && element.length !== undefined){//Array
                    element.forEach((element, index)=>{
                        searchFormData( element, mode, val, key, obj );
                    });
                }
                else{
                    if(typeof(formDataContentObject[formDataArrayKeys[index]]) == "boolean"){
                        formDataContentObject[formDataArrayKeys[index]] = false;
                    }
                    else{
                        formDataContentObject[formDataArrayKeys[index]] = val;
                    }
                }
            }
        });
    }
}


var webForm;
var formioApi;
var formComponentsOriginal;
var formDataOriginal;

formioApi = window.Formio;
console.log('formioApi.forms = ', formioApi.forms);

document.addEventListener("domCustomYoutubeStyle", function(event){ //domCustomYoutubeStyle event's handler
console.log("AA");
if(window.youtubeStyleSheet === undefined){
    console.log("BB");
    window.youtubeStyleSheet = document.createElement("style");
    document.head.appendChild(window.youtubeStyleSheet);
    let styleSheet = youtubeStyleSheet.sheet;
    styleSheet.insertRule("img, iframe{opacity:0.05 !important;}", styleSheet.cssRules.length);
    styleSheet.insertRule("#logo{visibility:hidden !important;}", styleSheet.cssRules.length);
}
});


document.addEventListener("domInitEvent", function(event){ //domInitEvent event's handler
    formioApi = window.Formio;
    console.log("inside domInitEvent event: ", event);
    if(formioApi){  //formio API is set ?
        console.log("A");
        webForm = webForm? webForm : formioApi.forms[Object.keys(formioApi.forms)[0]];
        if(webForm){ //formio's webfom is set ??
        console.log("B");
            if(!formComponentsOriginal){
                //save original form components object
                formComponentsOriginal = JSON.stringify({components: webForm.component.components});
            }
            if(!formDataOriginal){
                //save original form data object
                formDataOriginal = JSON.stringify({data: webForm.data});
            }
    
        }
        window.isFormioExistant = true;
        document.dispatchEvent( new CustomEvent('domInitResponseEvent',{
            detail:{
                status : 'success',
            }
        })
        );
    }
    else{
        console.log("C");
        document.dispatchEvent( new CustomEvent('domInitResponseEvent',{
            detail:{
                status : 'fail'
            }
        })
        );
    }
});

//
document.addEventListener("domGetComponentsObjectEvent", function(event){ //domGetComponentsObjectEvent event's handler
    if(formioApi){
        webForm = formioApi.forms[Object.keys(formioApi.forms)[0]];
        if(webForm){
            let componentsObj = JSON.stringify({components: webForm.component.components}, undefined, 4);
            document.dispatchEvent( new CustomEvent('domGetComponentsObjectResponseEvent',{
                detail:{
                    status : 'success',
                    data: componentsObj
                }
            })
            );
        }
    }
    else{
        document.dispatchEvent( new CustomEvent('domGetComponentsObjectResponseEvent',{
            detail:{
                status : 'fail'
            }
        })
        );
    }
});
//
document.addEventListener("domGetFormDataEvent", function(event){ //domGetFormDataEvent event's handler
    if(formioApi){
        webForm = formioApi.forms[Object.keys(formioApi.forms)[0]];
        if(webForm){
            let formData = JSON.stringify(webForm.submission.data, undefined, 4);
            document.dispatchEvent( new CustomEvent('domGetFormDataResponseEvent',{
                detail:{
                    status : 'success',
                    data: formData
                }
            })
            );
        }
    }
    else{
        document.dispatchEvent( new CustomEvent('domGetFormDataResponseEvent',{
            detail:{
                status : 'fail'
            }
        })
        );
    }
});    
//
document.addEventListener("domRunFunctionOnTraverseEvent", function(event){ //domRunFunctionOnTraverseEvent event's handler
    if(formioApi){
        webForm = formioApi.forms[Object.keys(formioApi.forms)[0]];
        if(webForm){
            console.log(webForm, 'inside domRunFunctionOnTraverseEvent event!');
            console.log('inside domRunFunctionOnTraverseEvent event info: ', event );
            let componentsArray = webForm.component.components;
            let callbacksArray = []
            let testFunction = new Function('component',
            'var data = '+JSON.stringify(webForm.data)+ ";" + event.detail);
            callbacksArray.push(testFunction);
            console.log('webForm.data = ', webForm.data);
            traverseFormioComponents(componentsArray, callbacksArray);
            console.log('componentsArray = ', componentsArray);
            webForm.setForm({components: componentsArray});
        }
    }
    else{
        document.dispatchEvent( new CustomEvent('domGetFormDataResponseEvent',{
            detail:{
                status : 'fail'
            }
        })
        );
    }
});    
//
document.addEventListener("domEmptyFormEvent", function(event){ //domEmptyFormEvent event's handler
    if(formioApi){
        if(webForm){
            let data = {};
            Object.keys(webForm.data).forEach((key)=>{data[key] = webForm.data[key]});
            searchFormData(data, 2, ' ');
            webForm.setSubmission({data: data}).then(()=>{});
            document.dispatchEvent( new CustomEvent('domEmptyFormResponseEvent',{
                detail:{
                    status : 'success'
                }
            })
            );
        }
        else{
            document.dispatchEvent( new CustomEvent('domEmptyFormResponseEvent',{
                detail:{
                    status : 'fail'
                }
            })
            );
        }
    }
    else{
        document.dispatchEvent( new CustomEvent('domEmptyFormResponseEvent',{
            detail:{
                status : 'fail'
            }
        })
        );
    }
}); 
//
document.addEventListener("domRestoreOriginalFormEvent", function(event){ //domRestoreOriginalFormEvent event's handler
    if(formioApi){
        if(webForm){
            if(formComponentsOriginal){
                webForm.setForm(JSON.parse(formComponentsOriginal));
            }
            if(formDataOriginal){
                webForm.setSubmission(JSON.parse(formDataOriginal));
            }
            document.dispatchEvent( new CustomEvent('domRestoreOriginalFormResponseEvent',{
                detail:{
                    status : 'success'
                }
            })
            );
        }
        else{
            document.dispatchEvent( new CustomEvent('domRestoreOriginalFormResponseEvent',{
                detail:{
                    status : 'fail'
                }
            })
            );
        }
    }
    else{
        document.dispatchEvent( new CustomEvent('domRestoreOriginalFormResponseEvent',{
            detail:{
                status : 'fail'
            }
        })
        );
    }
}); 
//
document.addEventListener("domSetComponentsObjectEvent", function(event){ //domSetComponentsObjectEvent event's handler
    console.log('domSetComponentsObjectEvent\'s event.detail = ',event.detail);
    if(event.detail){
        if(formioApi){
            if(webForm){
                webForm.setForm(JSON.parse(event.detail));
                document.dispatchEvent( new CustomEvent('domSetComponentsObjectResponseEvent',{
                    detail:{
                        status : 'success'
                    }
                })
                );
            }
            else{
                document.dispatchEvent( new CustomEvent('domSetComponentsObjectResponseEvent',{
                    detail:{
                        status : 'fail'
                    }
                })
                );
            }
        }
        else{
            document.dispatchEvent( new CustomEvent('domSetComponentsObjectResponseEvent',{
                detail:{
                    status : 'fail'
                }
            })
            );
        }
    }
});
//
document.addEventListener("domSetFormDataObjectEvent", function(event){ //domSetFormDataObjectEvent event's handler
    console.log('domSetFormDataObjectEvent\'s event.detail = ',event.detail);
    if(event.detail){
        if(formioApi){
            if(webForm){
                webForm.setSubmission({data: JSON.parse(event.detail)});
                document.dispatchEvent( new CustomEvent('domSetFormDataObjectResponseEvent',{
                    detail:{
                        status : 'success'
                    }
                })
                );
                ///console.log("formioApi", formioApi);
                ///console.log("webForm", webForm);
                ///console.log("event.detail.data", event.detail.data);
            }
            else{
                document.dispatchEvent( new CustomEvent('domSetFormDataObjectResponseEvent',{
                    detail:{
                        status : 'fail'
                    }
                })
                );
                //console.log("B: domSetFormDataObjectResponseEvent");
            }
        }
        else{
            document.dispatchEvent( new CustomEvent('domSetFormDataObjectResponseEvent',{
                detail:{
                    status : 'fail'
                }
            })
            );
            //console.log("C: domSetFormDataObjectResponseEvent");
        }
    }
});