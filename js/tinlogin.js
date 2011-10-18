(function($){$.extend($.fn,{validate:function(options){if(!this.length){options&&options.debug&&window.console&&console.warn("nothing selected, can't validate, returning nothing");return;}var validator=$.data(this[0],'validator');if(validator){return validator;}validator=new $.validator(options,this[0]);$.data(this[0],'validator',validator);if(validator.settings.onsubmit){this.find("input, button").filter(".cancel").click(function(){validator.cancelSubmit=true;});if(validator.settings.submitHandler){this.find("input, button").filter(":submit").click(function(){validator.submitButton=this;});}this.submit(function(event){if(validator.settings.debug)event.preventDefault();function handle(){if(validator.settings.submitHandler){if(validator.submitButton){var hidden=$("<input type='hidden'/>").attr("name",validator.submitButton.name).val(validator.submitButton.value).appendTo(validator.currentForm);}validator.settings.submitHandler.call(validator,validator.currentForm);if(validator.submitButton){hidden.remove();}return false;}return true;}if(validator.cancelSubmit){validator.cancelSubmit=false;return handle();}if(validator.form()){if(validator.pendingRequest){validator.formSubmitted=true;return false;}return handle();}else{validator.focusInvalid();return false;}});}return validator;},valid:function(){if($(this[0]).is('form')){return this.validate().form();}else{var valid=true;var validator=$(this[0].form).validate();this.each(function(){valid&=validator.element(this);});return valid;}},removeAttrs:function(attributes){var result={},$element=this;$.each(attributes.split(/\s/),function(index,value){result[value]=$element.attr(value);$element.removeAttr(value);});return result;},rules:function(command,argument){var element=this[0];if(command){var settings=$.data(element.form,'validator').settings;var staticRules=settings.rules;var existingRules=$.validator.staticRules(element);switch(command){case"add":$.extend(existingRules,$.validator.normalizeRule(argument));staticRules[element.name]=existingRules;if(argument.messages)settings.messages[element.name]=$.extend(settings.messages[element.name],argument.messages);break;case"remove":if(!argument){delete staticRules[element.name];return existingRules;}var filtered={};$.each(argument.split(/\s/),function(index,method){filtered[method]=existingRules[method];delete existingRules[method];});return filtered;}}var data=$.validator.normalizeRules($.extend({},$.validator.metadataRules(element),$.validator.classRules(element),$.validator.attributeRules(element),$.validator.staticRules(element)),element);if(data.required){var param=data.required;delete data.required;data=$.extend({required:param},data);}return data;}});$.extend($.expr[":"],{blank:function(a){return!$.trim(a.value);},filled:function(a){return!!$.trim(a.value);},unchecked:function(a){return!a.checked;}});$.validator=function(options,form){this.settings=$.extend({},$.validator.defaults,options);this.currentForm=form;this.tinsearchInit();};$.validator.format=function(source,params){if(arguments.length==1)return function(){var args=$.makeArray(arguments);args.unshift(source);return $.validator.format.apply(this,args);};if(arguments.length>2&&params.constructor!=Array){params=$.makeArray(arguments).slice(1);}if(params.constructor!=Array){params=[params];}$.each(params,function(i,n){source=source.replace(new RegExp("\\{"+i+"\\}","g"),n);});return source;};$.extend($.validator,{defaults:{messages:{},groups:{},rules:{},errorClass:"error",validClass:"valid",errorElement:"label",focusInvalid:true,errorContainer:$([]),errorLabelContainer:$([]),onsubmit:true,ignore:[],ignoreTitle:false,onfocusin:function(element){this.lastActive=element;if(this.settings.focusCleanup&&!this.blockFocusCleanup){this.settings.unhighlight&&this.settings.unhighlight.call(this,element,this.settings.errorClass,this.settings.validClass);this.errorsFor(element).hide();}},onfocusout:function(element){if(!this.checkable(element)&&(element.name in this.submitted||!this.optional(element))){this.element(element);}},onkeyup:function(element){if(element.name in this.submitted||element==this.lastElement){this.element(element);}},onclick:function(element){if(element.name in this.submitted)this.element(element);},highlight:function(element,errorClass,validClass){$(element).addClass(errorClass).removeClass(validClass);},unhighlight:function(element,errorClass,validClass){$(element).removeClass(errorClass).addClass(validClass);}},setDefaults:function(settings){$.extend($.validator.defaults,settings);},messages:{required:"Dit is een verplicht veld.",remote:"Pas dit veld aan.",email:"Vul een geldig e-mailadres in.",url:"Vul een geldige URL in.",date:"Vul een geldige datum in.",dateISO:"Vul een geldige datum in (ISO).",dateDE:"Bitte geben Sie ein g�ltiges Datum ein.",number:"Vul een numerieke waarde in.",numberDE:"Bitte geben Sie eine Nummer ein.",digits:"Gebruik alleen getallen.",creditcard:"Vul een geldig creditcard nummer in.",equalTo:"Vul dezelfde waarde in.",accept:"Vul een waarde in met een geldige extensie.",maxlength:$.validator.format("Vul niet meer dan {0} karakters in."),minlength:$.validator.format("Vul in ieder geval {0} karakters in."),rangelength:$.validator.format("Vul een waarde in tussen {0} en {1} karakters lang."),range:$.validator.format("Vul een waarde in tussen {0} en {1}."),max:$.validator.format("Vul een waarde in minder dan of gelijk aan {0}."),min:$.validator.format("Vul een waarde in meer dan of gelijk aan {0}.")},autoCreateRanges:false,prototype:{tinsearchInit:function(){this.labelContainer=$(this.settings.errorLabelContainer);this.errorContext=this.labelContainer.length&&this.labelContainer||$(this.currentForm);this.containers=$(this.settings.errorContainer).add(this.settings.errorLabelContainer);this.submitted={};this.valueCache={};this.pendingRequest=0;this.pending={};this.invalid={};this.reset();var groups=(this.groups={});$.each(this.settings.groups,function(key,value){$.each(value.split(/\s/),function(index,name){groups[name]=key;});});var rules=this.settings.rules;$.each(rules,function(key,value){rules[key]=$.validator.normalizeRule(value);});function delegate(event){var validator=$.data(this[0].form,"validator");validator.settings["on"+event.type]&&validator.settings["on"+event.type].call(validator,this[0]);}$(this.currentForm).delegate("focusin focusout keyup",":text, :password, :file, select, textarea",delegate).delegate("click",":radio, :checkbox",delegate);if(this.settings.invalidHandler)$(this.currentForm).bind("invalid-form.validate",this.settings.invalidHandler);},form:function(){this.checkForm();$.extend(this.submitted,this.errorMap);this.invalid=$.extend({},this.errorMap);if(!this.valid())$(this.currentForm).triggerHandler("invalid-form",[this]);this.showErrors();return this.valid();},checkForm:function(){this.prepareForm();for(var i=0,elements=(this.currentElements=this.elements());elements[i];i++){this.check(elements[i]);}return this.valid();},element:function(element){element=this.clean(element);this.lastElement=element;this.prepareElement(element);this.currentElements=$(element);var result=this.check(element);if(result){delete this.invalid[element.name];}else{this.invalid[element.name]=true;}if(!this.numberOfInvalids()){this.toHide=this.toHide.add(this.containers);}this.showErrors();return result;},showErrors:function(errors){if(errors){$.extend(this.errorMap,errors);this.errorList=[];for(var name in errors){this.errorList.push({message:errors[name],element:this.findByName(name)[0]});}this.successList=$.grep(this.successList,function(element){return!(element.name in errors);});}this.settings.showErrors?this.settings.showErrors.call(this,this.errorMap,this.errorList):this.defaultShowErrors();},resetForm:function(){if($.fn.resetForm)$(this.currentForm).resetForm();this.submitted={};this.prepareForm();this.hideErrors();this.elements().removeClass(this.settings.errorClass);},numberOfInvalids:function(){return this.objectLength(this.invalid);},objectLength:function(obj){var count=0;for(var i in obj)count++;return count;},hideErrors:function(){this.addWrapper(this.toHide).hide();},valid:function(){return this.size()==0;},size:function(){return this.errorList.length;},focusInvalid:function(){if(this.settings.focusInvalid){try{$(this.findLastActive()||this.errorList.length&&this.errorList[0].element||[]).filter(":visible").focus();}catch(e){}}},findLastActive:function(){var lastActive=this.lastActive;return lastActive&&$.grep(this.errorList,function(n){return n.element.name==lastActive.name;}).length==1&&lastActive;},elements:function(){var validator=this,rulesCache={};return $([]).add(this.currentForm.elements).filter(":input").not(":submit, :reset, :image, [disabled]").not(this.settings.ignore).filter(function(){!this.name&&validator.settings.debug&&window.console&&console.error("%o has no name assigned",this);if(this.name in rulesCache||!validator.objectLength($(this).rules()))return false;rulesCache[this.name]=true;return true;});},clean:function(selector){return $(selector)[0];},errors:function(){return $(this.settings.errorElement+"."+this.settings.errorClass,this.errorContext);},reset:function(){this.successList=[];this.errorList=[];this.errorMap={};this.toShow=$([]);this.toHide=$([]);this.formSubmitted=false;this.currentElements=$([]);},prepareForm:function(){this.reset();this.toHide=this.errors().add(this.containers);},prepareElement:function(element){this.reset();this.toHide=this.errorsFor(element);},check:function(element){element=this.clean(element);if(this.checkable(element)){element=this.findByName(element.name)[0];}var rules=$(element).rules();var dependencyMismatch=false;for(method in rules){var rule={method:method,parameters:rules[method]};try{var result=$.validator.methods[method].call(this,element.value.replace(/\r/g,""),element,rule.parameters);if(result=="dependency-mismatch"){dependencyMismatch=true;continue;}dependencyMismatch=false;if(result=="pending"){this.toHide=this.toHide.not(this.errorsFor(element));return;}if(!result){this.formatAndAdd(element,rule);return false;}}catch(e){this.settings.debug&&window.console&&console.log("exception occured when checking element "+element.id
+", check the '"+rule.method+"' method");throw e;}}if(dependencyMismatch)return;if(this.objectLength(rules))this.successList.push(element);return true;},customMetaMessage:function(element,method){if(!$.metadata)return;var meta=this.settings.meta?$(element).metadata()[this.settings.meta]:$(element).metadata();return meta&&meta.messages&&meta.messages[method];},customMessage:function(name,method){var m=this.settings.messages[name];return m&&(m.constructor==String?m:m[method]);},findDefined:function(){for(var i=0;i<arguments.length;i++){if(arguments[i]!==undefined)return arguments[i];}return undefined;},defaultMessage:function(element,method){return this.findDefined(this.customMessage(element.name,method),this.customMetaMessage(element,method),!this.settings.ignoreTitle&&element.title||undefined,$.validator.messages[method],"<strong>Warning: No message defined for "+element.name+"</strong>");},formatAndAdd:function(element,rule){var message=this.defaultMessage(element,rule.method);if(typeof message=="function")message=message.call(this,rule.parameters,element);this.errorList.push({message:message,element:element});this.errorMap[element.name]=message;this.submitted[element.name]=message;},addWrapper:function(toToggle){if(this.settings.wrapper)toToggle=toToggle.add(toToggle.parent(this.settings.wrapper));return toToggle;},defaultShowErrors:function(){for(var i=0;this.errorList[i];i++){var error=this.errorList[i];this.settings.highlight&&this.settings.highlight.call(this,error.element,this.settings.errorClass,this.settings.validClass);this.showLabel(error.element,error.message);}if(this.errorList.length){this.toShow=this.toShow.add(this.containers);}if(this.settings.success){for(var i=0;this.successList[i];i++){this.showLabel(this.successList[i]);}}if(this.settings.unhighlight){for(var i=0,elements=this.validElements();elements[i];i++){this.settings.unhighlight.call(this,elements[i],this.settings.errorClass,this.settings.validClass);}}this.toHide=this.toHide.not(this.toShow);this.hideErrors();this.addWrapper(this.toShow).show();},validElements:function(){return this.currentElements.not(this.invalidElements());},invalidElements:function(){return $(this.errorList).map(function(){return this.element;});},showLabel:function(element,message){var label=this.errorsFor(element);if(label.length){label.removeClass().addClass(this.settings.errorClass);label.attr("generated")&&label.html(message);}else{label=$("<"+this.settings.errorElement+"/>").attr({"for":this.idOrName(element),generated:true}).addClass(this.settings.errorClass).html(message||"");if(this.settings.wrapper){label=label.hide().show().wrap("<"+this.settings.wrapper+"/>").parent();}if(!this.labelContainer.append(label).length)this.settings.errorPlacement?this.settings.errorPlacement(label,$(element)):label.insertAfter(element);}if(!message&&this.settings.success){label.text("");typeof this.settings.success=="string"?label.addClass(this.settings.success):this.settings.success(label);}this.toShow=this.toShow.add(label);},errorsFor:function(element){return this.errors().filter("[for='"+this.idOrName(element)+"']");},idOrName:function(element){return this.groups[element.name]||(this.checkable(element)?element.name:element.id||element.name);},checkable:function(element){return/radio|checkbox/i.test(element.type);},findByName:function(name){var form=this.currentForm;return $(document.getElementsByName(name)).map(function(index,element){return element.form==form&&element.name==name&&element||null;});},getLength:function(value,element){switch(element.nodeName.toLowerCase()){case'select':return $("option:selected",element).length;case'input':if(this.checkable(element))return this.findByName(element.name).filter(':checked').length;}return value.length;},depend:function(param,element){return this.dependTypes[typeof param]?this.dependTypes[typeof param](param,element):true;},dependTypes:{"boolean":function(param,element){return param;},"string":function(param,element){return!!$(param,element.form).length;},"function":function(param,element){return param(element);}},optional:function(element){return!$.validator.methods.required.call(this,$.trim(element.value),element)&&"dependency-mismatch";},startRequest:function(element){if(!this.pending[element.name]){this.pendingRequest++;this.pending[element.name]=true;}},stopRequest:function(element,valid){this.pendingRequest--;if(this.pendingRequest<0)this.pendingRequest=0;delete this.pending[element.name];if(valid&&this.pendingRequest==0&&this.formSubmitted&&this.form()){$(this.currentForm).submit();}else if(!valid&&this.pendingRequest==0&&this.formSubmitted){$(this.currentForm).triggerHandler("invalid-form",[this]);}},previousValue:function(element){return $.data(element,"previousValue")||$.data(element,"previousValue",previous={old:null,valid:true,message:this.defaultMessage(element,"remote")});}},classRuleSettings:{required:{required:true},email:{email:true},url:{url:true},date:{date:true},dateISO:{dateISO:true},dateDE:{dateDE:true},number:{number:true},numberDE:{numberDE:true},digits:{digits:true},creditcard:{creditcard:true}},addClassRules:function(className,rules){className.constructor==String?this.classRuleSettings[className]=rules:$.extend(this.classRuleSettings,className);},classRules:function(element){var rules={};var classes=$(element).attr('class');classes&&$.each(classes.split(' '),function(){if(this in $.validator.classRuleSettings){$.extend(rules,$.validator.classRuleSettings[this]);}});return rules;},attributeRules:function(element){var rules={};var $element=$(element);for(method in $.validator.methods){var value=$element.attr(method);if(value){rules[method]=value;}}if(rules.maxlength&&/-1|2147483647|524288/.test(rules.maxlength)){delete rules.maxlength;}return rules;},metadataRules:function(element){if(!$.metadata)return{};var meta=$.data(element.form,'validator').settings.meta;return meta?$(element).metadata()[meta]:$(element).metadata();},staticRules:function(element){var rules={};var validator=$.data(element.form,'validator');if(validator.settings.rules){rules=$.validator.normalizeRule(validator.settings.rules[element.name])||{};}return rules;},normalizeRules:function(rules,element){$.each(rules,function(prop,val){if(val===false){delete rules[prop];return;}if(val.param||val.depends){var keepRule=true;switch(typeof val.depends){case"string":keepRule=!!$(val.depends,element.form).length;break;case"function":keepRule=val.depends.call(element,element);break;}if(keepRule){rules[prop]=val.param!==undefined?val.param:true;}else{delete rules[prop];}}});$.each(rules,function(rule,parameter){rules[rule]=$.isFunction(parameter)?parameter(element):parameter;});$.each(['minlength','maxlength','min','max'],function(){if(rules[this]){rules[this]=Number(rules[this]);}});$.each(['rangelength','range'],function(){if(rules[this]){rules[this]=[Number(rules[this][0]),Number(rules[this][1])];}});if($.validator.autoCreateRanges){if(rules.min&&rules.max){rules.range=[rules.min,rules.max];delete rules.min;delete rules.max;}if(rules.minlength&&rules.maxlength){rules.rangelength=[rules.minlength,rules.maxlength];delete rules.minlength;delete rules.maxlength;}}if(rules.messages){delete rules.messages}return rules;},normalizeRule:function(data){if(typeof data=="string"){var transformed={};$.each(data.split(/\s/),function(){transformed[this]=true;});data=transformed;}return data;},addMethod:function(name,method,message){$.validator.methods[name]=method;$.validator.messages[name]=message||$.validator.messages[name];if(method.length<3){$.validator.addClassRules(name,$.validator.normalizeRule(name));}},methods:{required:function(value,element,param){if(!this.depend(param,element))return"dependency-mismatch";switch(element.nodeName.toLowerCase()){case'select':var options=$("option:selected",element);return options.length>0&&(element.type=="select-multiple"||($.browser.msie&&!(options[0].attributes['value'].specified)?options[0].text:options[0].value).length>0);case'input':if(this.checkable(element))return this.getLength(value,element)>0;default:return $.trim(value).length>0;}},remote:function(value,element,param){if(this.optional(element))return"dependency-mismatch";var previous=this.previousValue(element);if(!this.settings.messages[element.name])this.settings.messages[element.name]={};this.settings.messages[element.name].remote=typeof previous.message=="function"?previous.message(value):previous.message;param=typeof param=="string"&&{url:param}||param;if(previous.old!==value){previous.old=value;var validator=this;this.startRequest(element);var data={};data[element.name]=value;$.ajax($.extend(true,{url:param,mode:"abort",port:"validate"+element.name,dataType:"json",data:data,success:function(response){var valid=response===true;if(valid){var submitted=validator.formSubmitted;validator.prepareElement(element);validator.formSubmitted=submitted;validator.successList.push(element);validator.showErrors();}else{var errors={};errors[element.name]=previous.message=response||validator.defaultMessage(element,"remote");validator.showErrors(errors);}previous.valid=valid;validator.stopRequest(element,valid);}},param));return"pending";}else if(this.pending[element.name]){return"pending";}return previous.valid;},minlength:function(value,element,param){return this.optional(element)||this.getLength($.trim(value),element)>=param;},maxlength:function(value,element,param){return this.optional(element)||this.getLength($.trim(value),element)<=param;},rangelength:function(value,element,param){var length=this.getLength($.trim(value),element);return this.optional(element)||(length>=param[0]&&length<=param[1]);},min:function(value,element,param){return this.optional(element)||value>=param;},max:function(value,element,param){return this.optional(element)||value<=param;},range:function(value,element,param){return this.optional(element)||(value>=param[0]&&value<=param[1]);},email:function(value,element){return this.optional(element)||/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);},url:function(value,element){return this.optional(element)||/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);},date:function(value,element){return this.optional(element)||!/Invalid|NaN/.test(new Date(value));},dateISO:function(value,element){return this.optional(element)||/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(value);},dateDE:function(value,element){return this.optional(element)||/^\d\d?\.\d\d?\.\d\d\d?\d?$/.test(value);},number:function(value,element){return this.optional(element)||/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);},numberDE:function(value,element){return this.optional(element)||/^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/.test(value);},digits:function(value,element){return this.optional(element)||/^\d+$/.test(value);},creditcard:function(value,element){if(this.optional(element))return"dependency-mismatch";if(/[^0-9-]+/.test(value))return false;var nCheck=0,nDigit=0,bEven=false;value=value.replace(/\D/g,"");for(n=value.length-1;n>=0;n--){var cDigit=value.charAt(n);var nDigit=parseInt(cDigit,10);if(bEven){if((nDigit*=2)>9)nDigit-=9;}nCheck+=nDigit;bEven=!bEven;}return(nCheck%10)==0;},accept:function(value,element,param){param=typeof param=="string"?param.replace(/,/g,'|'):"png|jpe?g|gif";return this.optional(element)||value.match(new RegExp(".("+param+")$","i"));},equalTo:function(value,element,param){return value==$(param).val();}}});$.format=$.validator.format;})(jQuery);;(function($){var ajax=$.ajax;var pendingRequests={};$.ajax=function(settings){settings=$.extend(settings,$.extend({},$.ajaxSettings,settings));var port=settings.port;if(settings.mode=="abort"){if(pendingRequests[port]){pendingRequests[port].abort();}return(pendingRequests[port]=ajax.apply(this,arguments));}return ajax.apply(this,arguments);};})(jQuery);;(function($){$.each({focus:'focusin',blur:'focusout'},function(original,fix){$.event.special[fix]={setup:function(){if($.browser.msie)return false;this.addEventListener(original,$.event.special[fix].handler,true);},teardown:function(){if($.browser.msie)return false;this.removeEventListener(original,$.event.special[fix].handler,true);},handler:function(e){arguments[0]=$.event.fix(e);arguments[0].type=fix;return $.event.handle.apply(this,arguments);}};});$.extend($.fn,{delegate:function(type,delegate,handler){return this.bind(type,function(event){var target=$(event.target);if(target.is(delegate)){return handler.apply(target,arguments);}});},triggerEvent:function(type,target){return this.triggerHandler(type,[$.event.fix({type:type,target:target})]);}})})(jQuery);

(function($){$.fn.tipsy=function(opts){opts=$.extend({fade:false,gravity:'n'},opts||{});var tip=null,cancelHide=false;this.hover(function(){$.data(this,'cancel.tipsy',true);var tip=$.data(this,'active.tipsy');if(!tip){tip=$('<div class="tipsy"><div class="tipsy-inner">'+$(this).attr('title')+'</div></div>');tip.css({position:'absolute',zIndex:100000});$(this).attr('title','');$.data(this,'active.tipsy',tip);}
var pos=$.extend({},$(this).offset(),{width:this.offsetWidth,height:this.offsetHeight});tip.remove().css({top:0,left:0,visibility:'hidden',display:'block'}).appendTo(document.body);var actualWidth=tip[0].offsetWidth,actualHeight=tip[0].offsetHeight;switch(opts.gravity.charAt(0)){case'n':tip.css({top:pos.top+pos.height,left:pos.left+pos.width/2-actualWidth/2}).addClass('tipsy-north');break;case's':tip.css({top:pos.top-actualHeight,left:pos.left+pos.width/2-actualWidth/2}).addClass('tipsy-south');break;case'e':tip.css({top:pos.top+pos.height/2-actualHeight/2,left:pos.left-actualWidth}).addClass('tipsy-east');break;case'w':tip.css({top:pos.top+pos.height/2-actualHeight/2,left:pos.left+pos.width}).addClass('tipsy-west');break;}
if(opts.fade){tip.css({opacity:0,display:'block',visibility:'visible'}).animate({opacity:1});}else{tip.css({visibility:'visible'});}},function(){$.data(this,'cancel.tipsy',false);var self=this;setTimeout(function(){if($.data(this,'cancel.tipsy'))return;var tip=$.data(self,'active.tipsy');if(opts.fade){tip.stop().fadeOut(function(){$(this).remove();});}else{tip.remove();}},100);});};})(jQuery);

(function($)
{
	var methods = {
		tinsearchInit: function(override_opts)
		{
	        var opts = $.extend({}, $.fn.tinLogin.defaults, override_opts),
	        obs = this;

			if (!opts.disableDefaultCss && !$('#tinLoginCss').length) {
				dbg('Inserting css... ', true);
				$('<link>').appendTo('head').attr({
			    	id: 'tinLoginCss',
					rel:  'stylesheet',
					type: 'text/css',
					href: $.fn.tinLogin.defaults.baseUrl + 'css/tinlogin.css',
					media: 'screen, projection'
			    });
			}

	        obs.each(function() {
				if (!$(this).data('tinLogin')) {
					initContinue(this, opts);
				}
	        });

	        return obs;
		},

		destroy: function()
		{
			return this.each(function() {
				var $this = $(this);
				var data = $this.data('tinLogin');

				// Namespacing FTW
				$(window).unbind('.tinLogin');
				data.tinLogin.remove();
				$this.removeData('tinLogin');
			})
		}
	};

	$.fn.tinLogin = function(method)
	{
		dbg('tinLogin() ' + $.map(this, function(ob, i) { return $(ob).attr('id'); }).join(','));
		if (methods[method]) {
			methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || ! method) {
			return methods.tinsearchInit.apply(this, arguments);
		} else {
			$.error('Method ' +  method + ' does not exist on jQuery.tinLogin');
		}
	};

	var burl = unescape(window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1));
	switch (burl) {
                case 'http://127.0.0.1/TINsearch':
		case 'http://dev.lucene.nl/':
		case 'http://src.tin.nl/zoek/':
		case 'http://src.tin.nl/test/':
		case 'http://src.tin.nl/search/':
			break;
		default:
			burl = 'http://src.tin.nl/zoek/';
	}

    $.fn.tinLogin.defaults = {
    	baseUrl: burl,
    	proxy: 'tinlogin_proxy.php'
    };

    function initContinue(ob, opts)
    {
    	$(ob).html(
			'<div id="tinLoginTopNav"><a href="javascript:void(0);" id="tinLoginMenuLink"><span id="tinLoginMenuLabel"></span></a></div>'
			+ '<fieldset id="signin_menu" class="menu">'
			+ '	<form id="loginForm" onSubmit="return false;">'
			+ '		<label for="loginForm_emailaddress" class="required">E-mailadres</label>'
			+ '		<input type="text" id="loginForm_emailaddress" name="loginForm_emailaddress" maxlength="250" />'
			+ '		<br style="clear:both" />'
			+ '		<label for="loginForm_password" class="required">Wachtwoord</label>'
			+ '		<input type="password" id="loginForm_password" name="loginForm_password" maxlength="150" />'
			+ '		<br style="clear:both" />'
			+ '		<input type="submit" id="loginForm_submit" value="Inloggen &raquo;" />'
			+ '		<div id="loginResults" class="tinLoginResults"></div>'
			+ '		<br/>'
			+ '		Nieuw hier? <a href="javascript:void(0);" id="createAccount"><span>Registreren</span></a>'
			+ '		<br/><br />'
			+ '		Wachtwoord kwijt? <a href="javascript:void(0);" id="requestPassword"><span>Opnieuw aanvragen</span></a>'
			+ '	</form>'
			+ '</fieldset>'
			+ '<fieldset id="loggedin_menu" class="menu">'
			+ '	<div style="position: relative; margin-top: 9px"><table id="tinLoginProfile" cellpadding="0" cellspacing="0">'
			+ '  <caption>Profiel</caption>'
			+ '	 <tr><td>Voornaam:</td><td id="tinLoginNameFirst"></td></tr>'
			+ '  <tr><td>Achternaam:</td><td id="tinLoginNameLast"></td></tr>'
			+ '  <tr><td>E-mailadres:</td><td id="tinLoginEmailaddress"></td></tr>'
			+ '  <tr><td>Telefoon:</td><td id="tinLoginPhone"></td></tr>'
			+ '  <tr><td>Adres:</td><td id="tinLoginAddress"></td></tr>'
			+ '  <tr><td>Postcode:</td><td id="tinLoginPostalcode"></td></tr>'
			+ '  <tr><td>Plaats:</td><td id="tinLoginCity"></td></tr>'
			+ ' </table></div><br />'
			+ '	<form id="logoutForm" onSubmit="return false;">'
			+ '		Wachtwoord veranderen? <a href="javascript:void(0);" id="changePassword"><span>Nieuw wachtwoord opgeven</span></a>'
			+ '		<br /><br />'
			+ '		<input type="submit" id="logoutForm_submit" value="Uitloggen" />'
			+ '	</form>'
			+ '</fieldset>'
			+ '<fieldset id="changePassword_menu" class="menu">'
			+ '	<form id="changePForm" onSubmit="return false;">'
			+ '		<input type="hidden" id="changePForm_emailaddress" name="changePForm_emailaddress" />'
			+ '		<input type="hidden" id="changePForm_oldpassword" name="changePForm_oldpassword" />'
			+ '		<label for="changePForm_password1" class="required">Nieuw wachtwoord</label>'
			+ '		<input type="password" id="changePForm_password1" name="changePForm_password1" maxlength="150" />'
			+ '		<br style="clear:both" />'
			+ '		<label for="changePForm_password2" class="required">Nieuw wachtwoord (herhalen)</label>'
			+ '		<input type="password" id="changePForm_password2" name="changePForm_password2" maxlength="150" />'
			+ '		<br style="clear:both" />'
			+ '		<input type="button" id="updateForm_annuleren" value="Annuleren" />&nbsp;&nbsp;&nbsp;<input type="submit" id="changePForm_submit" value="Wijzigen  &raquo;" />'
			+ '		<div id="changePResults" class="tinLoginResults"></div>'
			+ '	</form>'
			+ '</fieldset>'
			+ '<fieldset id="createAccount_menu" class="menu">'
			+ '	<form id="createForm" onSubmit="return false;">'
			+ '		<div style="float:left; margin-right: 20px;">'
			+ '			<label for="createForm_nameFirst" class="required">Voornaam</label>'
			+ '	  		<input type="text" id="createForm_nameFirst" name="createForm_nameFirst" maxlength="250" />'
			+ '	  		<label for="createForm_nameLast" class="required">Achternaam</label>'
			+ '	  		<input type="text" id="createForm_nameLast" name="createForm_nameLast" maxlength="250" />'
			+ '	  		<label for="createForm_emailaddress" class="required">E-mailadres</label>'
			+ '	  		<input type="text" id="createForm_emailaddress" name="createForm_emailaddress" maxlength="250" />'
			+ '	  		<label for="createForm_phone" class="required">Telefoon</label>'
			+ '	  		<input type="text" id="createForm_phone" name="createForm_phone" maxlength="75" value="" />'
			+ '	  		<label for="createForm_address" class="required">Adres</label>'
			+ '	  		<input type="text" id="createForm_address" name="createForm_address" maxlength="150" />'
			+ '		</div>'
			+ '		<div style="float:left">'
			+ '	  		<label for="createForm_postalcode" class="required">Postcode</label>'
			+ '	  		<input type="text" id="createForm_postalcode" name="createForm_postalcode" style="width:45px;" maxlength="7" />'
			+ '	  		<label for="createForm_city" class="required">Plaats</label>'
			+ '	  		<input type="text" id="createForm_city" name="createForm_city" maxlength="50" />'
			+ '	  		<label for="createForm_password1" class="required">Wachtwoord</label>'
			+ '	  		<input type="password" id="createForm_password1" name="createForm_password1" maxlength="150" value="" />'
			+ '	  		<label for="createForm_password2" class="required">Herhaal wachtwoord</label>'
			+ '	  		<input type="password" id="createForm_password2" name="createForm_password2" maxlength="150" value="" />'
			+ '		</div><br style="clear:both;" /><br />'
			+ '  	<input type="button" id="createForm_annuleren" value="Annuleren" />&nbsp;&nbsp;&nbsp;<input type="submit" id="createForm_submit" value="Registreren &raquo;" />'
			+ '		<div id="updateResults" class="tinLoginResults"></div>'
			+ '</form>'
			+ '</fieldset>'
			+ '<fieldset id="requestPassword_menu" class="menu">'
			+ '	<form id="requestPForm" onSubmit="return false;">'
			+ '	  	<label for="requestPForm_emailaddress" class="required">E-mailadres</label>'
			+ '	  	<input type="text" id="requestPForm_emailaddress" name="requestPForm_emailaddress" maxlength="250" />'
			+ '	  	<br style="clear:both;" /><br />'
			+ '	  	<input type="button" id="createForm_annuleren" value="Annuleren" />&nbsp;&nbsp;&nbsp;<input type="submit" id="requestPForm_submit" value="Aanvragen &raquo;" />'
			+ '	  	<div id="requestPResults"></div>'
			+ '	</form>'
			+ '</fieldset>'
			+ "\n"
        ).data('tinLogin', {
        	options: opts
        });

		$('#tinLoginMenuLabel').html((email = loggedIn()) ? email : "Inloggen");

		/* Sign in and change password */
		$("#tinLoginMenuLink").live('click', function(e)
		{
		    e.preventDefault();

			var m = (readCookie('emailaddress') && readCookie('password') ? 'loggedin_menu' : 'signin_menu');
			var ob = $("fieldset#" + m);
			hideAll('tinLoginMenuLink');
			if (!$("#tinLoginMenuLink").hasClass('menu-open')) {
				ob.slideDown("slow");
			} else {
				ob.slideUp("slow");
			}
			if (m == 'loggedin_menu') {
				var responseText = $.ajax({
				      url: opts.proxy,
				      global: false,
				      type: "GET",
				      data: ({
				    	  action: 'info',
				    	  id: readCookie("id")
				      }),
				      dataType: "html",
				      async:false
				   }
				).responseText;
				responseObj = jQuery.parseJSON(responseText);
				displayProfile(responseObj);
			}
		    $("#tinLoginMenuLink").toggleClass("menu-open");
		});
		$("fieldset#signin_menu, fieldset#loggedin_menu").mouseup(function() { return false; });
		$("fieldset#changePassword_menu").mouseup(function() { return false; });

		/* create account */
		$("#createAccount").live('click', function(e)
		{
		    e.preventDefault();
			hideAll('createAccount_menu');
			$("fieldset#createAccount_menu").slideDown("slow");
		    //$("#createAccount").toggleClass("menu-open");
		});
		$("fieldset#createAccount_menu").mouseup(function() { return false; });

		/* forgot password */
		$("#requestPassword").live('click', function(e)
		{
		    e.preventDefault();
			hideAll('requestPassword_menu');
			$("fieldset#requestPassword_menu").slideDown("slow");
		    //$("#requestPassword").toggleClass("menu-open");
		});
		$("fieldset#requestPassword_menu").mouseup(function() { return false; });

		/* change password */
		$("#changePassword").live('click', function(e)
		{
		    e.preventDefault();
			hideAll('changePassword_menu');
			$("fieldset#changePassword_menu").slideDown("slow");
		    //$("#requestPassword").toggleClass("menu-open");
		});
		$("fieldset#changePassword_menu").mouseup(function() { return false; });

		$(document).mouseup(function(e)
		{
			/* sign in */
		    if($(e.target).parent("a#tinLoginMenuLink").length==0) {
				$("fieldset#signin_menu, fieldset#loggedin_menu").hide(); //slideUp("fast");
				$("#tinLoginMenuLink").removeClass("menu-open");
		    }

			/* create account */
		    if($(e.target).parent("a#createAccount").length==0) {
				$("fieldset#createAccount_menu").hide(); //.slideUp("slow");
		    }

		    /* forgot password */
		    if($(e.target).parent("a#requestPassword").length==0) {
				$("fieldset#requestPassword_menu").hide(); //.slideUp("slow");
		    }

			/* create account */
		    if($(e.target).parent("a#changePassword").length==0) {
				$("fieldset#changePassword_menu").hide(); //.slideUp("slow");
		    }

		});

		/* VALIDATION */
		jQuery.validator.setDefaults({debug: true, success: "valid"});
		$("#loginForm").validate({
			rules: {
				loginForm_emailaddress: { required: true, email: true },
				loginForm_password: { required: true }
			}
		});
		$("#requestPForm").validate({
			rules: {
				requestPForm_emailaddress: { required: true, email: true }
			}
		});
		$("#changePForm").validate({
			rules: {
				changePForm_password1: { required: true },
				changePForm_password2: { required: true, equalTo: "#changePForm_password1" }
			}
		});
		var validator = $("#createForm").validate({
			rules: {
				createForm_nameFirst: { required: true, minlength: 1 },
				createForm_nameLast: { required: true, minlength: 1 },
				createForm_emailaddress: { required: true, email: true },
				createForm_password1: { required: true },
				createForm_password2: { required: true, equalTo: "#createForm_password1" },
				createForm_address: { required: true },
				createForm_postalcode: { required: true, minlength: 6 },
				createForm_city: { required: true },
				createForm_phone: { required: true }
			}
		});

		$("#deleteForm").validate({
			rules: {
				deleteForm_emailaddress: { required: true, email: true },
				deleteForm_password: { required: true }
			}
		});

		/* SUBMIT */
		//loginform
		$('#loginForm_submit').live('click', function() {
			var responseText = $.ajax({
			      url: opts.proxy,
			      global: false,
			      type: "POST",
			      data: ({
			    	  action: 'login',
			    	  emailaddress: $('#loginForm_emailaddress').val(),
			    	  password: $('#loginForm_password').val()
			      }),
			      dataType: "html",
			      async:false
			   }
			).responseText;
			responseObj = jQuery.parseJSON(responseText);
			displayResults(responseObj, "#loginResults", opts);

			if (opts.login) {
				opts.login();
			}
		});

		//request Password Form
		$('#requestPForm_submit').live('click', function() {
			var responseText = $.ajax({
			      url: opts.proxy,
			      global: false,
			      type: "POST",
			      data: ({
			    	  action: 'requestP',
			    	  emailaddress: $('#requestPForm_emailaddress').val()
			      }),
			      dataType: "html",
			      async:false
			   }
			).responseText;
			responseObj = jQuery.parseJSON(responseText);
			displayResults(responseObj,"#requestPResults");
		});

		//change Password Form
		$('#changePForm_submit').live('click', function() {
			$('#changePForm_emailaddress').val($('#loginForm_emailaddress').val()); //copy the e-mailaddress
			$('#changePForm_oldpassword').val($('#loginForm_password').val()); // copy the old password
			if($('#changePForm_password1').val()!=$('#changePForm_password2').val()) {
				$('#changePResults').addClass('resultsError').html("De twee wachtwoorden zijn niet gelijk.");
			} else {
				$('#changePResults').removeClass('resultsError').html('');
				var responseText = $.ajax({
				      url: opts.proxy,
				      global: false,
				      type: "POST",
				      data: ({
				    	  action: 'changeP',
				    	  id: readCookie('id'),
				    	  emailaddress: $('#changePForm_emailaddress').val(),
				    	  oldpassword: $('#changePForm_oldpassword').val(),
				    	  newpassword: $('#changePForm_password1').val()
				      }),
				      dataType: "html",
				      async:false
				   }
				).responseText;
				responseObj = jQuery.parseJSON(responseText);
				displayResults(responseObj,"#changePResults");
			}
		});

		$('#updateForm_annuleren').live('click', function() {
			hideAll('loggedin_menu');
		});

		//deal with the update
		$('#createForm_submit').live('click', function() {
			var responseText = $.ajax({
			      url: opts.proxy,
			      global: false,
			      type: "POST",
			      data: ({
			    	  action: 'put',
			    	  nameFirst: $('#createForm_nameFirst').val(),
			    	  nameLast: $('#createForm_nameLast').val(),
			    	  emailaddress: $('#createForm_emailaddress').val(),
			    	  password: $('#createForm_password1').val(),
			    	  password: $('#createForm_password2').val(),
			    	  address: $('#createForm_address').val(),
			    	  postalcode: $('#createForm_postalcode').val(),
			    	  city: $('#createForm_city').val(),
			    	  phone: $('#createForm_phone').val()
			      }),
			      dataType: "html",
			      async:false
			   }
			).responseText;
			alert(responseText);
			responseObj = jQuery.parseJSON(responseText);
			displayResults(responseObj, "#updateResults");
		});

		$('#createForm_annuleren').live('click', function() {
			hideAll('signin_menu');
		});

		//deal with the delete
		$('#deleteForm_submit').live('click', function() {
			var responseText = $.ajax({
			      url: opts.proxy,
			      global: false,
			      type: "POST",
			      data: ({
			    	  action: 'delete',
			    	  emailaddress: $('#deleteForm_emailaddress').val(),
			    	  password: $('#deleteForm_password').val()
			      }),
			      dataType: "html",
			      async:false
			   }
			).responseText;
			responseObj = jQuery.parseJSON(responseText);
			displayResults(responseObj,"#deleteResults");
		});

		$('#logoutForm_submit').live('click', function() {
			eraseCookie('id');
			eraseCookie('emailaddress');
			eraseCookie('password');
			$('#tinLoginMenuLabel').html('Inloggen');
			hideAll();
			if (opts.logout) {
				opts.logout();
			}
		});

		//only need force for IE6
		$("#backgroundPopup").css({
			"height": document.documentElement.clientHeight
		});
	}

	function hideAll(except)
	{
		$('#tinLogin fieldset' + (!except ? '' : ':not(#' + except + ')')).hide();
		if (except) {
			$('#' + except).show();
		}
		if (!except) {
			$("#tinLoginMenuLink").removeClass("menu-open");
		}

		return false;
	}

	function showLoggedInMenu(){
		//e.preventDefault();
		hideAll();
		$("fieldset#loggedin_menu").slideDown("slow");
	}

	function createCookie(name,value,days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
	}

	function readCookie(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return decodeURIComponent(c.substring(nameEQ.length,c.length));
		}
		return null;
	}

	function loggedIn() {
		var email = readCookie("emailaddress"), pw = readCookie("password");

		if (!email || !pw) {
			return false;
		}

		return email;
	}

	function eraseCookie(name) {
		createCookie(name, "", -1);
	}

	function displayResults(resultsObj, displayObj)
	{
		if (!resultsObj) {
			return;
		}

		if(resultsObj.result == false) {
			if (resultsObj.error == 'unknown userid/pw') {
				resultsObj.error = 'Ongeldige gebruikersnaam/wachtwoord';
			}
			$(displayObj).addClass('resultsError').html('<br>' + resultsObj.error);

		} else if (resultsObj.registered) {
			$(displayObj).html('<br>Dank u voor uw registratie. U ontvangt een email op het door uw opgegeven emailadres met instructies om uw registratie te activeren.');
		} else if (resultsObj.id) {
			$(displayObj).removeClass("resultsError");

			$('#tinLoginMenuLabel').html(document.getElementById('loginForm_emailaddress').value);

			var inputFields = $('div.tinLoginMenuContent input[type="text"]');
			var pwdFields = $('div.tinLoginMenuContent input[type="password"]');
			for (var i in inputFields){
				inputFields[i].value = "";
			}
			for (var i in pwdFields){
				pwdFields[i].value = "";
			}

			hideAll();
		} else if (resultsObj.changedpw) {
			$(displayObj).removeClass("resultsError").html('<br>Uw wachtwoord is veranderd.');
		}
	}

	function displayProfile(resultsObj)
	{
		if (!resultsObj) {
			return;
		}

		$('#tinLoginNameFirst').text(resultsObj.name);
		$('#tinLoginNameLast').text(resultsObj.surname);
		$('#tinLoginEmailaddress').text(resultsObj.email);
		$('#tinLoginPhone').text(resultsObj.phone);
		$('#tinLoginAddress').text(resultsObj.address);
		$('#tinLoginPostalcode').text(resultsObj.zipCode);
		$('#tinLoginCity').text(resultsObj.city);
	}

	function dbg(str, nobreak)
	{
		return;

		if (!$('#dbg').length) {
			$('<div id="dbg"></div>').prependTo('body');
		}
		$('#dbg').html($('#dbg').html() + str + (!nobreak ? '<br />' : '')).prop({ scrollTop: $("#dbg").prop("scrollHeight") });
	}
})(jQuery);
