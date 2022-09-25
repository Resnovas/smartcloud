"use strict";(self.webpackChunksmartcloud=self.webpackChunksmartcloud||[]).push([[5446],{3905:function(e,n,t){t.d(n,{Zo:function(){return c},kt:function(){return m}});var r=t(7294);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function a(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,r,i=function(e,n){if(null==e)return{};var t,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var s=r.createContext({}),d=function(e){var n=r.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):a(a({},n),e)),t},c=function(e){var n=d(e.components);return r.createElement(s.Provider,{value:n},e.children)},u={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},p=r.forwardRef((function(e,n){var t=e.components,i=e.mdxType,o=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),p=d(t),m=i,f=p["".concat(s,".").concat(m)]||p[m]||u[m]||o;return t?r.createElement(f,a(a({ref:n},c),{},{components:t})):r.createElement(f,a({ref:n},c))}));function m(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var o=t.length,a=new Array(o);a[0]=p;var l={};for(var s in n)hasOwnProperty.call(n,s)&&(l[s]=n[s]);l.originalType=e,l.mdxType="string"==typeof e?e:i,a[1]=l;for(var d=2;d<o;d++)a[d]=t[d];return r.createElement.apply(null,a)}return r.createElement.apply(null,t)}p.displayName="MDXCreateElement"},783:function(e,n,t){t.r(n),t.d(n,{assets:function(){return c},contentTitle:function(){return s},default:function(){return m},frontMatter:function(){return l},metadata:function(){return d},toc:function(){return u}});var r=t(7462),i=t(3366),o=(t(7294),t(3905)),a=["components"],l={id:"internal.SharedConventionsConfig",title:"Interface: SharedConventionsConfig",sidebar_label:"SharedConventionsConfig",custom_edit_url:null},s=void 0,d={unversionedId:"smartcloud/interfaces/internal.SharedConventionsConfig",id:"smartcloud/interfaces/internal.SharedConventionsConfig",title:"Interface: SharedConventionsConfig",description:"internal.SharedConventionsConfig",source:"@site/docs/smartcloud/interfaces/internal.SharedConventionsConfig.md",sourceDirName:"smartcloud/interfaces",slug:"/smartcloud/interfaces/internal.SharedConventionsConfig",permalink:"/smartcloud/docs/smartcloud/interfaces/internal.SharedConventionsConfig",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"internal.SharedConventionsConfig",title:"Interface: SharedConventionsConfig",sidebar_label:"SharedConventionsConfig",custom_edit_url:null},sidebar:"release",previous:{title:"Sections",permalink:"/smartcloud/docs/smartcloud/interfaces/internal.Sections"},next:{title:"Stale",permalink:"/smartcloud/docs/smartcloud/interfaces/internal.Stale"}},c={},u=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"condition",id:"condition",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"contexts",id:"contexts",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"failedComment",id:"failedcomment",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"requires",id:"requires",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-3",level:4}],p={toc:u};function m(e){var n=e.components,t=(0,i.Z)(e,a);return(0,o.kt)("wrapper",(0,r.Z)({},p,t,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"/smartcloud/docs/smartcloud/modules/internal"},"internal"),".SharedConventionsConfig"),(0,o.kt)("p",null,"Conventions to use"),(0,o.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},(0,o.kt)("a",{parentName:"p",href:"/smartcloud/docs/smartcloud/interfaces/SharedConventionConditions"},(0,o.kt)("inlineCode",{parentName:"a"},"SharedConventionConditions"))),(0,o.kt)("p",{parentName:"li"},"\u21b3 ",(0,o.kt)("strong",{parentName:"p"},(0,o.kt)("inlineCode",{parentName:"strong"},"SharedConventionsConfig"))))),(0,o.kt)("h2",{id:"properties"},"Properties"),(0,o.kt)("h3",{id:"condition"},"condition"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("strong",{parentName:"p"},"condition"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,o.kt)("a",{parentName:"p",href:"../#condition"},(0,o.kt)("inlineCode",{parentName:"a"},"Condition")),"[]"),(0,o.kt)("p",null,'The conditions required for this to succeed. You can use the "semanticTitle" to automatically apply thses conditions'),(0,o.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"/smartcloud/docs/smartcloud/interfaces/SharedConventionConditions"},"SharedConventionConditions"),".",(0,o.kt)("a",{parentName:"p",href:"/smartcloud/docs/smartcloud/interfaces/SharedConventionConditions#condition"},"condition")),(0,o.kt)("h4",{id:"defined-in"},"Defined in"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/conditions/index.ts#L182"},"src/conditions/index.ts:182")),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"contexts"},"contexts"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,o.kt)("strong",{parentName:"p"},"contexts"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"string"),"[]"),(0,o.kt)("p",null,'The contexts to use. Use this in combernation with "semanticTitle"'),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},(0,o.kt)("inlineCode",{parentName:"strong"},"Requires"))),(0,o.kt)("p",null,'conditions: "semanticTitle"'),(0,o.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/conventions.ts#L48"},"src/contexts/methods/conventions.ts:48")),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"failedcomment"},"failedComment"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("strong",{parentName:"p"},"failedComment"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"string")),(0,o.kt)("p",null,"The failed comment to use"),(0,o.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/conventions.ts#L43"},"src/contexts/methods/conventions.ts:43")),(0,o.kt)("hr",null),(0,o.kt)("h3",{id:"requires"},"requires"),(0,o.kt)("p",null,"\u2022 ",(0,o.kt)("strong",{parentName:"p"},"requires"),": ",(0,o.kt)("inlineCode",{parentName:"p"},"number")),(0,o.kt)("p",null,"The number of requires needed for this to succeed"),(0,o.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"/smartcloud/docs/smartcloud/interfaces/SharedConventionConditions"},"SharedConventionConditions"),".",(0,o.kt)("a",{parentName:"p",href:"/smartcloud/docs/smartcloud/interfaces/SharedConventionConditions#requires"},"requires")),(0,o.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/conditions/index.ts#L178"},"src/conditions/index.ts:178")))}m.isMDXComponent=!0}}]);