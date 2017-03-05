(function(h){function o(D,E,F){var G=this;return this.on("click.pjax",D,function(I){var H=h.extend({},e(E,F));if(!H.container){H.container=h(this).attr("data-pjax")||G}z(I,H)})}function z(G,J,D){D=e(J,D);var F=G.currentTarget;if(F.tagName.toUpperCase()!=="A"){throw"$.fn.pjax or $.pjax.click requires an anchor element"}if(G.which>1||G.metaKey||G.ctrlKey||G.shiftKey||G.altKey){return}if(location.protocol!==F.protocol||location.hostname!==F.hostname){return}if(F.hash&&F.href.replace(F.hash,"")===location.href.replace(location.hash,"")){return}if(F.href===location.href+"#"){return}var H={url:F.href,container:h(F).attr("data-pjax"),target:F};var E=h.extend({},H,D);var I=h.Event("pjax:click");h(F).trigger(I,[E]);if(!I.isDefaultPrevented()){C(E);G.preventDefault()}}function b(D,F,G){G=e(F,G);var H=D.currentTarget;if(H.tagName.toUpperCase()!=="FORM"){throw"$.pjax.submit requires a form element"}var E={type:H.method.toUpperCase(),url:H.action,data:h(H).serializeArray(),container:h(H).attr("data-pjax"),target:H};C(h.extend({},E,G));D.preventDefault()}function C(I){I=h.extend(true,{},h.ajaxSettings,C.defaults,I);if(h.isFunction(I.url)){I.url=I.url()}var G=I.target;var F=A(I.url).hash;var J=I.context=s(I.container);if(!I.data){I.data={}}I.data._pjax=J.selector;function E(L,K){var M=h.Event(L,{relatedTarget:G});J.trigger(M,K);return !M.isDefaultPrevented()}var D;I.beforeSend=function(L,K){if(K.type!=="GET"){K.timeout=0}L.setRequestHeader("X-PJAX","true");L.setRequestHeader("X-PJAX-Container",J.selector);if(!E("pjax:beforeSend",[L,K])){return false}if(K.timeout>0){D=setTimeout(function(){if(E("pjax:timeout",[L,I])){L.abort("timeout")}},K.timeout);K.timeout=0}I.requestUrl=A(K.url).href};I.complete=function(K,L){if(D){clearTimeout(D)}E("pjax:complete",[K,L,I]);E("pjax:end",[K,I])};I.error=function(L,M,O){var N=x("",L,I);var K=E("pjax:error",[L,M,O,I]);if(I.type=="GET"&&M!=="abort"&&K){y(N.url)}};I.success=function(N,M,R){var Q=typeof h.pjax.defaults.version==="function"?h.pjax.defaults.version():h.pjax.defaults.version;var S=R.getResponseHeader("X-PJAX-Version");var L=x(N,R,I);if(Q&&S&&Q!==S){y(L.url);return}if(!L.contents){y(L.url);return}C.state={id:I.id||n(),url:L.url,title:L.title,container:J.selector,fragment:I.fragment,timeout:I.timeout};if(I.push||I.replace){window.history.replaceState(C.state,L.title,L.url)}document.activeElement.blur();if(L.title){document.title=L.title}J.html(L.contents);var O=J.find("input[autofocus], textarea[autofocus]").last()[0];if(O&&document.activeElement!==O){O.focus()}c(L.scripts);if(typeof I.scrollTo==="number"){h(window).scrollTop(I.scrollTo)}if(F!==""){var K=A(L.url);K.hash=F;C.state.url=K.href;window.history.replaceState(C.state,L.title,K.href);var P=h(K.hash);if(P.length){h(window).scrollTop(P.offset().top)}}E("pjax:success",[N,M,R,I])};if(!C.state){C.state={id:n(),url:window.location.href,title:document.title,container:J.selector,fragment:I.fragment,timeout:I.timeout};window.history.replaceState(C.state,document.title)}var H=C.xhr;if(H&&H.readyState<4){H.onreadystatechange=h.noop;H.abort()}C.options=I;var H=C.xhr=h.ajax(I);if(H.readyState>0){if(I.push&&!I.replace){m(C.state.id,J.clone().contents());window.history.pushState(null,"",r(I.requestUrl))}E("pjax:start",[H,I]);E("pjax:send",[H,I])}return C.xhr}function j(D,E){var F={url:window.location.href,push:false,replace:true,scrollTo:false};return C(h.extend(F,e(D,E)))}function y(D){window.history.replaceState(null,"","#");window.location.replace(D)}var l=true;var t=window.location.href;var a=window.history.state;if(a&&a.container){C.state=a}if("state" in window.history){l=false}function d(E){var F=E.state;if(F&&F.container){if(l&&t==F.url){return}if(C.state.id===F.id){return}var I=h(F.container);if(I.length){var G,D=i[F.id];if(C.state){G=C.state.id<F.id?"forward":"back";u(G,C.state.id,I.clone().contents())}var H=h.Event("pjax:popstate",{state:F,direction:G});I.trigger(H);var J={id:F.id,url:F.url,container:I,push:false,fragment:F.fragment,timeout:F.timeout,scrollTo:false};if(D){I.trigger("pjax:start",[null,J]);if(F.title){document.title=F.title}I.html(D);C.state=F;I.trigger("pjax:end",[null,J])}else{C(J)}I[0].offsetHeight}else{y(location.href)}}l=false}function f(G){var F=h.isFunction(G.url)?G.url():G.url,E=G.type?G.type.toUpperCase():"GET";var H=h("<form>",{method:E==="GET"?"GET":"POST",action:F,style:"display:none"});if(E!=="GET"&&E!=="POST"){H.append(h("<input>",{type:"hidden",name:"_method",value:E.toLowerCase()}))}var D=G.data;if(typeof D==="string"){h.each(D.split("&"),function(I,J){var K=J.split("=");H.append(h("<input>",{type:"hidden",name:K[0],value:K[1]}))})}else{if(typeof D==="object"){for(key in D){H.append(h("<input>",{type:"hidden",name:key,value:D[key]}))}}}h(document.body).append(H);H.submit()}function n(){return new Date().getTime()}function r(D){return D.replace(/\?_pjax=[^&]+&?/,"?").replace(/_pjax=[^&]+&?/,"").replace(/[\?&]$/,"")}function A(E){var D=document.createElement("a");D.href=E;return D}function e(D,E){if(D&&E){E.container=D}else{if(h.isPlainObject(D)){E=D}else{E={container:D}}}if(E.container){E.container=s(E.container)}return E}function s(D){D=h(D);if(!D.length){throw"no pjax container for "+D.selector}else{if(D.selector!==""&&D.context===document){return D}else{if(D.attr("id")){return h("#"+D.attr("id"))}else{throw"cant get selector for pjax container!"}}}}function p(E,D){return E.filter(D).add(E.find(D))}function v(D){return h.parseHTML(D,document,true)}function x(E,G,J){var F={};F.url=r(G.getResponseHeader("X-PJAX-URL")||J.requestUrl);if(/<html/i.test(E)){var I=h(v(E.match(/<head[^>]*>([\s\S.]*)<\/head>/i)[0]));var D=h(v(E.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0]))}else{var I=D=h(v(E))}if(D.length===0){return F}F.title=p(I,"title").last().text();if(J.fragment){if(J.fragment==="body"){var H=D}else{var H=p(D,J.fragment).first()}if(H.length){F.contents=H.contents();if(!F.title){F.title=H.attr("title")||H.data("title")}}}else{if(!/<html/i.test(E)){F.contents=D}}if(F.contents){F.contents=F.contents.not(function(){return h(this).is("title")});F.contents.find("title").remove();F.scripts=p(F.contents,"script[src]").remove();F.contents=F.contents.not(F.scripts)}if(F.title){F.title=h.trim(F.title)}return F}function c(D){if(!D){return}var E=h("script[src]");D.each(function(){var G=this.src;var H=E.filter(function(){return this.src===G});if(H.length){return}var F=document.createElement("script");F.type=h(this).attr("type");F.src=h(this).attr("src");document.head.appendChild(F)})}var i={};var w=[];var k=[];function m(E,D){i[E]=D;k.push(E);while(w.length){delete i[w.shift()]}while(k.length>C.defaults.maxCacheLength){delete i[k.shift()]}}function u(H,E,G){var D,F;i[E]=G;if(H==="forward"){D=k;F=w}else{D=w;F=k}D.push(E);if(E=F.pop()){delete i[E]}}function B(){return h("meta").filter(function(){var D=h(this).attr("http-equiv");return D&&D.toUpperCase()==="X-PJAX-VERSION"}).attr("content")}function q(){h.fn.pjax=o;h.pjax=C;h.pjax.enable=h.noop;h.pjax.disable=g;h.pjax.click=z;h.pjax.submit=b;h.pjax.reload=j;h.pjax.defaults={timeout:650,push:true,replace:false,type:"GET",dataType:"html",scrollTo:0,maxCacheLength:20,version:B};h(window).on("popstate.pjax",d)}function g(){h.fn.pjax=function(){return this};h.pjax=f;h.pjax.enable=q;h.pjax.disable=h.noop;h.pjax.click=h.noop;h.pjax.submit=h.noop;h.pjax.reload=function(){window.location.reload()};h(window).off("popstate.pjax",d)}if(h.inArray("state",h.event.props)<0){h.event.props.push("state")}h.support.pjax=window.history&&window.history.pushState&&window.history.replaceState&&!navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]|WebApps\/.+CFNetwork)/);h.support.pjax?q():g()})(jQuery);
