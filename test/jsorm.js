/*
 * Copyright © Atomic Inc 2007-2009
 * http://jsorm.com
 *
 * This file contains work that is copyrighted and is distributed under the Apache License version 2.0. 
 * 
 * Copyright 2007-2011 Atomic Inc

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

 * 
 * These libraries contains work written and published by Douglas Crockford www.crockford.com. 
 * Page xii of "JavaScript: The Good Parts" ISBN 978-0-596-51774-8 explicitly states that
 * "writing a program that uses several chunks of code from this book does not require permission."
 * To use any code in these libraries that comes from that work requires reference to the original license.
 * 
 * Version: 1.3
 */


(function(exports){exports.version="1.3";Array.prototype.isArray=true;Array.prototype.pushAll=function(a){a=[].concat(a);Array.prototype.push.apply(this,a);};Array.prototype.insert=function(i,elm){Array.prototype.splice.apply(this,[].concat(i,0,elm));};Array.prototype.clear=function(){Array.prototype.splice.apply(this,[0]);};Array.prototype.replace=function(elm){this.clear();this.pushAll(elm);};Array.prototype.hasher=function(){var i,len,h={};for(i=0,len=this.length;i<len;i++){h[this[i]]=i;}
return(h);};Array.prototype.indexOf=function(elm){var i,len,found=false;for(i=0,len=this.length;i<len;i++){if(this[i]===elm){found=true;break;}}
return(found?i:-1);};Array.prototype.remove=function(elm){var i=this.indexOf(elm);if(i>=0){this.splice(i,1);}};exports.clear=function(o){var i;for(i in o){if(o.hasOwnProperty(i)&&typeof(i)!=="function"){delete o[i];}}};exports.apply=function(target,source,fields){var prp;source=source&&typeof(source)==="object"?source:{};fields=fields&&typeof(fields)==="object"?fields:source;target=target||{};for(prp in fields){if(fields.hasOwnProperty(prp)&&source.hasOwnProperty(prp)){target[prp]=source[prp];}}
return(target);};exports.common=function(a,b,keys){var i,c={};if(a&&typeof(a)==="object"&&b&&typeof(b)==="object"){for(i in a){if(typeof(a[i])!=="function"&&typeof(b[i])===typeof(a[i])&&(keys||a[i]===b[i])){c[i]=a[i];}}}
return(c);};exports.first=function(){var ret=null,i,len;for(i=0,len=arguments.length;i<len;i++){if(arguments[i]!==undefined){ret=arguments[i];break;}}
return(ret);};exports.compare=function(a,b){var ident=false,i,len,compare=exports.compare;if(a===b){return(true);}
else if(a.isArray&&b.isArray){len=a.length;if(len!==b.length){return(false);}
for(i=0;i<len;i++){if(!compare(a[i],b[i])){return(false);}}
return(true);}else if(typeof(a)==="object"&&typeof(b)==="object"){for(i in a){if(a.hasOwnProperty(i)&&!compare(a[i],b[i])){return(false);}}
for(i in b){if(b.hasOwnProperty(i)&&!compare(a[i],b[i])){return(false);}}
return(true);}else{return(false);}};exports.clone=(function(){var c;c=function(obj,deep){var newObj,prp,rec,type;if(typeof(obj)==="object"&&obj!==null){newObj=new obj.constructor();for(prp in obj){if(obj.hasOwnProperty(prp)&&(type=typeof(rec=obj[prp]))!=="function"){if(type==="object"&&deep){newObj[prp]=c(rec);}else{newObj[prp]=rec;}}}}else{newObj=obj;}
return(newObj);};return(c);}());exports.iclone=function(obj,deep){var newObj,child,o,prp,rec,type,stack=[],newP=[],children;stack.push({o:obj,p:null});newP.push(new obj.constructor());while(stack.length>0){obj=stack[stack.length-1];if(!obj.hasOwnProperty("c")){children=[];o=obj.o;for(prp in o){if(o.hasOwnProperty(prp)&&(type=typeof(rec=o[prp]))!=="function"){if(type==="object"&&deep){children.push({o:rec,p:prp});}else{newP[newP.length-1][prp]=rec;}}}
obj.c=children;}
if(obj.c.length>0){child=obj.c.shift();stack.push(child);newP.push(new child.o.constructor());}else{stack.pop();newObj=newP.pop();if(stack.length>0){newP[newP.length-1][obj.p]=newObj;}}}
return(newObj);};exports.zeropad=function(n,l){var ret,d,i;ret=n===null||n===undefined?'':n.toString();d=l-ret.length;if(d>0){for(i=0;i<d;i++){ret='0'+ret;}}
return(ret);};exports.fork=(function(){var fork,window=this,t;if(window&&window.setTimeout&&typeof(window.setTimeout)==="function"){fork=function(f){window.setTimeout(f,1);};}else if(java&&java.lang&&java.lang.Thread&&typeof(java.lang.Thread)==="function"){fork=function(f){t=new java.lang.Thread(new java.lang.Runnable({run:function(){f();}})).start();};}else{fork=null;}
return(fork?function(conf){var f=conf.fn,scope=conf.scope,arg=[].concat(conf.arg);fork(function(){f.apply(scope,arg);});}:fork);}());exports.ajax=function(arg){var url=arg.url,callback=arg.callback,scope=arg.scope,options=arg.options,xmlHttp,method=arg.method||"GET",params=arg.params,pstr=null,i,h;try{xmlHttp=new window.XMLHttpRequest();}catch(e0){try{xmlHttp=new window.ActiveXObject("Msxml2.XMLHTTP");}catch(e1){try{xmlHttp=new window.ActiveXObject("Microsoft.XMLHTTP");}catch(e2){exports.fork({fn:callback,scope:scope,arg:[url,xmlHttp,false,options,"Your environment does not support AJAX!"]});}}}
h=xmlHttp;xmlHttp.onreadystatechange=function(){var success;if(h.readyState===4){success=h.status===200||(document.location.protocol==='file:');callback.apply(scope,[url,h,success,options]);}};try{xmlHttp.open(method,url,true);if(params){if(typeof(params)==="string"){pstr=params;}else if(typeof(params)==="object"){pstr=[];for(i in params){if(params.hasOwnProperty(i)){pstr.push(i+"="+arg.params[i]);}}
pstr=pstr.join("&");}else{pstr=null;}}
xmlHttp.send(pstr);}catch(e3){options=options||{};options.e=e3;exports.fork({fn:callback,scope:scope,arg:[url,xmlHttp,false,options]});}};exports.extend=function(parent,constr,stat){var ret,proto;if(!parent){parent={};}else if(typeof parent==='object'){proto=parent;}else{proto=parent.prototype;}
ret=function(){var F=function(){},that;F.prototype=proto;that=new F();that.superclass=proto;that.myclass=ret;if(constr!==null&&typeof(constr)==='function'){constr.apply(that,arguments);}
return(that);};if(stat){exports.apply(ret,stat);}
return ret;};exports.eventualize=function(that){var registry={};that.fire=function(event,params){var array,func,handler,i,len,pass=true,ret,p,type=typeof(event)==='string'?event:event.type;if(registry.hasOwnProperty(type)){array=registry[type];for(i=0,len=array.length;i<len;i++){handler=array[i];func=handler.method;p=exports.apply({},handler.parameters);exports.apply(p,params);p.launcher=this;ret=func.apply(handler.scope,[p]);if(ret===false){pass=false;}}}
return(pass);};that.on=function(type,method,parameters,scope){var handler={method:method,parameters:parameters,scope:scope};if(registry.hasOwnProperty(type)&&method&&typeof(method)==="function"){registry[type].push(handler);}
return(this);};that.off=function(type,method,parameters){var array,i;if(registry.hasOwnProperty(type)){array=registry[type];for(i=0;i<array.length;i++){if(array[i].method===method&&array[i].parameters===parameters){registry.splice(i,1);break;}}}
return(this);};that.events=function(){var i;for(i=0;i<arguments.length;i++){registry[arguments[i]]=[];}};that.nonevents=function(){var i;for(i=0;i<arguments.length;i++){delete registry[arguments[i]];}};return(that);};}(typeof(module)==="undefined"||typeof(module.exports)==="undefined"?(this.JSORM===undefined||this.JSORM===null?this.JSORM={}:this.JSORM):module.exports));