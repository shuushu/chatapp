(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-e123192c","chunk-0714cbc6"],{"1c8f":function(t,e,a){"use strict";a.r(e);var i=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"page",class:{invite:t.chatMember},attrs:{id:"memberList"}},[t.isLoading?a("div",{staticClass:"wrap-center"},[a("md-progress-spinner",{attrs:{"md-diameter":50,"md-mode":"indeterminate"}})],1):a("div",[null===t.member?a("div",{staticClass:"md-empty-state-wrap"},[a("md-empty-state",{staticClass:"md-primary",attrs:{"md-icon":"sentiment_dissatisfied","md-label":"Nothing in Done","md-description":"대화 가능 한 멤버 없음"}})],1):a("md-list",t._l(t.fetchData,function(e,i){return a("div",{key:i},[t.auth.uid!=i?a("md-list-item",{staticClass:"md-triple-line md-dense"},[a("md-checkbox",{attrs:{disabled:e.disabled,value:e.uid},model:{value:t.checkArr,callback:function(e){t.checkArr=e},expression:"checkArr"}}),a("md-avatar",[a("img",{attrs:{src:e.photoURL,alt:e.displayName}})]),a("div",{staticClass:"md-list-item-text"},[a("span",{staticClass:"title"},[t._v(t._s(e.displayName))]),a("span",{staticClass:"desc"},[t._v(t._s(e.email))])])],1):t._e()],1)}),0),a("div",{class:{btnWrap:t.chatMember}},[t.checkArr.length>0?a("md-button",{staticClass:"join md-raised md-accent",on:{click:function(e){return t.memberJoin()}}},[a("md-icon",{staticClass:"md-primary"},[t._v("people")]),t._v(" JOIN\n        ")],1):t._e(),t.chatMember?a("md-button",{staticClass:"join md-raised md-primary",on:{click:function(e){return t.toggle()}}},[a("md-icon",{staticClass:"md-primary"},[t._v("cancel")]),t._v(" cancel\n        ")],1):t._e()],1)],1)])},n=[],s=a("cebc"),r=a("2f62"),c=a("b0b0"),o=a("325c"),l={name:"Member",data:function(){return{checkArr:[],temp:null}},props:{chatMember:{type:Array}},computed:Object(s["a"])({fetchData:function(){return this.chatMember?this.filter(this.member,this.chatMember):this.member}},Object(r["c"])({auth:function(t){return t.auth},isLoading:function(t){return t.ready},member:function(t){return t.member.memberList}}),Object(r["b"])({filter:c["c"].SET_FILTER})),created:function(){this.$run(c["c"].GET_MEMBER)},methods:{toggle:function(){this.$run("invite")},memberJoin:function(){var t=this;this.chatMember?(this.$run("dialogAlert",{message:"초대하였습니다."}),this.checkArr=this.checkArr.concat(this.chatMember)):this.checkArr.push(this.auth.uid),this.$run(c["c"].SET_JOIN,this.checkArr).then(function(e){t.$router.push("/message/".concat(e));var a=Object(o["d"])(new Date);if(t.chatMember){var i={key:e,today:a};null===t.member?t.$router.push("/list"):(t.$run(c["a"].GET_CHAT_MEMBER,i),t.$run(c["a"].GET_CHAT_DATE,i).then(function(e){e&&(t.$run(c["a"].GET_MESSAGE,i),t.$run(c["a"].GET_OLD_MESSAGE,i),t.toggle())}))}})}}},u=l,m=(a("8cb3"),a("2877")),d=Object(m["a"])(u,i,n,!1,null,null,null);e["default"]=d.exports},"3f48":function(t,e,a){"use strict";var i=a("e729"),n=a.n(i);n.a},5118:function(t,e,a){(function(t){var i="undefined"!==typeof t&&t||"undefined"!==typeof self&&self||window,n=Function.prototype.apply;function s(t,e){this._id=t,this._clearFn=e}e.setTimeout=function(){return new s(n.call(setTimeout,i,arguments),clearTimeout)},e.setInterval=function(){return new s(n.call(setInterval,i,arguments),clearInterval)},e.clearTimeout=e.clearInterval=function(t){t&&t.close()},s.prototype.unref=s.prototype.ref=function(){},s.prototype.close=function(){this._clearFn.call(i,this._id)},e.enroll=function(t,e){clearTimeout(t._idleTimeoutId),t._idleTimeout=e},e.unenroll=function(t){clearTimeout(t._idleTimeoutId),t._idleTimeout=-1},e._unrefActive=e.active=function(t){clearTimeout(t._idleTimeoutId);var e=t._idleTimeout;e>=0&&(t._idleTimeoutId=setTimeout(function(){t._onTimeout&&t._onTimeout()},e))},a("6017"),e.setImmediate="undefined"!==typeof self&&self.setImmediate||"undefined"!==typeof t&&t.setImmediate||this&&this.setImmediate,e.clearImmediate="undefined"!==typeof self&&self.clearImmediate||"undefined"!==typeof t&&t.clearImmediate||this&&this.clearImmediate}).call(this,a("c8ba"))},6017:function(t,e,a){(function(t,e){(function(t,a){"use strict";if(!t.setImmediate){var i,n=1,s={},r=!1,c=t.document,o=Object.getPrototypeOf&&Object.getPrototypeOf(t);o=o&&o.setTimeout?o:t,"[object process]"==={}.toString.call(t.process)?f():h()?p():t.MessageChannel?g():c&&"onreadystatechange"in c.createElement("script")?v():b(),o.setImmediate=l,o.clearImmediate=u}function l(t){"function"!==typeof t&&(t=new Function(""+t));for(var e=new Array(arguments.length-1),a=0;a<e.length;a++)e[a]=arguments[a+1];var r={callback:t,args:e};return s[n]=r,i(n),n++}function u(t){delete s[t]}function m(t){var e=t.callback,i=t.args;switch(i.length){case 0:e();break;case 1:e(i[0]);break;case 2:e(i[0],i[1]);break;case 3:e(i[0],i[1],i[2]);break;default:e.apply(a,i);break}}function d(t){if(r)setTimeout(d,0,t);else{var e=s[t];if(e){r=!0;try{m(e)}finally{u(t),r=!1}}}}function f(){i=function(t){e.nextTick(function(){d(t)})}}function h(){if(t.postMessage&&!t.importScripts){var e=!0,a=t.onmessage;return t.onmessage=function(){e=!1},t.postMessage("","*"),t.onmessage=a,e}}function p(){var e="setImmediate$"+Math.random()+"$",a=function(a){a.source===t&&"string"===typeof a.data&&0===a.data.indexOf(e)&&d(+a.data.slice(e.length))};t.addEventListener?t.addEventListener("message",a,!1):t.attachEvent("onmessage",a),i=function(a){t.postMessage(e+a,"*")}}function g(){var t=new MessageChannel;t.port1.onmessage=function(t){var e=t.data;d(e)},i=function(e){t.port2.postMessage(e)}}function v(){var t=c.documentElement;i=function(e){var a=c.createElement("script");a.onreadystatechange=function(){d(e),a.onreadystatechange=null,t.removeChild(a),a=null},t.appendChild(a)}}function b(){i=function(t){setTimeout(d,0,t)}}})("undefined"===typeof self?"undefined"===typeof t?this:t:self)}).call(this,a("c8ba"),a("43622"))},"69c2":function(t,e,a){"use strict";var i=a("6ebc"),n=a.n(i);n.a},"6ebc":function(t,e,a){},"8cb3":function(t,e,a){"use strict";var i=a("f45f"),n=a.n(i);n.a},c9ac:function(t,e,a){"use strict";a.r(e);var i=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"page",class:{inviteWrap:t.invite},attrs:{id:"message"}},[t.isLoading?a("div",{staticClass:"wrap-center"},[a("md-progress-spinner",{attrs:{"md-diameter":50,"md-mode":"indeterminate"}})],1):a("div",{staticClass:"message-wrap",style:"min-height:"+(t.deviceHeight-80)+"px"},[t._l(t.oldMsg,function(e,i){return a("div",{key:"old-"+i,staticClass:"old-items"},t._l(e,function(e,i){return a("div",{key:"old-item-"+i,staticClass:"talk-items",class:t.isWrite(e.write)},["notice"!=t.isWrite(e.write)?a("div",{staticClass:"img-wrap"},[a("md-avatar",[a("img",{attrs:{src:t.mappingAvatar(e.write),alt:t.mappingUserName(e.write)}})]),a("span",{staticClass:"name"},[t._v(t._s(t.mappingUserName(e.write)))])],1):t._e(),a("div",{staticClass:"talk-wrap"},[a("Talkbox",{class:t.isWrite(e.write)},[1===e.type?a("div",{staticClass:"addfile-image"},[a("img",{attrs:{src:e.path,alt:""}})]):t._e(),e.vhtml?a("span",{domProps:{innerHTML:t._s(e.text)}}):a("span",[t._v(t._s(e.text))])])],1)])}),0)}),t._l(t.message,function(e,i){return a("div",{key:i,staticClass:"talk-items",class:t.isWrite(e.write)},["notice"!=t.isWrite(e.write)?a("div",{staticClass:"img-wrap"},[a("md-avatar",[a("img",{attrs:{src:t.mappingAvatar(e.write),alt:t.mappingUserName(e.write)}})]),a("span",{staticClass:"name"},[t._v(t._s(t.mappingUserName(e.write)))])],1):t._e(),a("div",{staticClass:"talk-wrap"},[a("Talkbox",{class:t.isWrite(e.write)},[1===e.type?a("div",{staticClass:"addfile-image"},[a("img",{attrs:{src:e.path,alt:""}})]):t._e(),e.vhtml?a("span",{domProps:{innerHTML:t._s(e.text)}}):a("span",[t._v(t._s(e.text))]),e.unread?a("span",{staticClass:"unread"},[t._v("\n                "+t._s(t.sunUnread(e.unread))+" \n              ")]):t._e()])],1)])})],2),t.pgr>0&&t.pgr<100?a("div",{staticClass:"upload-progress"},[a("md-progress-spinner",{staticClass:"md-accent",attrs:{"md-mode":"determinate","md-value":t.pgr}})],1):t._e(),a("transition",{attrs:{name:"popmember"}},[t.invite?a("Member",{attrs:{chatMember:t.chatMember}}):t._e()],1),a("transition",{attrs:{name:"msgAlarm"}},[!0===t.tipFlag&&!1!==t.latest?a("div",{staticClass:"alarmLayer"},[a("div",{staticClass:"wrap"},[a("md-avatar",[a("img",{attrs:{src:t.member[t.latest.write].photoURL,alt:t.member[t.latest.write].displayName}})]),a("span",{staticClass:"name"},[t._v(t._s(t.member[t.latest.write].displayName))]),a("span",{staticClass:"text"},[t._v(t._s(t.latest.text))])],1)]):t._e()])],1)},n=[],s=a("795b"),r=a.n(s),c=a("cebc"),o=a("2f62"),l=a("b0b0"),u=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"talkBox",class:{old:t.old,notice:t.notice,right:t.right}},[a("div",{staticClass:"wrap"},[t._t("default")],2)])},m=[],d={name:"Talkbox",props:{old:{type:Boolean,default:!1},notice:{type:Boolean,default:!1},right:{type:Boolean,default:!1}}},f=d,h=(a("69c2"),a("2877")),p=Object(h["a"])(f,u,m,!1,null,null,null),g=p.exports,v=a("1c8f"),b=a("56d7"),_=a("325c"),y=a("5118"),T={name:"Message",components:{Talkbox:g,Member:v["default"]},data:function(){return{tipFlag:!1,roomkey:null,scrollFlag:!1}},computed:Object(c["a"])({},Object(o["c"])({latest:function(t){return t.chat.latest},invite:function(t){return t.invite},auth:function(t){return t.auth},isLoading:function(t){return t.ready},message:function(t){return t.chat.message},oldMsg:function(t){return t.chat.oldMsg},member:function(t){return t.member.memberList},chatMember:function(t){return t.chat.chatMember},chatDate:function(t){return t.chat.chatDate},pgr:function(t){return t.chat.progress},deviceHeight:function(t){return t.height}})),watch:{message:function(){var t=this;Object(y["setTimeout"])(function(){if(!1!==t.latest&&t.auth.uid!==t.latest.writer){var e=t.scrollToEnd();!1===e&&(t.tipFlag=!0,Object(y["setTimeout"])(function(){t.tipFlag=!1},2e3))}},300)}},destroyed:function(){b["EventBus"].$off("sendMessage"),this.$run(l["a"].ROOMOUT,this.roomkey),this.$run(l["a"].REMOVE_LATEST,this.roomkey)},created:function(){var t=this;this.roomkey=this.$route.params.id;var e={key:this.roomkey,today:Object(_["d"])(new Date)};b["EventBus"].$on("sendMessage",function(e){e&&t.sendMsg(e)}),null===this.member?this.$router.push("/list"):(this.$run(l["a"].SET_LATEST,e),this.$run(l["a"].GET_CHAT_MEMBER,e),this.$run(l["a"].GET_CHAT_DATE,e).then(function(a){a&&(t.$run(l["a"].GET_MESSAGE,e),t.$run(l["a"].GET_OLD_MESSAGE,e))}))},updated:function(){var t=this;this.scrollFlag||(Object(y["setTimeout"])(function(){t.scrollToEnd(!0)},1e3),this.scrollFlag=!0)},methods:{sunUnread:function(t){var e=0;for(var a in t)e+=t[a];if(e>0)return e},scrollToEnd:function(t){var e=this.$el.querySelector(".message-wrap"),a=document.querySelector("html"),i=document.querySelector("body"),n=this.deviceHeight,s=Object(_["a"])(n,e);return(s||t)&&(a.scrollTop=e.scrollHeight,i.scrollTop=e.scrollHeight),s},historyBack:function(){this.$router.go(-1)},sendMsg:function(t){var e=this;t.key=this.$route.params.id,t.write=this.auth.uid,new r.a(function(a){t.addFile?e.$run(l["a"].ADD_IMAGE,t.addFile).then(function(i){t.path=i,t.type=1,e.$run(l["a"].SEND_MESSAGE,t),a(!0)}):(e.$run(l["a"].SEND_MESSAGE,t),a(!0))}).then(function(t){t?(b["EventBus"].$emit("sendResult",!0),e.scrollToEnd(!0)):e.$run("dialogAlert",{message:"Error"})})},mappingAvatar:function(t){return this.auth.uid===t?this.auth.photoURL:this.member[t].photoURL},mappingUserName:function(t){return this.auth.uid===t?this.auth.displayName:"admin"!==t?this.member[t].displayName:t},isWrite:function(t){return"admin"===t?"notice":this.auth.uid===t?"left":"right"},handleChange:function(t){var e=this;if(t.target.value){var a=new FileReader;a.readAsDataURL(t.target.files[0]),a.onload=function(){e.thumb=a.result},this.addFile=t.target.files[0]}},clear:function(){this.addFile="",this.thumb=""}}},E=T,M=(a("3f48"),Object(h["a"])(E,i,n,!1,null,null,null));e["default"]=M.exports},e729:function(t,e,a){},f45f:function(t,e,a){}}]);
//# sourceMappingURL=chunk-e123192c.96bca734.js.map